require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db = require('../db');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function createAdmin() {
  console.log('=== Create Admin User ===');
  const email = await ask('Admin email: ');
  const fullName = await ask('Full name: ');
  const password = await ask('Password: ');
  rl.close();

  const hash = await bcrypt.hash(password, 12);

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    await db.query(
      "UPDATE users SET role = 'admin', password_hash = $1, full_name = $2 WHERE email = $3",
      [hash, fullName, email]
    );
    console.log(`Updated existing user ${email} to admin.`);
  } else {
    await db.query(
      "INSERT INTO users (email, password_hash, full_name, role, is_verified) VALUES ($1,$2,$3,'admin',TRUE)",
      [email, hash, fullName]
    );
    console.log(`Admin user ${email} created.`);
  }
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
