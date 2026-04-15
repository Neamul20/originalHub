#!/bin/bash
# deploy.sh – Run once on a fresh Ubuntu 22.04 server to deploy OriginalHub
# Usage: bash deploy.sh
set -e

APP_DIR="/var/www/originalhub"
DB_NAME="originalhub"
DB_USER="originalhub_user"
DB_PASS="change_this_password"   # ← CHANGE BEFORE RUNNING

echo "==================================================="
echo " OriginalHub Deployment Script"
echo "==================================================="

# 1. System update
echo "[1/9] Updating system packages…"
sudo apt update && sudo apt upgrade -y

# 2. Node.js 20.x
echo "[2/9] Installing Node.js 20.x…"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. PostgreSQL
echo "[3/9] Installing PostgreSQL…"
sudo apt install -y postgresql postgresql-contrib

# 4. Create database
echo "[4/9] Creating database and user…"
sudo -u postgres psql << EOSQL
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOSQL

# 5. Copy app to /var/www
echo "[5/9] Deploying application files…"
sudo mkdir -p ${APP_DIR}
sudo cp -r . ${APP_DIR}/
cd ${APP_DIR}

# 6. Create .env file
echo "[6/9] Creating .env…"
sudo tee ${APP_DIR}/.env > /dev/null << EOF
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=$(openssl rand -hex 64)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SITE_URL=http://$(curl -s ifconfig.me):3000
EOF

# 7. Install npm deps + run migrations
echo "[7/9] Installing dependencies and running migrations…"
cd ${APP_DIR}
npm install --production
node scripts/migrate.js
node scripts/create-admin.js

# 8. PM2
echo "[8/9] Setting up PM2…"
sudo npm install -g pm2
pm2 start server.js --name originalhub
pm2 save
pm2 startup | tail -1 | bash

# 9. Nginx
echo "[9/9] Configuring Nginx…"
sudo apt install -y nginx

sudo tee /etc/nginx/sites-available/originalhub > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/originalhub/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/originalhub /etc/nginx/sites-enabled/originalhub
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "==================================================="
echo " Deployment complete!"
echo " Site is live at: http://$(curl -s ifconfig.me)"
echo "==================================================="
echo ""
echo "Next steps:"
echo "  1. Edit .env and set your real email credentials"
echo "  2. Edit public/js/config.js to customise your site"
echo "  3. pm2 restart originalhub  (after config changes)"
echo "  4. To add HTTPS: sudo certbot --nginx -d yourdomain.com"
