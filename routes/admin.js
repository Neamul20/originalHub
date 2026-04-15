const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSellerApproval, sendAccountStatus } = require('../utils/email');

const isAdmin = [requireAuth, requireRole('admin')];

// GET /api/admin/stats – platform statistics
router.get('/stats', ...isAdmin, async (req, res) => {
  try {
    const [users, products, messages, sellers] = await Promise.all([
      db.query('SELECT COUNT(*) as total, SUM(CASE WHEN role=\'buyer\' THEN 1 ELSE 0 END) as buyers, SUM(CASE WHEN role=\'seller\' THEN 1 ELSE 0 END) as sellers FROM users'),
      db.query("SELECT COUNT(*) as published FROM products WHERE status='published'"),
      db.query(`SELECT
        SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN created_at >= date_trunc('week', NOW()) THEN 1 ELSE 0 END) as week,
        SUM(CASE WHEN created_at >= date_trunc('month', NOW()) THEN 1 ELSE 0 END) as month,
        COUNT(*) as total
        FROM messages`),
      db.query("SELECT COUNT(DISTINCT seller_id) as active FROM products WHERE status='published'"),
    ]);

    res.json({
      users: users.rows[0],
      published_products: products.rows[0].published,
      messages: messages.rows[0],
      active_sellers: sellers.rows[0].active,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/seller-applications – pending applications
router.get('/seller-applications', ...isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sp.*, u.email, u.full_name, u.phone_number, u.created_at as registered_at
       FROM seller_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE sp.is_approved = FALSE AND sp.rejection_reason IS NULL
       ORDER BY sp.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/seller-applications/:userId/approve
router.post('/seller-applications/:userId/approve', ...isAdmin, async (req, res) => {
  try {
    const user = await db.query('SELECT email, full_name FROM users WHERE id=$1', [req.params.userId]);
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });

    await db.query(
      "UPDATE seller_profiles SET is_approved=TRUE, approved_at=NOW(), rejection_reason=NULL WHERE user_id=$1",
      [req.params.userId]
    );
    await db.query("UPDATE users SET role='seller' WHERE id=$1", [req.params.userId]);

    const sp = await db.query('SELECT shop_name FROM seller_profiles WHERE user_id=$1', [req.params.userId]);
    try {
      await sendSellerApproval(user.rows[0].email, sp.rows[0]?.shop_name, true, null);
    } catch (emailErr) {
      console.error('Approval email failed:', emailErr.message);
    }

    res.json({ message: 'Seller approved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/seller-applications/:userId/reject
router.post('/seller-applications/:userId/reject', ...isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason required' });

    const user = await db.query('SELECT email FROM users WHERE id=$1', [req.params.userId]);
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });

    await db.query(
      'UPDATE seller_profiles SET rejection_reason=$1 WHERE user_id=$2',
      [reason, req.params.userId]
    );
    const sp = await db.query('SELECT shop_name FROM seller_profiles WHERE user_id=$1', [req.params.userId]);
    try {
      await sendSellerApproval(user.rows[0].email, sp.rows[0]?.shop_name, false, reason);
    } catch (emailErr) {
      console.error('Rejection email failed:', emailErr.message);
    }

    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/products/pending – products awaiting review
router.get('/products/pending', ...isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, sp.shop_name, u.email,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
       FROM products p
       JOIN seller_profiles sp ON sp.user_id = p.seller_id
       JOIN users u ON u.id = p.seller_id
       WHERE p.status = 'pending_review'
       ORDER BY p.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/products/:id/approve
router.post('/products/:id/approve', ...isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE products SET status='published', rejection_reason=NULL, updated_at=NOW() WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product approved', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/products/:id/reject
router.post('/products/:id/reject', ...isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason required' });
    const result = await db.query(
      "UPDATE products SET status='rejected', rejection_reason=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [reason, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/reports – all reports (pending + resolved)
router.get('/reports', ...isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const statusFilter = status === 'resolved' ? "r.status = 'resolved'" : "r.status = 'pending'";
    const result = await db.query(
      `SELECT r.*, u.email as reporter_email,
              p.title as product_title, p.seller_id
       FROM reports r
       JOIN users u ON u.id = r.reporter_id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE ${statusFilter}
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/reports/:id/resolve
router.post('/reports/:id/resolve', ...isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // delete_product | warn_user | ban_user | dismiss
    const report = await db.query('SELECT * FROM reports WHERE id=$1', [req.params.id]);
    if (!report.rows.length) return res.status(404).json({ error: 'Report not found' });
    const r = report.rows[0];

    if (action === 'delete_product' && r.product_id) {
      await db.query('DELETE FROM products WHERE id=$1', [r.product_id]);
    } else if (action === 'ban_user' && r.product_id) {
      const product = await db.query('SELECT seller_id FROM products WHERE id=$1', [r.product_id]);
      if (product.rows.length) {
        const sellerId = product.rows[0].seller_id;
        await db.query("UPDATE users SET is_banned=TRUE WHERE id=$1 AND role != 'admin'", [sellerId]);
        const seller = await db.query('SELECT email, full_name FROM users WHERE id=$1', [sellerId]);
        if (seller.rows.length) {
          try {
            await sendAccountStatus(seller.rows[0].email, seller.rows[0].full_name, 'banned', null);
          } catch (emailErr) {
            console.error('Ban email failed:', emailErr.message);
          }
        }
      }
    } else if (action === 'warn_user') {
      // Warning is implicit (logged via report resolution)
    }

    await db.query(
      "UPDATE reports SET status='resolved', resolved_by=$1, resolved_at=NOW() WHERE id=$2",
      [req.user.id, req.params.id]
    );

    // Check auto-suspension (3+ resolved reports in 30 days)
    if (r.product_id) {
      const product = await db.query('SELECT seller_id FROM products WHERE id=$1', [r.product_id]);
      if (product.rows.length) {
        const sellerId = product.rows[0].seller_id;
        const cnt = await db.query(
          `SELECT COUNT(*) as c FROM reports r2
           JOIN products p2 ON p2.id=r2.product_id
           WHERE p2.seller_id=$1 AND r2.status='resolved'
             AND r2.created_at > NOW() - INTERVAL '30 days'`,
          [sellerId]
        );
        if (parseInt(cnt.rows[0].c) >= 3) {
          const until = new Date();
          until.setDate(until.getDate() + 7);
          await db.query(
            'UPDATE users SET is_suspended=TRUE, suspended_until=$1 WHERE id=$2',
            [until, sellerId]
          );
          const seller = await db.query('SELECT email, full_name FROM users WHERE id=$1', [sellerId]);
          if (seller.rows.length) {
            try {
              await sendAccountStatus(seller.rows[0].email, seller.rows[0].full_name, 'suspended', until);
            } catch (emailErr) {
              console.error('Suspension email failed:', emailErr.message);
            }
          }
        }
      }
    }

    res.json({ message: 'Report resolved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users – user list with pagination
router.get('/users', ...isAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let query, params;
    if (search) {
      query = `SELECT id, email, full_name, role, is_banned, is_suspended, suspended_until, created_at, last_login
               FROM users WHERE email ILIKE $1 OR full_name ILIKE $1
               ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params = [search, limit, offset];
    } else {
      query = `SELECT id, email, full_name, role, is_banned, is_suspended, suspended_until, created_at, last_login
               FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const [result, countRow] = await Promise.all([
      db.query(query, params),
      search
        ? db.query('SELECT COUNT(*) as total FROM users WHERE email ILIKE $1 OR full_name ILIKE $1', [search])
        : db.query('SELECT COUNT(*) as total FROM users'),
    ]);

    res.json({
      users: result.rows,
      total: parseInt(countRow.rows[0].total),
      page,
      pages: Math.ceil(parseInt(countRow.rows[0].total) / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users/:id/ban
router.post('/users/:id/ban', ...isAdmin, async (req, res) => {
  try {
    await db.query("UPDATE users SET is_banned=TRUE WHERE id=$1 AND role != 'admin'", [req.params.id]);
    const user = await db.query('SELECT email, full_name FROM users WHERE id=$1', [req.params.id]);
    if (user.rows.length) {
      try {
        await sendAccountStatus(user.rows[0].email, user.rows[0].full_name, 'banned', null);
      } catch (emailErr) {
        console.error('Ban email failed:', emailErr.message);
      }
    }
    res.json({ message: 'User banned' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users/:id/unban
router.post('/users/:id/unban', ...isAdmin, async (req, res) => {
  try {
    const user = await db.query('SELECT email, full_name FROM users WHERE id=$1', [req.params.id]);
    await db.query('UPDATE users SET is_banned=FALSE, is_suspended=FALSE, suspended_until=NULL WHERE id=$1', [req.params.id]);
    if (user.rows.length) {
      try {
        await sendAccountStatus(user.rows[0].email, user.rows[0].full_name, 'unbanned', null);
      } catch (emailErr) {
        console.error('Unban email failed:', emailErr.message);
      }
    }
    res.json({ message: 'User unbanned' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
