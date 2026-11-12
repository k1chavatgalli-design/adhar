# MANOJ SERVICES - Dual Role (Admin & User) Portal

Welcome to **MANOJ SERVICES**, an advanced digital seva and citizen utility portal with separate **Admin** and **User** role capabilities.

---

## 👥 Dual Login Credentials

The portal features a single, unified login modal with instant **1-Click Quick Demo Login** buttons:

| Role | Username | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin` | `admin123` | Create User, Delete User, Add Money to any User, Profile Correction, Add API Changes, Approve/Reject Topup Requests |
| **👤 USER** | `manoj` | `user123` | Use Services, 📜 Service History, Wallet Top-up Request, Modify Profile |
| **👤 USER 2** | `rajesh` | `user123` | Secondary test user for multi-user testing |

---

## 👑 ADMIN Capabilities

1. **Create User**:
   - Create new kiosk accounts with Username, Password, Full Name, Shop Name, Phone, and Initial Wallet Credit.
2. **Delete User**:
   - Permanently delete any operator account with 1-click confirmation.
3. **Add Money**:
   - Direct wallet credit to any user with custom amount and credit note.
   - Review and **Approve / Reject** user-submitted wallet top-up requests (instantly credits the user's wallet).
4. **Profile Correction**:
   - Correct/edit any user's Full Name, Shop Name, VLE ID, Phone, Email, and Operating Address.
5. **Add API Changes**:
   - Update primary API Key (`b848a41feea7e111141f76500ada5ff756d2d882a3de1348747a8803398c`).
   - Change API Domain (`https://www.apicentre.in`).
   - Adjust Service Tariff charges (PAN Find fee ₹15, Voter Mobile Link fee ₹10).
   - Update official UPI ID for wallet top-ups.
   - Live "Ping / Test API" connection button.

---

## 👤 USER Capabilities

1. **Use Services**:
   - **PAN Find (Dual-Mode)**:
     - Find linked Aadhaar Number from PAN.
     - Find PAN Number from 12-digit Aadhaar via apicentre PHP cURL.
   - **Voter Mobile Link**:
     - Verify if customer's mobile number is linked with their Voter ID (EPIC).
2. **📜 Service History (Inside Services)**:
   - A dedicated **"Service History"** button is embedded directly inside both the PAN Find and Voter Mobile Link interfaces (as well as in the top navigation).
   - Clicking it opens all previously used services by the user with:
     - Service type, Input Identifier, Result Data, Fee charged, Date & Time, and 1-click **Print Receipt Slip**!
3. **Wallet Top-up Request**:
   - Submit top-up request with Amount (e.g. ₹100, ₹200, ₹500, ₹1000), payment method (UPI), and transaction UTR Reference number.
   - Live status tracker showing `PENDING 🟡` or `APPROVED 🟢`.
   - 1-Click Instant Demo Credit for immediate testing.
4. **Modify Profile**:
   - Users can update their own Full Name, Shop Name, Phone, Email, and Operating Address.

---

## 📁 File Structure

- [`config.php`](file:///C:/xampp/htdocs/manoj-services/config.php) - Database schema (users, api_settings, topup_requests, service_history)
- [`index.html`](file:///C:/xampp/htdocs/manoj-services/index.html) - Dual-role responsive frontend interface
- [`app.js`](file:///C:/xampp/htdocs/manoj-services/app.js) - Role switcher, service history modal, admin operations, client simulation
- [`api/auth.php`](file:///C:/xampp/htdocs/manoj-services/api/auth.php) - Login, logout, session management
- [`api/admin.php`](file:///C:/xampp/htdocs/manoj-services/api/admin.php) - Create/delete users, add money, profile correction, API settings, topup approvals
- [`api/user.php`](file:///C:/xampp/htdocs/manoj-services/api/user.php) - Modify profile, top-up requests, service history
- [`api/aadhaar_to_pan.php`](file:///C:/xampp/htdocs/manoj-services/api/aadhaar_to_pan.php) - User-provided cURL script for apicentre
- [`api/voter_link.php`](file:///C:/xampp/htdocs/manoj-services/api/voter_link.php) - User-provided cURL script for voter link

---

## 🚀 Running the App
- **XAMPP Apache**: Open `http://localhost/manoj-services/`
- **Instant Browser**: Double-click `C:\xampp\htdocs\manoj-services\index.html`
