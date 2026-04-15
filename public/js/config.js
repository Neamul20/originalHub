// ─────────────────────────────────────────────────────────────────────────────
// config.js – Edit this file to customise your OriginalHub site.
// No other code changes needed for the settings below.
// ─────────────────────────────────────────────────────────────────────────────

const ORIGINALHUB_CONFIG = {
  // ── Basic Information ──────────────────────────────────────────────────────
  SITE_NAME:    "OriginalHub",
  SITE_TAGLINE: "Authentic Handmade Marketplace",
  SITE_LOGO_TEXT: "OriginalHub",        // or set to "" and use SITE_LOGO_IMAGE
  SITE_LOGO_IMAGE: "",                  // e.g. "/images/logo.png"
  SITE_FAVICON: "/favicon.ico",

  // ── Contact & Legal ────────────────────────────────────────────────────────
  CONTACT_EMAIL: "hello@originalhub.com",

  // ── Appearance ─────────────────────────────────────────────────────────────
  PRIMARY_COLOR:    "#c47b4b",   // Warm terracotta
  SECONDARY_COLOR:  "#2d2a24",   // Dark charcoal
  ACCENT_COLOR:     "#9b4b2e",   // Deep rust
  BACKGROUND_COLOR: "#fefaf5",   // Cream

  // ── Features ────────────────────────────────────────────────────────────────
  REQUIRE_HANDMADE_PROOF:    true,
  SELLER_APPROVAL_REQUIRED:  true,
  MAX_PRODUCT_IMAGES:        5,
  ALLOWED_IMAGE_TYPES:       ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGE_SIZE_MB:         5,

  // ── Messaging ───────────────────────────────────────────────────────────────
  MESSAGE_RATE_LIMIT:  20,      // messages per minute
  MESSAGE_MAX_LENGTH:  2000,
  POLL_INTERVAL_MS:    3000,    // how often to poll for new messages (ms)

  // ── Pagination ──────────────────────────────────────────────────────────────
  PRODUCTS_PER_PAGE: 24,
  MESSAGES_PER_PAGE: 50,

  // ── Warning messages ────────────────────────────────────────────────────────
  PAYMENT_DISCLAIMER: "⚠️ OriginalHub does not handle payments. Always meet in a safe public place or use trusted delivery services. Never pay in advance without verifying the seller.",

  // ── Social Links (optional) ─────────────────────────────────────────────────
  FACEBOOK_URL:  "",
  INSTAGRAM_URL: "",

  // ── Footer ──────────────────────────────────────────────────────────────────
  FOOTER_TEXT: "© 2026 OriginalHub – Connecting handmade artisans with buyers.",

  // ── Categories ──────────────────────────────────────────────────────────────
  CATEGORIES: ["Jewelry", "Pottery", "Textiles", "Home Decor", "Baked Goods", "Art", "Other"],
};
