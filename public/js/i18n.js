// i18n.js – Bangla / English language support

const TRANSLATIONS = {
  en: {
    // Navbar
    'nav.search.placeholder': 'Search handmade items…',
    'nav.search.btn': 'Search',
    'nav.messages': 'Messages',
    'nav.my_shop': 'My Shop',
    'nav.my_account': 'My Account',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',

    // Auth modal
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgot': 'Forgot Password',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password_hint': '(min 8 characters)',
    'auth.full_name': 'Full Name',
    'auth.create_account': 'Create Account',
    'auth.send_reset': 'Send Reset Link',
    'auth.join_as': 'I want to join as',
    'auth.buyer': 'Buyer',
    'auth.buyer_desc': 'browse & buy',
    'auth.seller': 'Seller',
    'auth.seller_desc': 'sell handmade',
    'auth.shop_name': 'Shop Name',
    'auth.bio': 'Bio',
    'auth.bio_hint': '(tell buyers about yourself)',
    'auth.location': 'Location',
    'auth.handmade_promise': 'Handmade Promise',
    'auth.handmade_promise_hint': '(describe what you make)',
    'auth.seller_review_notice': 'Your seller account will be reviewed by an admin before you can list products.',
    'auth.apply_as_seller': 'Apply as Seller',

    // Home page
    'home.hero_title': 'Authentic Handmade, Direct from Makers',
    'home.hero_sub': 'Discover unique, handcrafted items made with love by local artisans.',
    'home.browse_btn': 'Browse Products',
    'home.sell_btn': 'Start Selling',
    'home.featured': 'Featured Products',
    'home.view_all': 'View All',
    'home.categories': 'Browse by Category',

    // Product card
    'product.view': 'View',
    'product.contact_seller': 'Contact Seller',
    'product.add_favorite': 'Save',
    'product.sold': 'Sold',

    // Footer
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.safety': 'Safety Tips',

    // General
    'general.loading': 'Loading…',
    'general.no_results': 'No results found.',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.submit': 'Submit',
  },

  bn: {
    // Navbar
    'nav.search.placeholder': 'হস্তনির্মিত পণ্য খুঁজুন…',
    'nav.search.btn': 'খুঁজুন',
    'nav.messages': 'বার্তা',
    'nav.my_shop': 'আমার দোকান',
    'nav.my_account': 'আমার অ্যাকাউন্ট',
    'nav.admin': 'অ্যাডমিন',
    'nav.login': 'লগইন',
    'nav.register': 'নিবন্ধন',
    'nav.logout': 'লগআউট',

    // Auth modal
    'auth.login': 'লগইন',
    'auth.register': 'নিবন্ধন',
    'auth.forgot': 'পাসওয়ার্ড ভুলে গেছেন',
    'auth.email': 'ইমেইল',
    'auth.password': 'পাসওয়ার্ড',
    'auth.password_hint': '(কমপক্ষে ৮ অক্ষর)',
    'auth.full_name': 'পুরো নাম',
    'auth.create_account': 'অ্যাকাউন্ট তৈরি করুন',
    'auth.send_reset': 'রিসেট লিংক পাঠান',
    'auth.join_as': 'আমি যোগ দিতে চাই',
    'auth.buyer': 'ক্রেতা',
    'auth.buyer_desc': 'দেখুন ও কিনুন',
    'auth.seller': 'বিক্রেতা',
    'auth.seller_desc': 'হস্তনির্মিত পণ্য বিক্রি করুন',
    'auth.shop_name': 'দোকানের নাম',
    'auth.bio': 'পরিচিতি',
    'auth.bio_hint': '(ক্রেতাদের সম্পর্কে জানান)',
    'auth.location': 'অবস্থান',
    'auth.handmade_promise': 'হস্তনির্মাণের প্রতিশ্রুতি',
    'auth.handmade_promise_hint': '(আপনি কী তৈরি করেন তা বর্ণনা করুন)',
    'auth.seller_review_notice': 'পণ্য তালিকাভুক্ত করার আগে অ্যাডমিন আপনার বিক্রেতা অ্যাকাউন্ট পর্যালোচনা করবেন।',
    'auth.apply_as_seller': 'বিক্রেতা হিসেবে আবেদন করুন',

    // Home page
    'home.hero_title': 'স্থানীয় শিল্পীদের খাঁটি হস্তনির্মিত পণ্য',
    'home.hero_sub': 'স্থানীয় কারিগরদের ভালোবাসায় তৈরি অনন্য, হস্তনির্মিত পণ্য আবিষ্কার করুন।',
    'home.browse_btn': 'পণ্য দেখুন',
    'home.sell_btn': 'বিক্রি শুরু করুন',
    'home.featured': 'বিশেষ পণ্যসমূহ',
    'home.view_all': 'সব দেখুন',
    'home.categories': 'বিভাগ অনুযায়ী খুঁজুন',

    // Product card
    'product.view': 'দেখুন',
    'product.contact_seller': 'বিক্রেতার সাথে যোগাযোগ',
    'product.add_favorite': 'সংরক্ষণ',
    'product.sold': 'বিক্রিত',

    // Footer
    'footer.about': 'আমাদের সম্পর্কে',
    'footer.contact': 'যোগাযোগ',
    'footer.safety': 'নিরাপত্তা টিপস',

    // General
    'general.loading': 'লোড হচ্ছে…',
    'general.no_results': 'কোনো ফলাফল পাওয়া যায়নি।',
    'general.save': 'সংরক্ষণ করুন',
    'general.cancel': 'বাতিল',
    'general.delete': 'মুছুন',
    'general.edit': 'সম্পাদনা',
    'general.submit': 'জমা দিন',
  },
};

// ── Language engine ───────────────────────────────────────────────────────────
const I18n = {
  get lang() {
    return localStorage.getItem('oh_lang') || 'en';
  },

  set lang(val) {
    localStorage.setItem('oh_lang', val);
  },

  t(key) {
    return TRANSLATIONS[this.lang]?.[key] || TRANSLATIONS.en[key] || key;
  },

  // Apply translations to all [data-i18n] elements in the DOM
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr'); // e.g. "placeholder"
      const val = this.t(key);
      if (attr) {
        el.setAttribute(attr, val);
      } else {
        el.textContent = val;
      }
    });

    // Update html lang attribute
    document.documentElement.lang = this.lang === 'bn' ? 'bn' : 'en';

    // Update toggle button label if present
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = this.lang === 'bn' ? 'EN' : 'বাং';
  },

  toggle() {
    this.lang = this.lang === 'en' ? 'bn' : 'en';
    this.apply();
    // Re-render navbar so translated strings appear in dynamically built HTML
    if (typeof renderNavbar === 'function') renderNavbar();
  },

  init() {
    this.apply();
  },
};
