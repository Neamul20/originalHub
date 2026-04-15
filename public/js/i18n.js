// i18n.js – Bangla / English language support

const TRANSLATIONS = {
  en: {
    // ── Navbar ────────────────────────────────────────────────────────────────
    'nav.search.placeholder': 'Search handmade items…',
    'nav.search.btn': 'Search',
    'nav.messages': 'Messages',
    'nav.my_shop': 'My Shop',
    'nav.my_account': 'My Account',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',

    // ── Auth modal ────────────────────────────────────────────────────────────
    'auth.tab.login': 'Login',
    'auth.tab.register': 'Register',
    'auth.tab.forgot': 'Forgot Password',
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
    'auth.forgot_email_label': 'Email Address',

    // ── Home page ─────────────────────────────────────────────────────────────
    'home.latest_listings': 'Latest Listings',
    'home.browse_all': 'Browse All',
    'home.search_placeholder': 'Search for handmade jewelry, pottery, textiles…',
    'home.search_btn': 'Search',

    // ── Browse page ───────────────────────────────────────────────────────────
    'browse.title': 'Browse Products',
    'browse.filters': 'Filters',
    'browse.filter.search': 'Search',
    'browse.filter.search_placeholder': 'Keywords…',
    'browse.filter.category': 'Category',
    'browse.filter.all_categories': 'All Categories',
    'browse.filter.price': 'Price (BDT)',
    'browse.filter.min': 'Min',
    'browse.filter.max': 'Max',
    'browse.filter.location': 'Location',
    'browse.filter.location_placeholder': 'City, district…',
    'browse.filter.apply': 'Apply Filters',
    'browse.filter.clear': 'Clear',
    'browse.items_found_one': '1 item found',
    'browse.items_found': '{n} items found',
    'browse.no_products': 'No products found.',
    'browse.load_error': 'Failed to load products: ',

    // ── Product detail ────────────────────────────────────────────────────────
    'product.sold_by': 'Sold by',
    'product.description': 'Description',
    'product.handmade_proof': '✋ Handmade Proof',
    'product.report_listing': 'Report this listing',
    'product.report_select': 'Select reason…',
    'product.report_not_handmade': 'Not handmade',
    'product.report_fake': 'Fake listing',
    'product.report_spam': 'Spam',
    'product.report_other': 'Other',
    'product.report_submit': 'Submit Report',
    'product.message_seller': '💬 Message Seller',
    'product.save': '♡ Save',
    'product.saved': '♥ Saved',
    'product.not_found': 'Product not found or no longer available.',
    'product.select_reason': 'Please select a reason',
    'product.report_success': 'Report submitted. Thank you.',
    'product.not_available': 'No longer available',
    'product.remove': 'Remove',

    // ── Buyer dashboard ───────────────────────────────────────────────────────
    'buyer.title': 'My Account',
    'buyer.tab.favorites': 'Saved Items',
    'buyer.tab.messages': 'My Messages',
    'buyer.tab.reports': 'My Reports',
    'buyer.tab.settings': 'Settings',
    'buyer.no_favorites': 'No saved items yet.',
    'buyer.removed_favorite': 'Removed from favorites',
    'buyer.no_conversations': 'No conversations yet.',
    'buyer.no_reports': 'No reports submitted.',
    'buyer.reports.product': 'Product',
    'buyer.reports.reason': 'Reason',
    'buyer.reports.status': 'Status',
    'buyer.reports.date': 'Date',
    'buyer.profile': 'Profile',
    'buyer.full_name': 'Full Name',
    'buyer.phone': 'Phone Number',
    'buyer.save_changes': 'Save Changes',
    'buyer.profile_updated': 'Profile updated',
    'buyer.change_password': 'Change Password',
    'buyer.current_password': 'Current Password',
    'buyer.new_password': 'New Password',
    'buyer.update_password': 'Update Password',
    'buyer.password_updated': 'Password updated',
    'buyer.become_seller': 'Become a Seller',
    'buyer.become_seller_desc': 'Apply to sell your handmade items on OriginalHub.',
    'buyer.apply_to_sell': 'Apply to Sell',

    // ── Seller dashboard ──────────────────────────────────────────────────────
    'seller.no_access': 'You must be an approved seller to access this page.',
    'seller.go_home': 'Go home',
    'seller.stat.published': 'Published',
    'seller.stat.pending': 'Pending Review',
    'seller.stat.drafts': 'Drafts',
    'seller.stat.unread': 'Unread Messages',
    'seller.stat.sold': 'Sold This Month',
    'seller.no_products': 'No products yet.',
    'seller.add_first': 'Add your first product',
    'seller.col.image': 'Image',
    'seller.col.title': 'Title',
    'seller.col.price': 'Price',
    'seller.col.status': 'Status',
    'seller.col.views': 'Views',
    'seller.col.actions': 'Actions',
    'seller.btn.edit': 'Edit',
    'seller.btn.mark_sold': 'Mark Sold',
    'seller.btn.delete': 'Delete',
    'seller.rejection_reason': 'Reason: ',
    'seller.modal.add': 'Add New Product',
    'seller.modal.edit': 'Edit Product',
    'seller.form.title': 'Title',
    'seller.form.title_hint': '(max 100 chars)',
    'seller.form.description': 'Description',
    'seller.form.description_hint': '(min 50 chars)',
    'seller.form.price': 'Price (BDT)',
    'seller.form.category': 'Category',
    'seller.form.category_select': 'Select…',
    'seller.form.location': 'Location',
    'seller.form.handmade_proof': 'Handmade Proof',
    'seller.form.handmade_proof_hint': '(describe how you made this)',
    'seller.form.images': 'Images',
    'seller.form.images_hint': 'up to {max} images, JPEG/PNG/WebP, max {size}MB each',
    'seller.btn.cancel': 'Cancel',
    'seller.btn.update': 'Update',
    'seller.btn.submit_review': 'Submit for Review',
    'seller.mark_sold_confirm': 'Mark this product as sold?',
    'seller.marked_sold': 'Marked as sold',
    'seller.delete_confirm': 'Delete this product? This cannot be undone.',
    'seller.deleted': 'Product deleted',
    'seller.updated': 'Product updated. Pending re-review.',
    'seller.submitted': 'Product submitted for review!',
    'seller.apply.shop_name': 'Shop Name',
    'seller.apply.bio': 'Bio',
    'seller.apply.location': 'Location',
    'seller.apply.phone': 'Phone Number',
    'seller.apply.handmade_promise': 'Handmade Promise',
    'seller.apply.submit': 'Application submitted! We will review it shortly.',
    'seller.apply.submitted_notice': 'Application submitted. Please wait for admin approval.',

    // ── Messaging ─────────────────────────────────────────────────────────────
    'msg.no_conversations': 'No conversations yet.',
    'msg.no_messages': 'No messages yet. Say hi!',
    'msg.placeholder': 'Type a message…',
    'msg.send': 'Send',
    'msg.report_btn': '⚑ Report',
    'msg.block_btn': '🚫 Block',
    'msg.unread_new': 'new',
    'msg.chat_with': 'Chat with',
    'msg.about': 'about',
    'msg.block_confirm': 'Block this user? You will no longer receive messages from them.',
    'msg.blocked': 'User blocked',
    'msg.report_prompt': 'Reason for report:\n1. Harassment\n2. Scam attempt\n3. Spam\n4. Other\n\nType the reason:',
    'msg.report_success': 'Report submitted',

    // ── Footer ────────────────────────────────────────────────────────────────
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.safety': 'Safety Tips',

    // ── General ───────────────────────────────────────────────────────────────
    'general.loading': 'Loading…',
    'general.no_results': 'No results found.',
  },

  bn: {
    // ── Navbar ────────────────────────────────────────────────────────────────
    'nav.search.placeholder': 'হস্তনির্মিত পণ্য খুঁজুন…',
    'nav.search.btn': 'খুঁজুন',
    'nav.messages': 'বার্তা',
    'nav.my_shop': 'আমার দোকান',
    'nav.my_account': 'আমার অ্যাকাউন্ট',
    'nav.admin': 'অ্যাডমিন',
    'nav.login': 'লগইন',
    'nav.register': 'নিবন্ধন',
    'nav.logout': 'লগআউট',

    // ── Auth modal ────────────────────────────────────────────────────────────
    'auth.tab.login': 'লগইন',
    'auth.tab.register': 'নিবন্ধন',
    'auth.tab.forgot': 'পাসওয়ার্ড ভুলেছেন',
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
    'auth.forgot_email_label': 'ইমেইল ঠিকানা',

    // ── Home page ─────────────────────────────────────────────────────────────
    'home.latest_listings': 'সর্বশেষ পণ্যসমূহ',
    'home.browse_all': 'সব দেখুন',
    'home.search_placeholder': 'গহনা, মাটির পাত্র, কাপড় খুঁজুন…',
    'home.search_btn': 'খুঁজুন',

    // ── Browse page ───────────────────────────────────────────────────────────
    'browse.title': 'পণ্য ব্রাউজ করুন',
    'browse.filters': 'ফিল্টার',
    'browse.filter.search': 'খুঁজুন',
    'browse.filter.search_placeholder': 'কীওয়ার্ড…',
    'browse.filter.category': 'বিভাগ',
    'browse.filter.all_categories': 'সব বিভাগ',
    'browse.filter.price': 'মূল্য (টাকা)',
    'browse.filter.min': 'সর্বনিম্ন',
    'browse.filter.max': 'সর্বোচ্চ',
    'browse.filter.location': 'অবস্থান',
    'browse.filter.location_placeholder': 'শহর, জেলা…',
    'browse.filter.apply': 'ফিল্টার প্রয়োগ',
    'browse.filter.clear': 'পরিষ্কার',
    'browse.items_found_one': '১টি পণ্য পাওয়া গেছে',
    'browse.items_found': '{n}টি পণ্য পাওয়া গেছে',
    'browse.no_products': 'কোনো পণ্য পাওয়া যায়নি।',
    'browse.load_error': 'পণ্য লোড করতে ব্যর্থ: ',

    // ── Product detail ────────────────────────────────────────────────────────
    'product.sold_by': 'বিক্রেতা',
    'product.description': 'বিবরণ',
    'product.handmade_proof': '✋ হস্তনির্মাণের প্রমাণ',
    'product.report_listing': 'এই পণ্য রিপোর্ট করুন',
    'product.report_select': 'কারণ বেছে নিন…',
    'product.report_not_handmade': 'হস্তনির্মিত নয়',
    'product.report_fake': 'ভুয়া পণ্য',
    'product.report_spam': 'স্প্যাম',
    'product.report_other': 'অন্যান্য',
    'product.report_submit': 'রিপোর্ট জমা দিন',
    'product.message_seller': '💬 বিক্রেতাকে বার্তা দিন',
    'product.save': '♡ সংরক্ষণ',
    'product.saved': '♥ সংরক্ষিত',
    'product.not_found': 'পণ্যটি পাওয়া যায়নি বা আর পাওয়া যাচ্ছে না।',
    'product.select_reason': 'অনুগ্রহ করে একটি কারণ বেছে নিন',
    'product.report_success': 'রিপোর্ট জমা দেওয়া হয়েছে। ধন্যবাদ।',
    'product.not_available': 'আর পাওয়া যাচ্ছে না',
    'product.remove': 'সরিয়ে দিন',

    // ── Buyer dashboard ───────────────────────────────────────────────────────
    'buyer.title': 'আমার অ্যাকাউন্ট',
    'buyer.tab.favorites': 'সংরক্ষিত পণ্য',
    'buyer.tab.messages': 'আমার বার্তা',
    'buyer.tab.reports': 'আমার রিপোর্ট',
    'buyer.tab.settings': 'সেটিংস',
    'buyer.no_favorites': 'এখনো কোনো সংরক্ষিত পণ্য নেই।',
    'buyer.removed_favorite': 'পছন্দের তালিকা থেকে সরানো হয়েছে',
    'buyer.no_conversations': 'এখনো কোনো কথোপকথন নেই।',
    'buyer.no_reports': 'কোনো রিপোর্ট জমা দেওয়া হয়নি।',
    'buyer.reports.product': 'পণ্য',
    'buyer.reports.reason': 'কারণ',
    'buyer.reports.status': 'অবস্থা',
    'buyer.reports.date': 'তারিখ',
    'buyer.profile': 'প্রোফাইল',
    'buyer.full_name': 'পুরো নাম',
    'buyer.phone': 'ফোন নম্বর',
    'buyer.save_changes': 'পরিবর্তন সংরক্ষণ করুন',
    'buyer.profile_updated': 'প্রোফাইল আপডেট হয়েছে',
    'buyer.change_password': 'পাসওয়ার্ড পরিবর্তন',
    'buyer.current_password': 'বর্তমান পাসওয়ার্ড',
    'buyer.new_password': 'নতুন পাসওয়ার্ড',
    'buyer.update_password': 'পাসওয়ার্ড আপডেট করুন',
    'buyer.password_updated': 'পাসওয়ার্ড আপডেট হয়েছে',
    'buyer.become_seller': 'বিক্রেতা হন',
    'buyer.become_seller_desc': 'OriginalHub-এ আপনার হস্তনির্মিত পণ্য বিক্রির জন্য আবেদন করুন।',
    'buyer.apply_to_sell': 'বিক্রির জন্য আবেদন করুন',

    // ── Seller dashboard ──────────────────────────────────────────────────────
    'seller.no_access': 'এই পৃষ্ঠা অ্যাক্সেস করতে আপনাকে একজন অনুমোদিত বিক্রেতা হতে হবে।',
    'seller.go_home': 'হোমে যান',
    'seller.stat.published': 'প্রকাশিত',
    'seller.stat.pending': 'পর্যালোচনাধীন',
    'seller.stat.drafts': 'খসড়া',
    'seller.stat.unread': 'অপঠিত বার্তা',
    'seller.stat.sold': 'এই মাসে বিক্রিত',
    'seller.no_products': 'এখনো কোনো পণ্য নেই।',
    'seller.add_first': 'প্রথম পণ্য যোগ করুন',
    'seller.col.image': 'ছবি',
    'seller.col.title': 'শিরোনাম',
    'seller.col.price': 'মূল্য',
    'seller.col.status': 'অবস্থা',
    'seller.col.views': 'দেখা হয়েছে',
    'seller.col.actions': 'কার্যক্রম',
    'seller.btn.edit': 'সম্পাদনা',
    'seller.btn.mark_sold': 'বিক্রিত চিহ্নিত করুন',
    'seller.btn.delete': 'মুছুন',
    'seller.rejection_reason': 'কারণ: ',
    'seller.modal.add': 'নতুন পণ্য যোগ করুন',
    'seller.modal.edit': 'পণ্য সম্পাদনা',
    'seller.form.title': 'শিরোনাম',
    'seller.form.title_hint': '(সর্বোচ্চ ১০০ অক্ষর)',
    'seller.form.description': 'বিবরণ',
    'seller.form.description_hint': '(কমপক্ষে ৫০ অক্ষর)',
    'seller.form.price': 'মূল্য (টাকা)',
    'seller.form.category': 'বিভাগ',
    'seller.form.category_select': 'বেছে নিন…',
    'seller.form.location': 'অবস্থান',
    'seller.form.handmade_proof': 'হস্তনির্মাণের প্রমাণ',
    'seller.form.handmade_proof_hint': '(কীভাবে তৈরি করেছেন তা বর্ণনা করুন)',
    'seller.form.images': 'ছবিসমূহ',
    'seller.form.images_hint': 'সর্বোচ্চ {max}টি ছবি, JPEG/PNG/WebP, প্রতিটি সর্বোচ্চ {size}MB',
    'seller.btn.cancel': 'বাতিল',
    'seller.btn.update': 'আপডেট করুন',
    'seller.btn.submit_review': 'পর্যালোচনার জন্য জমা দিন',
    'seller.mark_sold_confirm': 'এই পণ্যটি বিক্রিত চিহ্নিত করবেন?',
    'seller.marked_sold': 'বিক্রিত চিহ্নিত হয়েছে',
    'seller.delete_confirm': 'এই পণ্যটি মুছবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।',
    'seller.deleted': 'পণ্য মুছে ফেলা হয়েছে',
    'seller.updated': 'পণ্য আপডেট হয়েছে। পুনরায় পর্যালোচনাধীন।',
    'seller.submitted': 'পণ্য পর্যালোচনার জন্য জমা দেওয়া হয়েছে!',
    'seller.apply.shop_name': 'দোকানের নাম',
    'seller.apply.bio': 'পরিচিতি',
    'seller.apply.location': 'অবস্থান',
    'seller.apply.phone': 'ফোন নম্বর',
    'seller.apply.handmade_promise': 'হস্তনির্মাণের প্রতিশ্রুতি',
    'seller.apply.submit': 'আবেদন জমা দেওয়া হয়েছে! আমরা শীঘ্রই পর্যালোচনা করব।',
    'seller.apply.submitted_notice': 'আবেদন জমা দেওয়া হয়েছে। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।',

    // ── Messaging ─────────────────────────────────────────────────────────────
    'msg.no_conversations': 'এখনো কোনো কথোপকথন নেই।',
    'msg.no_messages': 'এখনো কোনো বার্তা নেই। হ্যালো বলুন!',
    'msg.placeholder': 'একটি বার্তা লিখুন…',
    'msg.send': 'পাঠান',
    'msg.report_btn': '⚑ রিপোর্ট',
    'msg.block_btn': '🚫 ব্লক',
    'msg.unread_new': 'নতুন',
    'msg.chat_with': 'কথোপকথন',
    'msg.about': 'সম্পর্কে',
    'msg.block_confirm': 'এই ব্যবহারকারীকে ব্লক করবেন? আপনি আর তাদের বার্তা পাবেন না।',
    'msg.blocked': 'ব্যবহারকারী ব্লক করা হয়েছে',
    'msg.report_prompt': 'রিপোর্টের কারণ:\n১. হয়রানি\n২. প্রতারণার চেষ্টা\n৩. স্প্যাম\n৪. অন্যান্য\n\nকারণ লিখুন:',
    'msg.report_success': 'রিপোর্ট জমা দেওয়া হয়েছে',

    // ── Footer ────────────────────────────────────────────────────────────────
    'footer.about': 'আমাদের সম্পর্কে',
    'footer.contact': 'যোগাযোগ',
    'footer.safety': 'নিরাপত্তা টিপস',

    // ── General ───────────────────────────────────────────────────────────────
    'general.loading': 'লোড হচ্ছে…',
    'general.no_results': 'কোনো ফলাফল পাওয়া যায়নি।',
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

  t(key, vars) {
    let str = TRANSLATIONS[this.lang]?.[key] || TRANSLATIONS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(k => { str = str.replace('{' + k + '}', vars[k]); });
    }
    return str;
  },

  // Apply translations to all [data-i18n] elements in the DOM
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      const val = this.t(key);
      if (attr) {
        el.setAttribute(attr, val);
      } else {
        el.textContent = val;
      }
    });
    document.documentElement.lang = this.lang === 'bn' ? 'bn' : 'en';
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = this.lang === 'bn' ? 'EN' : 'বাং';
  },

  toggle() {
    this.lang = this.lang === 'en' ? 'bn' : 'en';
    // Reload so all dynamically rendered content re-renders in the new language
    window.location.reload();
  },

  init() {
    this.apply();
  },
};
