const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/buyer/favorites – list saved products
router.get('/favorites', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.title, p.price, p.category, p.location, p.status,
              sp.shop_name,
              f.created_at as saved_at,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       JOIN seller_profiles sp ON sp.user_id = p.seller_id
       WHERE f.user_id=$1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/buyer/favorites/:productId – add to favorites
router.post('/favorites/:productId', requireAuth, async (req, res) => {
  try {
    const product = await db.query("SELECT id FROM products WHERE id=$1 AND status='published'", [req.params.productId]);
    if (!product.rows.length) return res.status(404).json({ error: 'Product not found' });

    await db.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/buyer/favorites/:productId – remove from favorites
router.delete('/favorites/:productId', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM favorites WHERE user_id=$1 AND product_id=$2', [
      req.user.id,
      req.params.productId,
    ]);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/buyer/favorites/:productId/check – check if favorited
router.get('/favorites/:productId/check', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id FROM favorites WHERE user_id=$1 AND product_id=$2',
      [req.user.id, req.params.productId]
    );
    res.json({ favorited: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
