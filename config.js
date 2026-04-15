// Backend config – mirrors public/js/config.js so server-side code
// uses the same values as the frontend.
const ORIGINALHUB_CONFIG = {
  SITE_NAME: 'OriginalHub',
  SITE_TAGLINE: 'Authentic Handmade Marketplace',
  CONTACT_EMAIL: 'hello@originalhub.com',

  // Features
  REQUIRE_HANDMADE_PROOF: true,
  SELLER_APPROVAL_REQUIRED: true,
  MAX_PRODUCT_IMAGES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE_MB: 5,

  // Messaging
  MESSAGE_RATE_LIMIT: 20,
  MESSAGE_MAX_LENGTH: 2000,

  // Pagination
  PRODUCTS_PER_PAGE: 24,
  MESSAGES_PER_PAGE: 50,

  // Warning message shown in every conversation
  PAYMENT_DISCLAIMER:
    '⚠️ OriginalHub does not handle payments. Always meet in a safe public place or use trusted delivery services. Never pay in advance without verifying the seller.',

  // Auto-suspension thresholds
  REPORT_SUSPENSION_THRESHOLD: 3,
  SUSPENSION_DAYS: 7,
};

module.exports = ORIGINALHUB_CONFIG;
