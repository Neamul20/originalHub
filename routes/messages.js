const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimit');
const config = require('../config');

// GET /api/messages/threads – list all conversation threads for current user
router.get('/threads', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         LEAST(m.from_user_id, m.to_user_id) AS user1_id,
         GREATEST(m.from_user_id, m.to_user_id) AS user2_id,
         m.product_id,
         p.title as product_title,
         p.status as product_status,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=m.product_id ORDER BY pi.sort_order LIMIT 1) as product_thumbnail,
         MAX(m.created_at) AS last_message_at,
         COUNT(m.id) AS message_count,
         SUM(CASE WHEN m.is_read=FALSE AND m.to_user_id=$1 THEN 1 ELSE 0 END) AS unread_count,
         (SELECT msg.message FROM messages msg
          WHERE ((msg.from_user_id=m.from_user_id AND msg.to_user_id=m.to_user_id)
              OR (msg.from_user_id=m.to_user_id AND msg.to_user_id=m.from_user_id))
          AND msg.product_id=m.product_id
          ORDER BY msg.created_at DESC LIMIT 1) as last_message,
         CASE WHEN LEAST(m.from_user_id, m.to_user_id)=$1
              THEN u2.full_name ELSE u1.full_name END as other_user_name,
         CASE WHEN LEAST(m.from_user_id, m.to_user_id)=$1
              THEN GREATEST(m.from_user_id, m.to_user_id)
              ELSE LEAST(m.from_user_id, m.to_user_id) END as other_user_id
       FROM messages m
       JOIN products p ON p.id = m.product_id
       JOIN users u1 ON u1.id = LEAST(m.from_user_id, m.to_user_id)
       JOIN users u2 ON u2.id = GREATEST(m.from_user_id, m.to_user_id)
       WHERE m.from_user_id=$1 OR m.to_user_id=$1
       GROUP BY user1_id, user2_id, m.product_id, p.title, p.status, u1.full_name, u2.full_name
       ORDER BY last_message_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/unread/count – unread message count (MUST be before /:productId/:otherUserId)
router.get('/unread/count', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE to_user_id=$1 AND is_read=FALSE',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages/block – block a user (MUST be before /:productId/:otherUserId)
router.post('/block', requireAuth, async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    if (parseInt(user_id) === req.user.id)
      return res.status(400).json({ error: 'Cannot block yourself' });

    await db.query(
      'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, user_id]
    );
    res.json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/messages/block/:userId – unblock
router.delete('/block/:userId', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM blocked_users WHERE blocker_id=$1 AND blocked_id=$2', [
      req.user.id,
      req.params.userId,
    ]);
    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/:productId/:otherUserId – get messages in a thread
router.get('/:productId/:otherUserId', requireAuth, async (req, res) => {
  try {
    const { productId, otherUserId } = req.params;
    const { page } = req.query;
    const limit = config.MESSAGES_PER_PAGE;
    const offset = ((parseInt(page) || 1) - 1) * limit;

    // Check if other user is blocked
    const blocked = await db.query(
      'SELECT id FROM blocked_users WHERE blocker_id=$1 AND blocked_id=$2',
      [req.user.id, otherUserId]
    );
    if (blocked.rows.length) return res.status(403).json({ error: 'User is blocked' });

    const messages = await db.query(
      `SELECT m.*, u.full_name as from_user_name
       FROM messages m
       JOIN users u ON u.id = m.from_user_id
       WHERE m.product_id=$1
         AND ((m.from_user_id=$2 AND m.to_user_id=$3) OR (m.from_user_id=$3 AND m.to_user_id=$2))
       ORDER BY m.created_at ASC
       LIMIT $4 OFFSET $5`,
      [productId, req.user.id, otherUserId, limit, offset]
    );

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read=TRUE WHERE product_id=$1 AND from_user_id=$2 AND to_user_id=$3 AND is_read=FALSE',
      [productId, otherUserId, req.user.id]
    );

    // Get product info for context
    const product = await db.query(
      `SELECT p.id, p.title, p.price, p.status,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
       FROM products p WHERE p.id=$1`,
      [productId]
    );

    // Get other user info
    const otherUser = await db.query(
      'SELECT id, full_name FROM users WHERE id=$1',
      [otherUserId]
    );

    res.json({
      messages: messages.rows,
      product: product.rows[0] || null,
      other_user: otherUser.rows[0] || null,
      disclaimer: config.PAYMENT_DISCLAIMER,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages – send a message
router.post('/', requireAuth, messageLimiter, async (req, res) => {
  try {
    const { product_id, to_user_id, message } = req.body;
    if (!product_id || !to_user_id || !message)
      return res.status(400).json({ error: 'product_id, to_user_id, message required' });
    if (message.length > config.MESSAGE_MAX_LENGTH)
      return res.status(400).json({ error: `Message too long (max ${config.MESSAGE_MAX_LENGTH} chars)` });
    if (parseInt(to_user_id) === req.user.id)
      return res.status(400).json({ error: 'Cannot message yourself' });

    // Check if recipient blocked sender
    const blocked = await db.query(
      'SELECT id FROM blocked_users WHERE blocker_id=$1 AND blocked_id=$2',
      [to_user_id, req.user.id]
    );
    if (blocked.rows.length) return res.status(403).json({ error: 'Unable to send message' });

    // Verify product exists
    const product = await db.query('SELECT id FROM products WHERE id=$1', [product_id]);
    if (!product.rows.length) return res.status(404).json({ error: 'Product not found' });

    const result = await db.query(
      'INSERT INTO messages (product_id, from_user_id, to_user_id, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [product_id, req.user.id, to_user_id, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
