#!/bin/bash
set -e

echo "=========================================="
echo "  OriginalHub - Local Setup Script"
echo "=========================================="

# ── 1. Install Node.js 20 ─────────────────────
echo ""
echo "[1/5] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
  wget -qO- https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "  Node.js already installed: $(node --version)"
fi

# ── 2. Install PostgreSQL ─────────────────────
echo ""
echo "[2/5] Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
  sudo apt install -y postgresql postgresql-contrib
  sudo systemctl enable postgresql
  sudo systemctl start postgresql
else
  echo "  PostgreSQL already installed"
  sudo systemctl start postgresql 2>/dev/null || true
fi

# ── 3. Setup Database ─────────────────────────
echo ""
echo "[3/5] Setting up database..."
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'originalhub_user') THEN
    CREATE USER originalhub_user WITH PASSWORD 'OriginalHub@2026';
    RAISE NOTICE 'User created.';
  ELSE
    ALTER USER originalhub_user WITH PASSWORD 'OriginalHub@2026';
    RAISE NOTICE 'User already exists, password updated.';
  END IF;
END
\$\$;

SELECT 'Database check...' AS status;
SQL

sudo -u postgres psql -c "CREATE DATABASE originalhub OWNER originalhub_user;" 2>/dev/null \
  && echo "  Database 'originalhub' created." \
  || echo "  Database 'originalhub' already exists."

# ── 4. Write .env ─────────────────────────────
echo ""
echo "[4/5] Configuring .env..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat > "$SCRIPT_DIR/.env" <<ENV
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=originalhub
DB_USER=originalhub_user
DB_PASSWORD=OriginalHub@2026

# JWT
JWT_SECRET=originalhub_super_secret_jwt_key_2026_do_not_share_this_key_ever

# Email (optional – for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin
ADMIN_EMAILS=admin@originalhub.com

# Site URL
SITE_URL=http://localhost:3000
ENV

echo "  .env written."

# ── 5. Install npm deps & migrate ─────────────
echo ""
echo "[5/5] Installing npm packages and running DB migrations..."
cd "$SCRIPT_DIR"
npm install
node scripts/migrate.js

# ── Create uploads dirs ───────────────────────
mkdir -p uploads/products uploads/profiles

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "  Starting OriginalHub on http://localhost:3000"
echo "=========================================="
echo ""
npm start
