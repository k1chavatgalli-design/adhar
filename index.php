<?php
/**
 * MANOJ SERVICES - Main Entry Point (PHP)
 * Loads initial configuration, wallet balance, and profile from database
 */

require_once __DIR__ . '/config.php';

$walletBalance = getWalletBalance();
$pdo = getDB();
$profileStmt = $pdo->query("SELECT * FROM profile ORDER BY id ASC LIMIT 1");
$profile = $profileStmt->fetch();

$recentStmt = $pdo->query("SELECT * FROM transactions ORDER BY id DESC LIMIT 10");
$recentTransactions = $recentStmt->fetchAll();

// Include the main interface
include __DIR__ . '/index.html';
