# OriginalHub

**Authentic Handmade Marketplace** – connects handmade artisans with buyers via direct messaging. The platform handles trust and discovery; payment is arranged directly between buyer and seller (bKash, Nagad, cash, etc.).

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in values
cp .env .env.local
# Edit .env with your PostgreSQL credentials

# 3. Run database migrations
node scripts/migrate.js

# 4. Create admin user
node scripts/create-admin.js

# 5. Start server
npm run dev      # development (with nodemon)
# or
npm start        # production
```

Open http://localhost:3000

---

## Production Deployment (Ubuntu 22.04)

```bash
# On your server, clone the repo then:
bash deploy.sh
```

The script will:
1. Install Node.js 20.x
2. Install and configure PostgreSQL
3. Create the database
4. Run migrations
5. Create the first admin user (interactive prompt)
6. Install and configure PM2 (process manager)
7. Install and configure Nginx (reverse proxy)

Site goes live at `http://your-server-ip` after the script completes.

---

## Customisation

**All site settings are in one file: `public/js/config.js`**

| Setting | What it changes |
|---|---|
| `SITE_NAME` | Site name everywhere |
| `SITE_TAGLINE` | Hero section subtitle |
| `SITE_LOGO_TEXT` | Navbar logo text |
| `SITE_LOGO_IMAGE` | Path to logo image (overrides text) |
| `PRIMARY_COLOR` | Button / accent colour |
| `SECONDARY_COLOR` | Navbar / sidebar colour |
| `ACCENT_COLOR` | Hover/link colour |
| `BACKGROUND_COLOR` | Page background |
| `PAYMENT_DISCLAIMER` | Warning shown in every chat |
| `FOOTER_TEXT` | Footer copyright line |
| `FACEBOOK_URL` / `INSTAGRAM_URL` | Social links in footer |
| `CATEGORIES` | Product category list |

**After editing config.js, restart the server:**
```bash
pm2 restart originalhub
```

### Change the logo image
1. Upload your logo to `public/images/logo.png`
2. In `config.js` set `SITE_LOGO_IMAGE: "/images/logo.png"` and `SITE_LOGO_TEXT: ""`
3. Restart: `pm2 restart originalhub`

---

## Creating the First Admin

```bash
node scripts/create-admin.js
```

You will be prompted for email, name, and password.

---

## Resetting a Password

Users can reset via the "Forgot Password" link on the login modal. Make sure email credentials are set in `.env`.

To reset manually via psql:
```sql
UPDATE users SET reset_token = NULL, reset_expires = NULL,
       password_hash = '<bcrypt-hash>' WHERE email = 'user@example.com';
```

---

## Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default 3000) |
| `DB_HOST/PORT/NAME/USER/PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Long random string for JWT signing |
| `EMAIL_HOST/PORT/USER/PASS` | SMTP for password reset emails |
| `SITE_URL` | Public URL (used in reset email links) |

---

## File Structure

```
originalhub/
├── public/           # Static frontend
│   ├── index.html    # Homepage
│   ├── browse.html   # Product browsing
│   ├── product.html  # Product detail
│   ├── messages.html # Messaging
│   ├── seller-dashboard.html
│   ├── buyer-dashboard.html
│   ├── apply-seller.html
│   ├── reset-password.html
│   ├── admin/index.html
│   ├── css/style.css
│   └── js/
│       ├── config.js     ← CUSTOMISE HERE
│       ├── main.js
│       ├── auth.js
│       ├── products.js
│       ├── messaging.js
│       ├── seller.js
│       └── buyer.js
├── routes/           # Express API routes
├── middleware/       # Auth, upload, rate-limit
├── utils/            # Email, helpers
├── scripts/          # migrate.js, create-admin.js
├── uploads/          # User-uploaded images
├── server.js         # Entry point
├── db.js             # PostgreSQL pool
├── config.js         # Backend config
└── .env              # Environment variables
```

---

## Adding HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Auto-renewal is configured automatically
```

---

## PM2 Commands

```bash
pm2 status                    # Check running processes
pm2 logs originalhub          # View logs
pm2 restart originalhub       # Restart after code/config changes
pm2 stop originalhub          # Stop
```
