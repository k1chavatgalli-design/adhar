<?php
/**
 * MANOJ SERVICES - Configuration File
 * Author: Manoj Services
 * Website: Manoj Services Digital Seva Hub
 */

// Start session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Application Constants
define('APP_NAME', 'MANOJ SERVICES');
define('APP_SUBTITLE', 'Authorized Citizen Digital Seva & Verification Portal');
define('APP_VERSION', '2.0.0');
define('CURRENCY_SYMBOL', '₹');

// SQLite Database Path
define('DB_FILE', __DIR__ . '/db/manoj_services.sqlite');

/**
 * Get PDO Database Connection (Auto-creates SQLite DB & Tables)
 */
function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dbDir = dirname(DB_FILE);
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0777, true);
    }

    $pdo = new PDO('sqlite:' . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Initialize tables if first run
    initDB($pdo);

    return $pdo;
}

/**
 * Initialize Database Schema & Default Records
 */
function initDB($pdo) {
    // 1. Users Table (Role: 'admin' or 'user')
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
        name TEXT NOT NULL,
        shop_name TEXT,
        vle_id TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        wallet_balance REAL DEFAULT 500.00,
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. API Settings Table (Admin API Changes)
    $pdo->exec("CREATE TABLE IF NOT EXISTS api_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_val TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 3. Wallet Top-Up Requests Table (User Request -> Admin Approve/Reject)
    $pdo->exec("CREATE TABLE IF NOT EXISTS topup_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        user_name TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'UPI',
        utr_number TEXT,
        status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
        admin_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 4. Wallet Transactions Ledger
    $pdo->exec("CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        txn_id TEXT NOT NULL UNIQUE,
        user_id INTEGER DEFAULT 1,
        username TEXT DEFAULT 'manoj',
        service_name TEXT NOT NULL,
        type TEXT NOT NULL, -- CREDIT or DEBIT
        amount REAL NOT NULL,
        closing_balance REAL NOT NULL,
        identifier TEXT,
        status TEXT DEFAULT 'SUCCESS',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 5. Service History Table (Previously Used Services)
    $pdo->exec("CREATE TABLE IF NOT EXISTS service_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref_id TEXT NOT NULL,
        user_id INTEGER DEFAULT 1,
        username TEXT DEFAULT 'manoj',
        service_type TEXT NOT NULL, -- PAN_FIND, AADHAAR_TO_PAN, VOTER_LINK
        service_title TEXT NOT NULL,
        input_data TEXT NOT NULL,
        result_data TEXT NOT NULL,
        fee_charged REAL DEFAULT 0.00,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed Default API Settings if empty
    $apiCount = $pdo->query("SELECT COUNT(*) as count FROM api_settings")->fetch()['count'];
    if ($apiCount == 0) {
        $defaultSettings = [
            ['api_key', 'b848a41feea7e111141f76500ada5ff756d2d882a3de1348747a8803398c', 'ApiCentre Primary API Key'],
            ['api_domain', 'https://www.apicentre.in', 'API Base URL Domain'],
            ['fee_pan_find', '15.00', 'Service Tariff Fee for PAN Find (in Rupees)'],
            ['fee_voter_link', '10.00', 'Service Tariff Fee for Voter Mobile Link (in Rupees)'],
            ['upi_id', 'manoj.services@upi', 'Admin Official UPI ID for Top-up Requests']
        ];
        $insSetting = $pdo->prepare("INSERT INTO api_settings (setting_key, setting_val, description) VALUES (?, ?, ?)");
        foreach ($defaultSettings as $s) {
            $insSetting->execute($s);
        }
    }

    // Seed Default Admin and User accounts if empty
    $userCount = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch()['count'];
    if ($userCount == 0) {
        // 1. Default Admin Account
        $adminStmt = $pdo->prepare("INSERT INTO users (username, password, role, name, shop_name, vle_id, phone, email, address, wallet_balance, status) 
            VALUES (:u, :p, 'admin', :name, :shop, :vle, :phone, :email, :addr, 10000.00, 'ACTIVE')");
        $adminStmt->execute([
            ':u'     => 'admin',
            ':p'     => 'admin123',
            ':name'  => 'Manoj Kumar (System Admin)',
            ':shop'  => 'Manoj Services Head Office',
            ':vle'   => 'MS-ADM-001',
            ':phone' => '+91 98765 43210',
            ':email' => 'admin.manoj@services.in',
            ':addr'  => 'Central Admin Hub, Manoj Services Plaza, India'
        ]);

        // 2. Default Standard User Account
        $userStmt = $pdo->prepare("INSERT INTO users (username, password, role, name, shop_name, vle_id, phone, email, address, wallet_balance, status) 
            VALUES (:u, :p, 'user', :name, :shop, :vle, :phone, :email, :addr, 500.00, 'ACTIVE')");
        $userStmt->execute([
            ':u'     => 'manoj',
            ':p'     => 'user123',
            ':name'  => 'Manoj Kumar',
            ':shop'  => 'Manoj Services & Digital Seva Kendra',
            ':vle'   => 'MS-IND-2024-8842',
            ':phone' => '+91 98765 43210',
            ':email' => 'manoj.services.csc@gmail.com',
            ':addr'  => 'Shop No. 12, Main Market Road, Near Gandhi Chowk, India'
        ]);

        // 3. Second Demo User Account for testing multi-user
        $userStmt->execute([
            ':u'     => 'rajesh',
            ':p'     => 'user123',
            ':name'  => 'Rajesh Sharma',
            ':shop'  => 'Sharma Digital Cyber World',
            ':vle'   => 'MS-DL-2024-5110',
            ':phone' => '+91 91234 56789',
            ':email' => 'rajesh.sharma.csc@gmail.com',
            ':addr'  => 'Plot 45, Sector 14, Metro Road, India'
        ]);

        // Initial welcome transactions
        $pdo->exec("INSERT INTO transactions (txn_id, user_id, username, service_name, type, amount, closing_balance, identifier, status) 
                    VALUES ('TXN-WLC-1001', 2, 'manoj', 'Welcome Promotional Balance', 'CREDIT', 500.00, 500.00, 'SYSTEM', 'SUCCESS')");
        $pdo->exec("INSERT INTO transactions (txn_id, user_id, username, service_name, type, amount, closing_balance, identifier, status) 
                    VALUES ('TXN-WLC-1002', 3, 'rajesh', 'Welcome Promotional Balance', 'CREDIT', 500.00, 500.00, 'SYSTEM', 'SUCCESS')");
    }
}

/**
 * Get dynamic API setting by key
 */
function getApiSetting($key, $default = '') {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT setting_val FROM api_settings WHERE setting_key = :k LIMIT 1");
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch();
    return $row ? $row['setting_val'] : $default;
}

/**
 * Helper to fetch current logged-in user or default to 'manoj'
 */
function getCurrentUser() {
    $pdo = getDB();
    $userId = $_SESSION['user_id'] ?? null;
    $username = $_SESSION['username'] ?? null;

    if ($userId) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        if ($user) return $user;
    }

    if ($username) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :u LIMIT 1");
        $stmt->execute([':u' => $username]);
        $user = $stmt->fetch();
        if ($user) return $user;
    }

    // Default fallback to user 'manoj'
    $stmt = $pdo->query("SELECT * FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 1");
    return $stmt->fetch();
}

/**
 * Helper to fetch wallet balance for a specific user
 */
function getUserWalletBalance($userId) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $row = $stmt->fetch();
    return $row ? floatval($row['wallet_balance']) : 0.00;
}

/**
 * Helper to record wallet transactions and update balance for a user
 */
function recordUserTransaction($userId, $serviceName, $type, $amount, $identifier = '') {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("SELECT username, wallet_balance FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) return false;

    $currentBalance = floatval($user['wallet_balance']);
    $username = $user['username'];

    if ($type === 'DEBIT') {
        if ($currentBalance < $amount) {
            return false; // Insufficient balance
        }
        $newBalance = $currentBalance - $amount;
    } else {
        $newBalance = $currentBalance + $amount;
    }

    // Update user's wallet
    $upStmt = $pdo->prepare("UPDATE users SET wallet_balance = :balance WHERE id = :id");
    $upStmt->execute([':balance' => $newBalance, ':id' => $userId]);

    // Record in transaction table
    $txnId = 'TXN-' . strtoupper(substr(uniqid(), -8));
    $txnStmt = $pdo->prepare("INSERT INTO transactions (txn_id, user_id, username, service_name, type, amount, closing_balance, identifier, status) 
                              VALUES (:txn_id, :uid, :u, :service, :type, :amt, :closing, :ident, 'SUCCESS')");
    $txnStmt->execute([
        ':txn_id'  => $txnId,
        ':uid'     => $userId,
        ':u'       => $username,
        ':service' => $serviceName,
        ':type'    => $type,
        ':amt'     => $amount,
        ':closing' => $newBalance,
        ':ident'   => $identifier
    ]);

    return [
        'txn_id'      => $txnId,
        'new_balance' => $newBalance
    ];
}
