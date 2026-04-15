# ORIGINALHUB – Complete Testing Document
**Version:** 1.0  
**Prepared For:** OriginalHub Platform  
**Test Type:** Functional & User Acceptance Testing  
**Total Test Cases:** 61

---

## SECTION 1: TEST ENVIRONMENT

### 1.1 Hardware Requirements
| Component | Minimum |
|---|---|
| CPU | 1 GHz dual-core |
| RAM | 2 GB |
| Disk | 10 GB free |
| Network | Broadband (5 Mbps+) |

### 1.2 Software Requirements
| Software | Version |
|---|---|
| OS | Ubuntu 22.04 / Windows 10+ / macOS 12+ |
| Node.js | 20.x |
| PostgreSQL | 14+ |
| Browser (Chrome) | 120+ |
| Browser (Firefox) | 120+ |
| Browser (Edge) | 120+ |

### 1.3 Test Accounts to Create Before Testing

| Account | Email | Password | Role | Notes |
|---|---|---|---|---|
| Admin | admin@test.com | Admin1234! | admin | Created via create-admin.js |
| Approved Seller | seller@test.com | Seller1234! | seller | Apply + approve before tests |
| New Seller (pending) | newsel@test.com | Seller1234! | buyer → seller | Applied, not yet approved |
| Buyer 1 | buyer1@test.com | Buyer1234! | buyer | Primary test buyer |
| Buyer 2 | buyer2@test.com | Buyer1234! | buyer | Secondary test buyer |
| Banned User | banned@test.com | Banned1234! | buyer | Ban via admin panel |

---

## SECTION 2: TEST DATA REQUIREMENTS

### 2.1 Sample Products to Create

| # | Title | Category | Price (BDT) | Status |
|---|---|---|---|---|
| 1 | Handwoven Cotton Scarf | Textiles | 850 | published |
| 2 | Terracotta Flower Pot Set | Pottery | 1200 | published |
| 3 | Beaded Silver Bracelet | Jewelry | 650 | published |
| 4 | Handmade Soy Candle | Home Decor | 450 | published |
| 5 | Sourdough Bread Loaf | Baked Goods | 300 | published |
| 6 | Draft Product | Art | 500 | draft |
| 7 | Rejected Product | Other | 200 | rejected |

### 2.2 Sample Images
- Prepare 5 test images (JPEG/PNG, under 5 MB each)
- Include 1 image exceeding 5 MB (for negative testing)
- Include 1 non-image file (e.g., `.pdf`) for type validation testing

### 2.3 Test Messages
- Short message: `"Is this still available?"`
- Long message: 2000 characters of text (exactly at limit)
- Over-limit message: 2001 characters (should be rejected)

---

## SECTION 3: TEST CASES

### 3.1 User Registration & Authentication (8 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| AUTH-01 | Register new buyer | 1. Open site 2. Click Register 3. Fill full_name, email, password (8+ chars) 4. Submit | User created, JWT returned, redirected to homepage, navbar shows user name | |
| AUTH-02 | Register with duplicate email | 1. Register same email twice | Error: "Email already registered" | |
| AUTH-03 | Register with weak password | 1. Register with password < 8 chars | Error: "Password must be at least 8 characters" | |
| AUTH-04 | Login with valid credentials | 1. Click Login 2. Enter correct email+password 3. Submit | Token stored, navbar updated, success | |
| AUTH-05 | Login with wrong password | 1. Enter correct email + wrong password | Error: "Invalid credentials" | |
| AUTH-06 | Forgot password flow | 1. Click "Forgot Password" 2. Enter valid email 3. Submit | Email sent with reset link; success message shown | |
| AUTH-07 | Reset password via token | 1. Open reset link from email 2. Enter new password 3. Submit | Password updated; redirect to homepage | |
| AUTH-08 | Access protected page when logged out | 1. Logout 2. Visit /seller-dashboard.html | Redirected or login modal shown | |

---

