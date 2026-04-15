require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db');

async function migrate() {
  console.log('Running migrations…');

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      phone_number VARCHAR(20),
      role VARCHAR(20) DEFAULT 'buyer',
      is_verified BOOLEAN DEFAULT FALSE,
      is_banned BOOLEAN DEFAULT FALSE,
      is_suspended BOOLEAN DEFAULT FALSE,
      suspended_until TIMESTAMP,
      reset_token VARCHAR(255),
      reset_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS seller_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      shop_name VARCHAR(100) NOT NULL,
      bio TEXT,
      location VARCHAR(255),
      handmade_promise TEXT,
      banner_image VARCHAR(255),
      is_approved BOOLEAN DEFAULT FALSE,
      rejection_reason TEXT,
      total_products_sold INTEGER DEFAULT 0,
      rating_avg DECIMAL(2,1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100),
      location VARCHAR(255),
      handmade_proof_text TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'draft',
      rejection_reason TEXT,
      views INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sold_at TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url VARCHAR(255) NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      reporter_id INTEGER REFERENCES users(id),
      product_id INTEGER REFERENCES products(id),
      conversation_product_id INTEGER,
      reason VARCHAR(100),
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      resolved_by INTEGER REFERENCES users(id),
      resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id SERIAL PRIMARY KEY,
      blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(blocker_id, blocked_id)
    );
  `);

  // Unique constraint: one seller profile per user
  await db.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'seller_profiles_user_id_unique'
      ) THEN
        ALTER TABLE seller_profiles ADD CONSTRAINT seller_profiles_user_id_unique UNIQUE (user_id);
      END IF;
    END $$;
  `);

  // Indexes
  await db.query(`CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_product ON messages(product_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_seller_profiles_user ON seller_profiles(user_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_seller_profiles_approved ON seller_profiles(is_approved);`);

  console.log('Migrations complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
