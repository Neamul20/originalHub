const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const config = require('../config');

// POST /api/reports – submit a report
router.post('/', requireAuth, async (req, res) => {
  try {
    const { product_id, conversation_product_id, reason, description } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason required' });
    if (!product_id && !conversation_product_id)
      return res.status(400).json({ error: 'product_id or conversation_product_id required' });

    await db.query(
      'INSERT INTO reports (reporter_id, product_id, conversation_product_id, reason, description) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, product_id || null, conversation_product_id || null, reason, description || null]
    );

    // Auto-suspension: check if seller has >= threshold verified reports in last 30 days
    if (product_id) {
      const product = await db.query('SELECT seller_id FROM products WHERE id=$1', [product_id]);
      if (product.rows.length) {
        const sellerId = product.rows[0].seller_id;
        const reportCount = await db.query(
          `SELECT COUNT(*) as cnt FROM reports r
           JOIN products p ON p.id = r.product_id
           WHERE p.seller_id=$1 AND r.status='resolved'
             AND r.created_at > NOW() - INTERVAL '30 days'`,
          [sellerId]
        );
        if (parseInt(reportCount.rows[0].cnt) >= config.REPORT_SUSPENSION_THRESHOLD) {
          const until = new Date();
          until.setDate(until.getDate() + config.SUSPENSION_DAYS);
          await db.query(
            'UPDATE users SET is_suspended=TRUE, suspended_until=$1 WHERE id=$2',
            [until, sellerId]
          );
        }
      }
    }

    res.status(201).json({ message: 'Report submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/mine – user's own reports
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, p.title as product_title
       FROM reports r
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.reporter_id=$1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
