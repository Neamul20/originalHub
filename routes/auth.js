const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { generateToken } = require('../utils/helpers');
const { sendPasswordReset } = require('../utils/email');
const { authLimiter } = require('../middleware/rateLimit');

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, full_name, intent, shop_name, bio, location, handmade_promise } = req.body;
    if (!email || !password || !full_name)
      return res.status(400).json({ error: 'email, password and full_name are required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    if (intent === 'seller' && !shop_name)
      return res.status(400).json({ error: 'shop_name is required for seller registration' });

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,$3,'buyer') RETURNING id, email, full_name, role",
      [email.toLowerCase(), hash, full_name]
    );
    const user = result.rows[0];

    // Auto-create seller profile if intent is seller
    if (intent === 'seller') {
      await db.query(
        'INSERT INTO seller_profiles (user_id, shop_name, bio, location, handmade_promise) VALUES ($1,$2,$3,$4,$5)',
        [user.id, shop_name, bio || '', location || '', handmade_promise || '']
      );
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    if (user.is_banned) return res.status(403).json({ error: 'Account banned' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const result = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    // Always return success to avoid user enumeration
    if (result.rows.length) {
      const token = generateToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour
      await db.query('UPDATE users SET reset_token=$1, reset_expires=$2 WHERE email=$3', [
        token,
        expires,
        email.toLowerCase(),
      ]);
      try {
        await sendPasswordReset(email, token);
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'token and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password too short' });

    const result = await db.query(
      'SELECT id FROM users WHERE reset_token=$1 AND reset_expires > NOW()',
      [token]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired token' });

    const hash = await bcrypt.hash(password, 12);
    await db.query(
      'UPDATE users SET password_hash=$1, reset_token=NULL, reset_expires=NULL WHERE id=$2',
      [hash, result.rows[0].id]
    );
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
const { requireAuth } = require('../middleware/auth');
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, phone_number, role, is_verified, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, phone_number } = req.body;
    const result = await db.query(
      'UPDATE users SET full_name=$1, phone_number=$2 WHERE id=$3 RETURNING id, email, full_name, phone_number, role',
      [full_name, phone_number, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ error: 'current_password and new_password required' });
    if (new_password.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const result = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
