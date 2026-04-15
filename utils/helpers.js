const crypto = require('crypto');

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function calcAvgResponseTime(messages) {
  // Returns average response time in minutes for a seller
  if (!messages || messages.length < 2) return null;
  const sorted = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const responseTimes = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from_user_id !== sorted[i - 1].from_user_id) {
      const diff = (new Date(sorted[i].created_at) - new Date(sorted[i - 1].created_at)) / 60000;
      responseTimes.push(diff);
    }
  }
  if (!responseTimes.length) return null;
  return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
}

function paginate(page, perPage) {
  const p = Math.max(1, parseInt(page) || 1);
  const limit = parseInt(perPage) || 24;
  const offset = (p - 1) * limit;
  return { page: p, limit, offset };
}

module.exports = { generateToken, calcAvgResponseTime, paginate };
