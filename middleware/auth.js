const jwt = require('jsonwebtoken');
const db = require('../db');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query(
      'SELECT id, email, full_name, role, is_banned, is_suspended, suspended_until FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'User not found' });
    const user = result.rows[0];
    if (user.is_banned) return res.status(403).json({ error: 'Account banned' });
    if (user.is_suspended && user.suspended_until && new Date(user.suspended_until) > new Date()) {
      return res.status(403).json({ error: `Account suspended until ${user.suspended_until}` });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