### 3.2 Seller Application (6 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| SELL-01 | Submit seller application | 1. Login as buyer 2. Go to /apply-seller.html 3. Fill all fields 4. Submit | "Application submitted. Pending admin approval." message shown | |
| SELL-02 | Duplicate application | 1. Submit application 2. Try to submit again | Error: "You already have a seller application" | |
| SELL-03 | Admin approves seller | 1. Login as admin 2. Go to Admin → Seller Applications 3. Click Approve | Seller role assigned; seller can now list products; approval email sent | |
| SELL-04 | Admin rejects seller | 1. Login as admin 2. Go to Seller Applications 3. Click Reject 4. Enter reason | Application rejected; rejection email sent with reason | |
| SELL-05 | Unapproved seller cannot list products | 1. Apply as seller (don't approve) 2. Try POST /api/products | Error: "Seller not approved" | |
| SELL-06 | Seller profile update | 1. Login as approved seller 2. Go to seller dashboard → Shop Profile 3. Update bio, location 4. Save | Profile updated successfully | |

---

### 3.3 Product Listing (10 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| PROD-01 | Create product with all fields | 1. Login as seller 2. Click + Add Product 3. Fill all fields including handmade proof 4. Upload 2 images 5. Submit | Product created with status `pending_review`; appears in seller's product list | |
| PROD-02 | Create product without handmade proof | 1. Submit product with empty handmade_proof_text | Error: "handmade_proof_text required" | |
| PROD-03 | Description too short | 1. Submit product with description < 50 chars | Error: "Description must be at least 50 characters" | |
| PROD-04 | First 3 products auto-go to pending_review | 1. Create 3 products as new seller | All 3 have status `pending_review` regardless of seller's choice | |
| PROD-05 | Admin approves product | 1. Login as admin 2. Pending Products → Approve | Product status → `published`; visible in browse | |
| PROD-06 | Admin rejects product | 1. Login as admin 2. Pending Products → Reject + reason | Product status → `rejected`; seller sees rejection_reason | |
| PROD-07 | Upload image exceeding 5 MB | 1. Try to upload >5 MB image | Error: file too large | |
| PROD-08 | Upload invalid file type | 1. Try to upload PDF | Error: "Invalid file type" | |
| PROD-09 | Mark product as sold | 1. Login as seller 2. Click "Mark Sold" on published product | Status → `sold`; no longer shown in browse; sold_this_month counter increments | |
| PROD-10 | Delete product | 1. Login as seller 2. Click Delete on a product | Product permanently removed; no longer visible | |

---

### 3.4 Browsing & Search (6 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| SRCH-01 | Homepage shows published products only | 1. Open homepage | Only products with status=`published` shown; draft/pending/rejected NOT shown | |
| SRCH-02 | Keyword search | 1. Type "scarf" in search bar 2. Submit | Products with "scarf" in title or description returned | |
| SRCH-03 | Category filter | 1. Browse → select "Jewelry" filter | Only Jewelry products shown | |
| SRCH-04 | Price range filter | 1. Browse → min 500 BDT, max 1000 BDT | Only products within price range shown | |
| SRCH-05 | Location filter | 1. Browse → type "Dhaka" in location | Only products from Dhaka sellers shown | |
| SRCH-06 | Product detail page | 1. Click any product card | Full detail page loads: all images, description, handmade proof, seller info, Message Seller button, view count increments | |

---

### 3.5 Messaging System (12 tests) — CORE FEATURE

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| MSG-01 | Start new conversation | 1. Login as buyer 2. Open product detail 3. Click "Message Seller" 4. Type message 5. Send | Message saved; appears in chat bubble; thread created | |
| MSG-02 | Payment disclaimer shown | 1. Open any conversation | ⚠️ payment disclaimer banner is visible in every chat | |
| MSG-03 | Real-time message polling | 1. Open same conversation in two browsers 2. Send message from one | Other browser shows new message within 3 seconds (polling interval) | |
| MSG-04 | Message character limit | 1. Try to send message > 2000 chars | Error: "Message too long" | |
| MSG-05 | Rate limiting | 1. Send 21 messages in < 1 minute | 21st message rejected: "Message rate limit exceeded" | |
| MSG-06 | Cannot message yourself | 1. Try to send message to own user_id via API | Error: "Cannot message yourself" | |
| MSG-07 | Unread count badge in navbar | 1. Send message to user 2. Login as recipient | Unread badge shows correct count in navbar | |
| MSG-08 | Mark messages as read | 1. Open conversation with unread messages | Unread count decrements to 0 after opening thread | |
| MSG-09 | Thread list shows correct order | 1. Have 3 conversations 2. Send message in oldest | That conversation moves to top of thread list | |
| MSG-10 | Block user | 1. Open conversation 2. Click 🚫 Block 3. Blocked user tries to message | Blocked user sees "Unable to send message" | |
| MSG-11 | Report conversation | 1. Open conversation 2. Click ⚑ Report 3. Enter reason | Report saved; admin can see it | |
| MSG-12 | Seller response time shown on seller page | 1. Have seller respond to 3 messages 2. View seller public profile | Average response time calculated and displayed | |

---

### 3.6 Favorites / Wishlist (4 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| FAV-01 | Add product to favorites | 1. Login as buyer 2. Open product detail 3. Click ♡ Save | Button changes to ♥ Saved; product appears in buyer dashboard Saved Items | |
| FAV-02 | Remove from favorites | 1. Click ♥ Saved on favorited product | Product removed from favorites; button returns to ♡ Save | |
| FAV-03 | Favorites persist across sessions | 1. Add to favorites 2. Logout 3. Login again 4. Check buyer dashboard | Saved items still present | |
| FAV-04 | Sold/unavailable items flagged | 1. Favorite a product 2. Seller marks it as sold | Item still in favorites but marked "No longer available" | |

---

### 3.7 Reporting System (6 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| RPT-01 | Report a product | 1. Login as buyer 2. Open product detail 3. Expand "Report this listing" 4. Select reason 5. Submit | Report saved; toast "Report submitted. Thank you." | |
| RPT-02 | Report a conversation | 1. Open any conversation 2. Click ⚑ Report 3. Enter reason | Report saved with conversation_product_id | |
| RPT-03 | Admin views reports | 1. Login as admin 2. Admin → Reports | All pending reports listed with reason, reporter, product | |
| RPT-04 | Admin resolves report – delete product | 1. Admin selects action "Delete Product" 2. Click Apply | Product deleted; report status → resolved | |
| RPT-05 | Admin bans user | 1. Admin selects action "Ban User" 2. Apply on report | User.is_banned = true; user cannot login | |
| RPT-06 | Auto-suspension after 3 resolved reports | 1. Create 3 resolved reports against one seller within 30 days | Seller account suspended for 7 days automatically | |

---

### 3.8 Admin Dashboard (6 tests)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| ADM-01 | Platform stats accurate | 1. Login as admin 2. View Dashboard | Total users, published products, messages today/week/month, active sellers all show correct counts | |
| ADM-02 | Pending seller applications list | 1. Admin → Seller Applications | All unapproved, non-rejected applications shown | |
| ADM-03 | Pending products list | 1. Admin → Pending Products | All products with status=`pending_review` shown | |
| ADM-04 | User management | 1. Admin → Users | Full user list with role, status, joined date | |
| ADM-05 | Ban and unban user | 1. Ban a user 2. That user tries to login | Banned user gets "Account banned" error. Unban restores access | |
| ADM-06 | Non-admin cannot access admin routes | 1. Login as buyer 2. GET /api/admin/stats | HTTP 403 Forbidden | |

---

### 3.9 Configuration (config.js) – 3 tests

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| CFG-01 | Change site name | 1. Edit `SITE_NAME` in `public/js/config.js` 2. Restart server 3. Reload homepage | New name appears in browser tab, hero section, navbar | |
| CFG-02 | Change primary colour | 1. Edit `PRIMARY_COLOR` to `"#0066cc"` 2. Reload page | All buttons, price labels, links use the new colour | |
| CFG-03 | Change payment disclaimer | 1. Edit `PAYMENT_DISCLAIMER` text 2. Reload 3. Open any conversation | New disclaimer text shown in every chat | |

---

## SECTION 4: BUG REPORTING TEMPLATE

```
BUG REPORT
────────────────────────────────────────────────────────────────────
| Field              | Value                                        |
|─────────────────────|──────────────────────────────────────────────|
| Bug ID             | BUG-XXX                                      |
| Test Case ID       | e.g., MSG-03                                 |
| Summary            | One-line description (max 10 words)          |
| Steps to Reproduce | 1.                                           |
|                    | 2.                                           |
|                    | 3.                                           |
| Expected Result    |                                              |
| Actual Result      |                                              |
| Browser            | Chrome 122 / Firefox 121 / Edge 121          |
| Screen Resolution  | 1920×1080 / 375×812 (mobile)                |
| Screenshot         | Attach if applicable                         |
| Severity           | Critical / Major / Minor / Suggestion        |
| Status             | Open / In Progress / Fixed / Closed          |
────────────────────────────────────────────────────────────────────
```

### Severity Definitions

| Severity | Definition | Example |
|---|---|---|
| **Critical** | Platform unusable; data loss or security breach | Login broken; messages not saving |
| **Major** | Core feature broken; no workaround | Cannot send messages; products not listing |
| **Minor** | Feature degraded but workaround exists | Pagination count off by one |
| **Suggestion** | Enhancement or UI improvement | Button label wording |

---

## SECTION 5: TEST SIGN-OFF SHEET

### 5.1 Test Execution Log

| Test ID | Tester | Date | Pass/Fail | Bug ID (if any) |
|---|---|---|---|---|
| AUTH-01 | | | | |
| AUTH-02 | | | | |
| AUTH-03 | | | | |
| AUTH-04 | | | | |
| AUTH-05 | | | | |
| AUTH-06 | | | | |
| AUTH-07 | | | | |
| AUTH-08 | | | | |
| SELL-01 | | | | |
| SELL-02 | | | | |
| SELL-03 | | | | |
| SELL-04 | | | | |
| SELL-05 | | | | |
| SELL-06 | | | | |
| PROD-01 | | | | |
| PROD-02 | | | | |
| PROD-03 | | | | |
| PROD-04 | | | | |
| PROD-05 | | | | |
| PROD-06 | | | | |
| PROD-07 | | | | |
| PROD-08 | | | | |
| PROD-09 | | | | |
| PROD-10 | | | | |
| SRCH-01 | | | | |
| SRCH-02 | | | | |
| SRCH-03 | | | | |
| SRCH-04 | | | | |
| SRCH-05 | | | | |
| SRCH-06 | | | | |
| MSG-01 | | | | |
| MSG-02 | | | | |
| MSG-03 | | | | |
| MSG-04 | | | | |
| MSG-05 | | | | |
| MSG-06 | | | | |
| MSG-07 | | | | |
| MSG-08 | | | | |
| MSG-09 | | | | |
| MSG-10 | | | | |
| MSG-11 | | | | |
| MSG-12 | | | | |
| FAV-01 | | | | |
| FAV-02 | | | | |
| FAV-03 | | | | |
| FAV-04 | | | | |
| RPT-01 | | | | |
| RPT-02 | | | | |
| RPT-03 | | | | |
| RPT-04 | | | | |
| RPT-05 | | | | |
| RPT-06 | | | | |
| ADM-01 | | | | |
| ADM-02 | | | | |
| ADM-03 | | | | |
| ADM-04 | | | | |
| ADM-05 | | | | |
| ADM-06 | | | | |
| CFG-01 | | | | |
| CFG-02 | | | | |
| CFG-03 | | | | |

### 5.2 Bug Summary

| Severity | Total Found | Total Fixed | Outstanding |
|---|---|---|---|
| Critical | | | |
| Major | | | |
| Minor | | | |
| Suggestion | | | |
| **TOTAL** | | | |

### 5.3 Final Sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| QA Lead | | | |
| Developer | | | |
| Product Owner | | | |

### 5.4 Go / No-Go Decision

- **GO criteria:** Zero Critical bugs, ≤ 2 Major bugs with accepted workarounds, all AUTH and MSG tests pass.
- **NO-GO criteria:** Any Critical bug open, messaging system fails any of MSG-01 through MSG-05, or payment disclaimer (MSG-02) fails.

**Decision:** ☐ GO &nbsp;&nbsp; ☐ NO-GO

**Notes:**

---

*END OF TESTING DOCUMENT*
