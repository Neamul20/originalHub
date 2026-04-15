const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { productUpload } = require('../middleware/upload');
const { paginate } = require('../utils/helpers');
const config = require('../config');

// GET /api/products – public browse with search + filter
router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price, location, page } = req.query;
    const { limit, offset } = paginate(page, config.PRODUCTS_PER_PAGE);

    let conditions = ["p.status = 'published'"];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length} OR sp.shop_name ILIKE $${params.length})`
      );
    }
    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    if (min_price) {
      params.push(Number(min_price));
      conditions.push(`p.price >= $${params.length}`);
    }
    if (max_price) {
      params.push(Number(max_price));
      conditions.push(`p.price <= $${params.length}`);
    }
    if (location) {
      params.push(`%${location}%`);
      conditions.push(`p.location ILIKE $${params.length}`);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    params.push(limit);
    const limitParam = params.length;
    params.push(offset);
    const offsetParam = params.length;

    const [rows, countRow] = await Promise.all([
      db.query(
        `SELECT p.id, p.title, p.price, p.category, p.location, p.views, p.created_at,
                sp.shop_name, sp.user_id as seller_user_id,
                (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
         FROM products p
         JOIN seller_profiles sp ON sp.user_id = p.seller_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${limitParam} OFFSET $${offsetParam}`,
        params
      ),
      db.query(
        `SELECT COUNT(*) as total FROM products p
         JOIN seller_profiles sp ON sp.user_id = p.seller_id ${where}`,
        params.slice(0, params.length - 2)
      ),
    ]);

    res.json({
      products: rows.rows,
      total: parseInt(countRow.rows[0].total),
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(parseInt(countRow.rows[0].total) / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/mine/list – seller's own products (MUST be before /:id)
router.get('/mine/list', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
       FROM products p WHERE p.seller_id=$1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/mine/:id – seller fetch their own product by id (any status)
router.get('/mine/:id', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*,
              (SELECT json_agg(json_build_object('image_url', pi.image_url, 'sort_order', pi.sort_order)
                               ORDER BY pi.sort_order)
               FROM product_images pi WHERE pi.product_id=p.id) as images
       FROM products p
       WHERE p.id=$1 AND p.seller_id=$2`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id – single product detail (public, published only)
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, sp.shop_name, sp.bio as seller_bio, sp.location as seller_location, sp.user_id as seller_user_id
       FROM products p
       JOIN seller_profiles sp ON sp.user_id = p.seller_id
       WHERE p.id=$1 AND p.status='published'`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });

    const images = await db.query(
      'SELECT image_url, sort_order FROM product_images WHERE product_id=$1 ORDER BY sort_order',
      [req.params.id]
    );

    // Increment view count
    await db.query('UPDATE products SET views = views + 1 WHERE id=$1', [req.params.id]);

    res.json({ ...result.rows[0], images: images.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products – create product (seller only)
router.post('/', requireAuth, requireRole('seller'), (req, res, next) => {
  productUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { title, description, price, category, location, handmade_proof_text, status } = req.body;
    if (!title || !description || !price || !handmade_proof_text)
      return res.status(400).json({ error: 'title, description, price, handmade_proof_text required' });
    if (description.length < 50)
      return res.status(400).json({ error: 'Description must be at least 50 characters' });
    if (handmade_proof_text.length < 20)
      return res.status(400).json({ error: 'Handmade proof must be at least 20 characters' });
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0)
      return res.status(400).json({ error: 'Price must be a positive number' });

    // Check if seller is approved
    const sp = await db.query('SELECT is_approved FROM seller_profiles WHERE user_id=$1', [req.user.id]);
    if (!sp.rows.length || !sp.rows[0].is_approved)
      return res.status(403).json({ error: 'Seller not approved' });

    // First 3 products go to pending_review; rest go to status chosen by seller (draft/pending_review)
    const publishedCount = await db.query(
      "SELECT COUNT(*) as cnt FROM products WHERE seller_id=$1 AND status IN ('published','pending_review','rejected','sold')",
      [req.user.id]
    );
    const productStatus = parseInt(publishedCount.rows[0].cnt) < 3
      ? 'pending_review'
      : (status === 'draft' ? 'draft' : 'pending_review');

    // Use a transaction so product + images are atomic
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO products (seller_id, title, description, price, category, location, handmade_proof_text, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.user.id, title, description, parsedPrice, category, location, handmade_proof_text, productStatus]
      );
      const product = result.rows[0];

      if (req.files && req.files.length) {
        for (let i = 0; i < req.files.length; i++) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1,$2,$3)',
            [product.id, `/uploads/products/${req.files[i].filename}`, i]
          );
        }
      }
      await client.query('COMMIT');
      res.status(201).json(product);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id – update product (seller only)
router.put('/:id', requireAuth, requireRole('seller'), (req, res, next) => {
  productUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { title, description, price, category, location, handmade_proof_text } = req.body;

    if (!title || !description || !price || !handmade_proof_text)
      return res.status(400).json({ error: 'title, description, price, handmade_proof_text required' });
    if (description.length < 50)
      return res.status(400).json({ error: 'Description must be at least 50 characters' });
    if (handmade_proof_text.length < 20)
      return res.status(400).json({ error: 'Handmade proof must be at least 20 characters' });
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0)
      return res.status(400).json({ error: 'Price must be a positive number' });

    const existing = await db.query('SELECT * FROM products WHERE id=$1 AND seller_id=$2', [req.params.id, req.user.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Product not found' });

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const updated = await client.query(
        `UPDATE products SET title=$1, description=$2, price=$3, category=$4, location=$5,
         handmade_proof_text=$6, status='pending_review', rejection_reason=NULL, updated_at=NOW()
         WHERE id=$7 AND seller_id=$8 RETURNING *`,
        [title, description, parsedPrice, category, location, handmade_proof_text, req.params.id, req.user.id]
      );

      if (req.files && req.files.length) {
        await client.query('DELETE FROM product_images WHERE product_id=$1', [req.params.id]);
        for (let i = 0; i < req.files.length; i++) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1,$2,$3)',
            [req.params.id, `/uploads/products/${req.files[i].filename}`, i]
          );
        }
      }
      await client.query('COMMIT');
      res.json(updated.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const result = req.user.role === 'admin'
      ? await db.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id])
      : await db.query('DELETE FROM products WHERE id=$1 AND seller_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id/sold – mark as sold
router.put('/:id/sold', requireAuth, requireRole('seller'), async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE products SET status='sold', sold_at=NOW() WHERE id=$1 AND seller_id=$2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });

    await db.query(
      "UPDATE seller_profiles SET total_products_sold = total_products_sold + 1 WHERE user_id=$1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
