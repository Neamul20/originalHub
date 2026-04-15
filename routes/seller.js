const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { profileUpload } = require('../middleware/upload');
const { sendSellerApproval } = require('../utils/email');

// POST /api/seller/apply – buyer submits seller application
router.post('/apply', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer')
      return res.status(400).json({ error: 'Only buyers can apply to become sellers' });

    const { shop_name, bio, location, phone_number, handmade_promise } = req.body;
    if (!shop_name || !bio || !location || !phone_number || !handmade_promise)
      return res.status(400).json({ error: 'All fields required' });

    const existing = await db.query('SELECT id FROM seller_profiles WHERE user_id=$1', [req.user.id]);
    if (existing.rows.length)
      return res.status(409).json({ error: 'You already have a seller application' });

    await db.query(
      'INSERT INTO seller_profiles (user_id, shop_name, bio, location, handmade_promise) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, shop_name, bio, location, handmade_promise]
    );
    await db.query('UPDATE users SET phone_number=$1 WHERE id=$2', [phone_number, req.user.id]);
    res.status(201).json({ message: 'Application submitted. Pending admin approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/seller/profile – get own seller profile
router.get('/profile', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM seller_profiles WHERE user_id=$1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Seller profile not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/seller/profile – update seller profile
router.put('/profile', requireAuth, requireRole('seller', 'admin'), profileUpload, async (req, res) => {
  try {
    const { shop_name, bio, location } = req.body;
    const banner = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

    let query, params;
    if (banner) {
      query = 'UPDATE seller_profiles SET shop_name=$1, bio=$2, location=$3, banner_image=$4 WHERE user_id=$5 RETURNING *';
      params = [shop_name, bio, location, banner, req.user.id];
    } else {
      query = 'UPDATE seller_profiles SET shop_name=$1, bio=$2, location=$3 WHERE user_id=$4 RETURNING *';
      params = [shop_name, bio, location, req.user.id];
    }
    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/seller/dashboard – seller stats
router.get('/dashboard', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const [products, messages, unread] = await Promise.all([
      db.query(
        "SELECT status, COUNT(*) as count FROM products WHERE seller_id=$1 GROUP BY status",
        [req.user.id]
      ),
      db.query('SELECT COUNT(*) as total FROM messages WHERE to_user_id=$1', [req.user.id]),
      db.query('SELECT COUNT(*) as count FROM messages WHERE to_user_id=$1 AND is_read=FALSE', [req.user.id]),
    ]);

    const soldThisMonth = await db.query(
      "SELECT COUNT(*) as count FROM products WHERE seller_id=$1 AND status='sold' AND sold_at >= date_trunc('month', NOW())",
      [req.user.id]
    );

    res.json({
      products: products.rows,
      total_messages: messages.rows[0].total,
      unread_messages: unread.rows[0].count,
      sold_this_month: soldThisMonth.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/seller/public/:userId – public seller page
router.get('/public/:userId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sp.*, u.full_name, u.created_at as member_since
       FROM seller_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE sp.user_id=$1 AND sp.is_approved=TRUE`,
      [req.params.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Seller not found' });

    const products = await db.query(
      `SELECT p.*, (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
       FROM products p WHERE p.seller_id=$1 AND p.status='published'
       ORDER BY p.created_at DESC`,
      [req.params.userId]
    );

    res.json({ seller: result.rows[0], products: products.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
