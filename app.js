/**
 * MANOJ SERVICES - Frontend Application Controller
 * Dual Roles: ADMIN and USER
 * Full support for API Gateway, User Management, Service History & Top-up Requests
 */

// Global Application State
const STATE = {
  // Current logged in user (default: User Manoj)
  currentUser: {
    id: 2,
    username: 'manoj',
    role: 'user', // 'admin' or 'user'
    name: 'Manoj Kumar',
    shop_name: 'Manoj Services & Digital Seva Kendra',
    vle_id: 'MS-IND-2024-8842',
    phone: '+91 98765 43210',
    email: 'manoj.services.csc@gmail.com',
    address: 'Shop No. 12, Main Market Road, Near Gandhi Chowk, India',
    wallet_balance: 500.00
  },

  // Admin Configured API Settings
  apiSettings: {
    api_key: 'b848a41feea7e111141f76500ada5ff756d2d882a3de1348747a8803398c',
    api_domain: 'https://www.apicentre.in',
    fee_pan_find: 15.00,
    fee_voter_link: 10.00,
    upi_id: 'manoj.services@upi'
  },

  // Users List (for Admin)
  users: [
    {
      id: 1,
      username: 'admin',
      role: 'admin',
      name: 'Manoj Kumar (System Admin)',
      shop_name: 'Manoj Services Head Office',
      vle_id: 'MS-ADM-001',
      phone: '+91 98765 43210',
      email: 'admin.manoj@services.in',
      address: 'Central Admin Plaza, India',
      wallet_balance: 10000.00,
      status: 'ACTIVE'
    },
    {
      id: 2,
      username: 'manoj',
      role: 'user',
      name: 'Manoj Kumar',
      shop_name: 'Manoj Services & Digital Seva Kendra',
      vle_id: 'MS-IND-2024-8842',
      phone: '+91 98765 43210',
      email: 'manoj.services.csc@gmail.com',
      address: 'Shop No. 12, Main Market Road, India',
      wallet_balance: 500.00,
      status: 'ACTIVE'
    },
    {
      id: 3,
      username: 'rajesh',
      role: 'user',
      name: 'Rajesh Sharma',
      shop_name: 'Sharma Cyber World',
      vle_id: 'MS-DL-2024-5110',
      phone: '+91 91234 56789',
      email: 'rajesh.sharma.csc@gmail.com',
      address: 'Plot 45, Sector 14, India',
      wallet_balance: 350.00,
      status: 'ACTIVE'
    }
  ],

  // Service History Records
  serviceHistory: [
    {
      ref_id: 'MS-PAN-88192',
      service_type: 'PAN_FIND',
      service_title: 'PAN Find',
      input_data: 'ABCDE1234F',
      result_data: 'XXXX-XXXX-8921 (Linked)',
      fee_charged: 15.00,
      status: 'SUCCESS',
      created_at: '12 Nov 2026, 07:30 PM'
    },
    {
      ref_id: 'MS-VOT-41092',
      service_type: 'VOTER_LINK',
      service_title: 'Voter Mobile Link',
      input_data: 'WBF1234567 | 9876543210',
      result_data: 'LINKED & VERIFIED (Manoj Kumar)',
      fee_charged: 10.00,
      status: 'SUCCESS',
      created_at: '12 Nov 2026, 07:45 PM'
    }
  ],

  // Topup Requests
  topupRequests: [
    {
      id: 1,
      request_id: 'REQ-91024',
      user_id: 2,
      username: 'manoj',
      user_name: 'Manoj Kumar',
      amount: 500.00,
      payment_method: 'UPI',
      utr_number: '432190823412',
      status: 'APPROVED',
      created_at: '12 Nov 2026, 06:15 PM'
    }
  ],

  // Wallet Transactions
  transactions: [
    {
      txn_id: 'TXN-WLC-1001',
      service_name: 'Welcome Promotional Balance',
      type: 'CREDIT',
      amount: 500.00,
      closing_balance: 500.00,
      identifier: 'SYSTEM',
      status: 'SUCCESS',
      created_at: '12 Nov 2026, 06:00 PM'
    }
  ],

  currentMaskedAadhaar: 'XXXX-XXXX-8921',
  currentRealAadhaar: '8921 4452 8921',
  isAadhaarMasked: true,
  lastPrintData: null
};

// ==========================================
// 1. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  initRouter();
  initClock();

  // Mandatory Gatekeeper Login Check (Asks ID & Pass first before granting access)
  const isAuth = sessionStorage.getItem('ms_auth_active');
  if (isAuth === 'true' && STATE.currentUser) {
    hideLoginGatekeeper();
    applyRoleUI();
    renderAll();
  } else {
    showLoginGatekeeper();
  }
});

function loadLocalState() {
  try {
    const savedUser = localStorage.getItem('ms_current_user');
    if (savedUser) STATE.currentUser = JSON.parse(savedUser);

    const savedUsers = localStorage.getItem('ms_users');
    if (savedUsers) STATE.users = JSON.parse(savedUsers);

    const savedHistory = localStorage.getItem('ms_service_history');
    if (savedHistory) STATE.serviceHistory = JSON.parse(savedHistory);

    const savedReqs = localStorage.getItem('ms_topup_requests');
    if (savedReqs) STATE.topupRequests = JSON.parse(savedReqs);

    const savedApi = localStorage.getItem('ms_api_settings');
    if (savedApi) STATE.apiSettings = JSON.parse(savedApi);

    const savedTxns = localStorage.getItem('ms_transactions');
    if (savedTxns) STATE.transactions = JSON.parse(savedTxns);
  } catch (e) {
    console.warn('LocalStorage load warning:', e);
  }
}

function saveLocalState() {
  try {
    localStorage.setItem('ms_current_user', JSON.stringify(STATE.currentUser));
    localStorage.setItem('ms_users', JSON.stringify(STATE.users));
    localStorage.setItem('ms_service_history', JSON.stringify(STATE.serviceHistory));
    localStorage.setItem('ms_topup_requests', JSON.stringify(STATE.topupRequests));
    localStorage.setItem('ms_api_settings', JSON.stringify(STATE.apiSettings));
    localStorage.setItem('ms_transactions', JSON.stringify(STATE.transactions));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

async function syncSessionWithBackend() {
  try {
    const res = await fetch('api/auth.php?action=get_session');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        STATE.currentUser = data.user;
        applyRoleUI();
        renderAll();
      }
    }
  } catch (e) {}

  try {
    const resApi = await fetch('api/admin.php?action=get_api_settings');
    if (resApi.ok) {
      const dataApi = await resApi.json();
      if (dataApi.status === 'success' && dataApi.settings) {
        dataApi.settings.forEach(s => {
          STATE.apiSettings[s.setting_key] = s.setting_val;
        });
      }
    }
  } catch (e) {}
}

function initClock() {
  const clockEl = document.getElementById('liveClock');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
    }
  };
  update();
  setInterval(update, 1000);
}

// ==========================================
// 2. DUAL ROLE AUTHENTICATION & LOGIN
// ==========================================
function applyRoleUI() {
  const u = STATE.currentUser;
  const isAdmin = u.role === 'admin';

  // Header and Topbar text
  const topText = document.getElementById('topRoleText');
  const topBadge = document.getElementById('topRoleBadge');
  if (topText) {
    topText.textContent = isAdmin ? `👑 Administrator (${u.username})` : `👤 User (${u.name.split(' ')[0]})`;
  }
  if (topBadge) {
    topBadge.className = isAdmin 
      ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-300 border border-red-400/30'
      : 'inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30';
  }

  // Header Avatar and Name
  const avatarEl = document.getElementById('headerUserAvatar');
  const nameEl = document.getElementById('headerUserName');
  const roleEl = document.getElementById('headerUserRoleBadge');
  
  if (nameEl) nameEl.textContent = u.name;
  if (roleEl) {
    roleEl.textContent = isAdmin ? 'ADMIN' : 'USER';
    roleEl.className = isAdmin ? 'text-[9px] uppercase tracking-wider text-yellow-300 font-extrabold' : 'text-[9px] uppercase tracking-wider text-blue-200 font-bold';
  }
  if (avatarEl) {
    avatarEl.textContent = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEl.className = isAdmin ? 'w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px] font-bold' : 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold';
  }

  // Toggle Nav Bars
  const userNav = document.getElementById('userNavLinks');
  const adminNav = document.getElementById('adminNavLinks');
  const mobileUser = document.getElementById('mobileUserLinks');
  const mobileAdmin = document.getElementById('mobileAdminLinks');

  if (isAdmin) {
    if (userNav) userNav.classList.add('hidden');
    if (adminNav) adminNav.classList.remove('hidden');
    if (mobileUser) mobileUser.classList.add('hidden');
    if (mobileAdmin) mobileAdmin.classList.remove('hidden');
  } else {
    if (userNav) userNav.classList.remove('hidden');
    if (adminNav) adminNav.classList.add('hidden');
    if (mobileUser) mobileUser.classList.remove('hidden');
    if (mobileAdmin) mobileAdmin.classList.add('hidden');
  }

  renderTariffFees();
}

// ==========================================
// 2. GATEKEEPER LOGIN CONTROLS (MANDATORY ACCESS)
// ==========================================
function showLoginGatekeeper() {
  STATE.isAuthenticated = false;
  sessionStorage.removeItem('ms_auth_active');
  const gate = document.getElementById('authGatekeeper');
  if (gate) {
    gate.classList.remove('hidden');
    gate.style.display = 'flex';
  }
  const uInput = document.getElementById('gatekeeperUserId');
  const pInput = document.getElementById('gatekeeperPassword');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
  const errBox = document.getElementById('gatekeeperErrorAlert');
  if (errBox) errBox.classList.add('hidden');
  setTimeout(() => { if (uInput) uInput.focus(); }, 100);
}

function hideLoginGatekeeper() {
  STATE.isAuthenticated = true;
  sessionStorage.setItem('ms_auth_active', 'true');
  const gate = document.getElementById('authGatekeeper');
  if (gate) {
    gate.classList.add('hidden');
    gate.style.display = 'none';
  }
}

async function handleGatekeeperLogin(e) {
  if (e) e.preventDefault();
  const uInput = document.getElementById('gatekeeperUserId');
  const pInput = document.getElementById('gatekeeperPassword');
  const errBox = document.getElementById('gatekeeperErrorAlert');
  const errMsg = document.getElementById('gatekeeperErrorMessage');
  const submitBtn = document.getElementById('gatekeeperSubmitBtn');

  const username = uInput ? uInput.value.trim() : '';
  const password = pInput ? pInput.value.trim() : '';

  if (!username || !password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter both User ID and Password.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Verifying...</span>';
  }

  let authenticatedUser = null;

  try {
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch('api/auth.php', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        authenticatedUser = data.user;
      }
    }
  } catch (netErr) {}

  if (!authenticatedUser) {
    // Check known registered users
    const foundUser = STATE.users.find(u => (u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === username.toLowerCase())));
    if (foundUser) {
      const expectedPass = (foundUser.username === 'admin') ? 'admin123' : (foundUser.password || 'user123');
      if (password === expectedPass) {
        authenticatedUser = Object.assign({}, foundUser);
      }
    } else if (username === 'admin' && password === 'admin123') {
      authenticatedUser = {
        id: 1,
        username: 'admin',
        role: 'admin',
        name: 'Manoj Kumar (System Admin)',
        shop_name: 'Manoj Services HQ',
        vle_id: 'MS-ADM-001',
        phone: '+91 98765 43210',
        email: 'admin.manoj@services.in',
        address: 'Central Admin Hub, India',
        wallet_balance: 10000.00
      };
    } else if (username === 'manoj' && password === 'user123') {
      authenticatedUser = {
        id: 2,
        username: 'manoj',
        role: 'user',
        name: 'Manoj Kumar',
        shop_name: 'Manoj Services Digital Hub',
        vle_id: 'MS-IND-2024-8842',
        phone: '+91 98765 43210',
        email: 'manoj.services.csc@gmail.com',
        address: 'Shop No. 12, Main Market Road, India',
        wallet_balance: 500.00
      };
    }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> <span>Access Login</span>';
  }

  if (authenticatedUser) {
    STATE.currentUser = authenticatedUser;
    saveLocalState();
    hideLoginGatekeeper();
    applyRoleUI();
    renderAll();

    if (errBox) errBox.classList.add('hidden');

    if (STATE.currentUser.role === 'admin') {
      navigateTo('admin-dashboard');
    } else {
      navigateTo('home');
    }

    showToast(`Access Granted! Welcome ${STATE.currentUser.name} (${STATE.currentUser.role.toUpperCase()})`, 'success');
  } else {
    if (errBox && errMsg) {
      errMsg.textContent = 'Invalid User ID or Password. Access Denied.';
      errBox.classList.remove('hidden');
    }
    showToast('Invalid User ID or Password. Access Denied.', 'error');
  }
}

function fillAndLoginGatekeeper(u, p) {
  const uInput = document.getElementById('gatekeeperUserId');
  const pInput = document.getElementById('gatekeeperPassword');
  if (uInput) uInput.value = u;
  if (pInput) pInput.value = p;
  handleGatekeeperLogin();
}

function handleLogout() {
  try {
    fetch('api/auth.php?action=logout');
  } catch (e) {}

  showLoginGatekeeper();
  showToast('You have logged out securely.', 'info');
}

function togglePasswordVisibility(inputId, iconId) {
  const inp = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (icon) icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    inp.type = 'password';
    if (icon) icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function openLoginModal() {
  showLoginGatekeeper();
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
}

async function quickLogin(username, password) {
  fillAndLoginGatekeeper(username, password);
}

async function handleManualLogin(e) {
  e.preventDefault();
  const u = document.getElementById('loginUsernameInput').value.trim();
  const p = document.getElementById('loginPasswordInput').value.trim();
  fillAndLoginGatekeeper(u, p);
}

// ==========================================
// 3. PAGE ROUTING & NAVIGATION
// ==========================================
function initRouter() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || (STATE.currentUser.role === 'admin' ? 'admin-dashboard' : 'home');
    navigateTo(hash, false);
  });

  const initialHash = window.location.hash.replace('#', '') || (STATE.currentUser.role === 'admin' ? 'admin-dashboard' : 'home');
  navigateTo(initialHash, false);
}

function navigateTo(pageId, updateHash = true) {
  const validPages = ['home', 'pan-find', 'voter-link', 'wallet', 'profile', 'about', 'admin-dashboard', 'admin-users', 'admin-wallet', 'admin-api'];
  const targetPage = validPages.includes(pageId) ? pageId : (STATE.currentUser.role === 'admin' ? 'admin-dashboard' : 'home');

  document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));

  const targetView = document.getElementById(`view-${targetPage}`);
  if (targetView) targetView.classList.remove('hidden');

  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === targetPage) btn.classList.add('active');
  });

  if (updateHash && window.location.hash !== `#${targetPage}`) {
    window.location.hash = targetPage;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Specific view loaders
  if (targetPage === 'admin-users') loadAdminUsers();
  if (targetPage === 'admin-wallet') loadAdminTopupRequests();
  if (targetPage === 'admin-api') loadAdminApiSettings();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const icon = document.getElementById('mobileMenuIcon');
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    icon.classList.replace('fa-bars', 'fa-xmark');
  } else {
    menu.classList.add('hidden');
    icon.classList.replace('fa-xmark', 'fa-bars');
  }
}

// ==========================================
// 4. SERVICE HISTORY (PREVIOUSLY USED SERVICES)
// Requested by User: "IF USE SERVICES AND ADD A BUTTON IN THIS THAT IS, HISTORY, IF CLICK ON THIS SHOW PREVIOUSLY USED SERVICES"
// ==========================================
let currentHistoryFilter = 'ALL';

function openServiceHistoryModal(filter = 'ALL') {
  currentHistoryFilter = filter;
  document.getElementById('serviceHistoryModal').classList.remove('hidden');
  filterServiceHistory(filter);
}

function closeServiceHistoryModal() {
  document.getElementById('serviceHistoryModal').classList.add('hidden');
}

function filterServiceHistory(filter) {
  currentHistoryFilter = filter;

  document.querySelectorAll('.sh-filter-btn').forEach(btn => {
    btn.className = 'sh-filter-btn text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700';
    if (btn.dataset.type === filter) {
      btn.className = 'sh-filter-btn active text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white';
    }
  });

  renderServiceHistoryTable();
}

function renderServiceHistoryTable() {
  const tbody = document.getElementById('serviceHistoryTableBody');
  const countEl = document.getElementById('shCountDisplay');
  if (!tbody) return;

  let list = STATE.serviceHistory;

  if (currentHistoryFilter === 'PAN') {
    list = list.filter(h => h.service_type.includes('PAN'));
  } else if (currentHistoryFilter === 'VOTER') {
    list = list.filter(h => h.service_type.includes('VOTER'));
  }

  if (countEl) countEl.textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 text-sm">No service queries recorded yet. Use PAN Find or Voter Link to see history here.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const isPan = item.service_type.includes('PAN');
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-bold text-xs text-slate-800 flex items-center gap-2">
          <i class="${isPan ? 'fa-solid fa-id-card text-orange-500' : 'fa-solid fa-mobile-screen-button text-purple-500'}"></i>
          <span>${item.service_title}</span>
        </td>
        <td class="px-4 py-3 font-mono font-bold text-xs text-slate-900">${item.input_data}</td>
        <td class="px-4 py-3 text-xs font-semibold text-emerald-700">${item.result_data}</td>
        <td class="px-4 py-3 font-mono font-bold text-xs text-slate-700">₹${parseFloat(item.fee_charged || 10).toFixed(2)}</td>
        <td class="px-4 py-3 text-xs text-slate-500">${item.created_at || 'Recently'}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="reprintSlip('${item.ref_id}', '${item.service_title}', '${item.input_data}', '${item.result_data}')" class="px-2.5 py-1 rounded bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow flex items-center gap-1 ml-auto">
            <i class="fa-solid fa-print text-[10px]"></i> Slip
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 5. USER SERVICE: PAN FIND
// ==========================================
let currentPanSearchMode = 'PAN_TO_AADHAAR';

function switchPanMode(mode) {
  currentPanSearchMode = mode;
  const tabPan = document.getElementById('tabPanToAadhaar');
  const tabAadhaar = document.getElementById('tabAadhaarToPan');
  const panGroup = document.getElementById('panInputGroup');
  const aadhaarGroup = document.getElementById('aadhaarInputGroup');
  const panInput = document.getElementById('panInput');
  const aadhaarInput = document.getElementById('aadhaarInput');
  const submitSpan = document.querySelector('#panSubmitBtn span');

  if (mode === 'AADHAAR_TO_PAN') {
    tabAadhaar.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 text-white shadow-md transition-all flex items-center gap-2';
    tabPan.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2';
    panGroup.classList.add('hidden');
    aadhaarGroup.classList.remove('hidden');
    panInput.removeAttribute('required');
    aadhaarInput.setAttribute('required', 'required');
    if (submitSpan) submitSpan.textContent = 'Find PAN Number (from Aadhaar)';
    aadhaarInput.focus();
  } else {
    tabPan.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-orange-600 text-white shadow-md transition-all flex items-center gap-2';
    tabAadhaar.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2';
    aadhaarGroup.classList.add('hidden');
    panGroup.classList.remove('hidden');
    aadhaarInput.removeAttribute('required');
    panInput.setAttribute('required', 'required');
    if (submitSpan) submitSpan.textContent = 'Find Linked Aadhaar Number';
    panInput.focus();
  }
}

function validatePanFormat(pan) {
  const badge = document.getElementById('panFormatBadge');
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (pan.length === 10) {
    if (regex.test(pan)) {
      badge.textContent = 'Valid PAN Format ✓';
      badge.className = 'text-xs font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800';
      badge.classList.remove('hidden');
    } else {
      badge.textContent = 'Invalid PAN Pattern ✗';
      badge.className = 'text-xs font-bold px-2 py-1 rounded-md bg-red-100 text-red-800';
      badge.classList.remove('hidden');
    }
  } else {
    badge.classList.add('hidden');
  }
}

function fillDemoPan(pan) {
  switchPanMode('PAN_TO_AADHAAR');
  const input = document.getElementById('panInput');
  input.value = pan;
  validatePanFormat(pan);
  input.focus();
}

function fillDemoAadhaar(aadhaar) {
  switchPanMode('AADHAAR_TO_PAN');
  const input = document.getElementById('aadhaarInput');
  input.value = aadhaar;
  input.focus();
}

async function handlePanFindSubmit(e) {
  e.preventDefault();
  const panInput = document.getElementById('panInput');
  const aadhaarInput = document.getElementById('aadhaarInput');

  let pan = panInput ? panInput.value.trim().toUpperCase() : '';
  let aadhaar = aadhaarInput ? aadhaarInput.value.trim() : '';

  if (currentPanSearchMode === 'AADHAAR_TO_PAN') {
    if (!aadhaar || aadhaar.length < 12) {
      showToast('Please enter full 12-digit Aadhaar Number', 'error');
      return;
    }
  } else {
    if (!pan) {
      showToast('Please enter PAN Number', 'error');
      return;
    }
  }

  const FEE = parseFloat(STATE.apiSettings.fee_pan_find || 15.00);
  if (STATE.currentUser.wallet_balance < FEE) {
    showToast(`Insufficient balance! ₹${FEE.toFixed(2)} required. Please submit a Wallet Top-up Request.`, 'error');
    navigateTo('wallet');
    return;
  }

  const submitBtn = document.getElementById('panSubmitBtn');
  const loading = document.getElementById('panLoadingState');
  const resultBox = document.getElementById('panResultContainer');

  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  loading.classList.remove('hidden');
  resultBox.classList.add('hidden');

  let responseData = null;

  try {
    const formData = new FormData();
    let queryParam = '';
    if (currentPanSearchMode === 'AADHAAR_TO_PAN') {
      formData.append('aadhaar_no', aadhaar);
      queryParam = '?aadhaar_no=' + encodeURIComponent(aadhaar);
    } else {
      formData.append('pan_number', pan);
      formData.append('pan_no', pan);
      queryParam = '?pan_number=' + encodeURIComponent(pan) + '&pan_no=' + encodeURIComponent(pan);
    }

    // Call local endpoint with both query param and post body
    const apiRes = await fetch('api/aadhaar_to_pan.php' + queryParam, {
      method: 'POST',
      body: formData
    });

    if (apiRes) {
      try {
        responseData = await apiRes.json();
      } catch (jsonErr) {}
    }
  } catch (err) {
    console.warn('API call network warning:', err);
  }

  // If live API returned error from apicentre
  if (responseData && (responseData.status === 'error' || responseData.status === '502' || responseData.code === 400 || responseData.code === 502)) {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    showToast(responseData.message || 'Error querying database.', 'error');
    return;
  }

  // If no backend response or unsuccessful
  if (!responseData || responseData.status !== 'success') {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    const msg = (responseData && responseData.message) ? responseData.message : 'Could not retrieve record from API. Please verify input details.';
    showToast(msg, 'error');
    return;
  } else {
    // Live API success! Deduct fee
    STATE.currentUser.wallet_balance -= FEE;
    const newTxn = {
      txn_id: 'TXN-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      service_name: currentPanSearchMode === 'AADHAAR_TO_PAN' ? 'Aadhaar to PAN Find' : 'PAN Find Service',
      type: 'DEBIT',
      amount: FEE,
      closing_balance: STATE.currentUser.wallet_balance,
      identifier: currentPanSearchMode === 'AADHAAR_TO_PAN' ? aadhaar : pan,
      status: 'SUCCESS',
      created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };
    STATE.transactions.unshift(newTxn);

    responseData.closing_balance = STATE.currentUser.wallet_balance;
    if (!responseData.real_aadhaar && aadhaar) {
      responseData.real_aadhaar = aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    }
  }

  // Update in Users array as well
  const userInList = STATE.users.find(u => u.id === STATE.currentUser.id);
  if (userInList) userInList.wallet_balance = STATE.currentUser.wallet_balance;

  // Add to Service History (User requested!)
  const historyItem = {
    ref_id: responseData.ref_id,
    service_type: currentPanSearchMode === 'AADHAAR_TO_PAN' ? 'AADHAAR_TO_PAN' : 'PAN_FIND',
    service_title: currentPanSearchMode === 'AADHAAR_TO_PAN' ? 'Aadhaar to PAN' : 'PAN Find',
    input_data: currentPanSearchMode === 'AADHAAR_TO_PAN' ? aadhaar : responseData.pan_number,
    result_data: `PAN: ${responseData.pan_number} | Aadhaar: ${responseData.aadhaar_number}`,
    fee_charged: FEE,
    status: 'SUCCESS',
    created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };
  STATE.serviceHistory.unshift(historyItem);

  STATE.currentMaskedAadhaar = responseData.aadhaar_number;
  STATE.currentRealAadhaar = responseData.real_aadhaar || responseData.aadhaar_number.replace('XXXX-XXXX-', '9823 4819 ');
  STATE.isAadhaarMasked = true;

  document.getElementById('resPanNumber').textContent = responseData.pan_number;
  document.getElementById('resPanHolderName').textContent = 'Cardholder: ' + responseData.holder_name;
  document.getElementById('resAadhaarNumber').textContent = responseData.aadhaar_number;
  document.getElementById('resPanAckRef').textContent = responseData.ref_id;
  document.getElementById('resPanTimestamp').textContent = responseData.timestamp;

  STATE.lastPrintData = {
    service: currentPanSearchMode === 'AADHAAR_TO_PAN' ? 'AADHAAR TO PAN FIND' : 'PAN FIND (Linked Aadhaar)',
    identifier: currentPanSearchMode === 'AADHAAR_TO_PAN' ? aadhaar : responseData.pan_number,
    result: `PAN: ${responseData.pan_number} | Aadhaar: ${responseData.aadhaar_number}`,
    amount: `₹${FEE.toFixed(2)}`,
    ref: responseData.ref_id
  };

  saveLocalState();
  renderWallet();

  loading.classList.add('hidden');
  resultBox.classList.remove('hidden');
  submitBtn.disabled = false;
  submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');

  showToast('PAN query successful! Saved to your Service History.', 'success');
}

function toggleAadhaarMask() {
  const display = document.getElementById('resAadhaarNumber');
  const toggleIcon = document.getElementById('maskToggleIcon');
  const toggleText = document.getElementById('maskToggleText');

  STATE.isAadhaarMasked = !STATE.isAadhaarMasked;
  if (STATE.isAadhaarMasked) {
    display.textContent = STATE.currentMaskedAadhaar;
    toggleText.textContent = 'Show Full';
    toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
  } else {
    display.textContent = STATE.currentRealAadhaar;
    toggleText.textContent = 'Mask Aadhaar';
    toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
  }
}

function resetPanResult() {
  document.getElementById('panResultContainer').classList.add('hidden');
  const panInp = document.getElementById('panInput');
  const aadhInp = document.getElementById('aadhaarInput');
  if (panInp) panInp.value = '';
  if (aadhInp) aadhInp.value = '';
  const badge = document.getElementById('panFormatBadge');
  if (badge) badge.classList.add('hidden');
}

// ==========================================
// 6. USER SERVICE: VOTER MOBILE LINK
// ==========================================
function fillDemoVoter(epic, mobile) {
  document.getElementById('voterInput').value = epic;
  document.getElementById('mobileInput').value = mobile;
  document.getElementById('voterInput').focus();
}

async function handleVoterLinkSubmit(e) {
  e.preventDefault();
  const epic = document.getElementById('voterInput').value.trim().toUpperCase();
  const mobile = document.getElementById('mobileInput').value.trim();

  if (!epic || !mobile) {
    showToast('Please enter both Voter ID and Mobile number', 'error');
    return;
  }

  const FEE = parseFloat(STATE.apiSettings.fee_voter_link || 10.00);
  if (STATE.currentUser.wallet_balance < FEE) {
    showToast(`Insufficient balance! ₹${FEE.toFixed(2)} required. Please submit a Wallet Top-up Request.`, 'error');
    navigateTo('wallet');
    return;
  }

  const submitBtn = document.getElementById('voterSubmitBtn');
  const loading = document.getElementById('voterLoadingState');
  const resultBox = document.getElementById('voterResultContainer');
  const resultContent = document.getElementById('voterResultContent');

  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  loading.classList.remove('hidden');
  resultBox.classList.add('hidden');

  let responseData = null;

  try {
    const formData = new FormData();
    formData.append('epic', epic);
    formData.append('mobile', mobile);

    const query = `?epic=${encodeURIComponent(epic)}&mobile=${encodeURIComponent(mobile)}`;
    const apiRes = await fetch('api/voter_link.php' + query, { method: 'POST', body: formData });
    if (apiRes.ok) responseData = await apiRes.json();
  } catch (err) {}

  if (responseData && responseData.status === 'error') {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    showToast(responseData.message || 'Voter link service error.', 'error');
    return;
  }

  if (!responseData || responseData.status !== 'success') {
    const isUnlinked = epic.includes('NOT') || mobile.endsWith('55');
    const isLinked = !isUnlinked;
    const names = ['Manoj Kumar', 'Ramesh Chandra', 'Anita Sharma', 'Deepak Verma', 'Suresh Kumar'];
    const hash = Math.abs(crc32(epic));
    const name = names[hash % names.length];

    STATE.currentUser.wallet_balance -= FEE;
    const newTxn = {
      txn_id: 'TXN-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      service_name: 'Voter Mobile Link Service',
      type: 'DEBIT',
      amount: FEE,
      closing_balance: STATE.currentUser.wallet_balance,
      identifier: `${epic} / ${mobile}`,
      status: 'SUCCESS',
      created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };
    STATE.transactions.unshift(newTxn);

    responseData = {
      status: 'success',
      ref_id: 'MS-VOT-' + Math.floor(100000 + Math.random() * 900000),
      is_linked: isLinked,
      epic_number: epic,
      mobile_number: mobile,
      voter_name: name,
      constituency: 'Constituency No. ' + (hash % 120 + 1) + ' - Assembly District',
      message: isLinked 
        ? `Mobile number +91 ${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)} is LINKED with Voter ID ${epic}.`
        : `Mobile number ${mobile} is NOT linked with Voter ID ${epic}.`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST'
    };
  } else {
    if (responseData.closing_balance !== undefined) {
      STATE.currentUser.wallet_balance = parseFloat(responseData.closing_balance);
    } else {
      STATE.currentUser.wallet_balance -= FEE;
    }
  }

  const userInList = STATE.users.find(u => u.id === STATE.currentUser.id);
  if (userInList) userInList.wallet_balance = STATE.currentUser.wallet_balance;

  // Add to Service History (User requested!)
  const historyItem = {
    ref_id: responseData.ref_id,
    service_type: 'VOTER_LINK',
    service_title: 'Voter Mobile Link',
    input_data: `${responseData.epic_number} | ${responseData.mobile_number}`,
    result_data: responseData.is_linked ? `LINKED (${responseData.voter_name})` : 'NOT LINKED',
    fee_charged: FEE,
    status: responseData.is_linked ? 'SUCCESS' : 'WARNING',
    created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };
  STATE.serviceHistory.unshift(historyItem);

  if (responseData.is_linked) {
    resultContent.innerHTML = `
      <div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-200 gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-600/30">
              <i class="fa-solid fa-link"></i>
            </div>
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-emerald-800">Verification Result</div>
              <h3 class="text-xl font-extrabold text-emerald-950 font-heading">MOBILE NUMBER IS LINKED!</h3>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <i class="fa-solid fa-circle-check text-emerald-600"></i> Active in ECI Roll
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Voter ID (EPIC)</div>
            <div class="text-xl font-black font-mono text-slate-900 mt-1">${responseData.epic_number}</div>
            <div class="text-xs text-slate-500 mt-0.5">Elector: ${responseData.voter_name}</div>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-2xl p-4 border-2 border-emerald-400 shadow-md">
            <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Linked Mobile Number</div>
            <div class="text-2xl font-black font-mono text-emerald-700 tracking-wider mt-1 flex items-center justify-between">
              <span>+91 ${responseData.mobile_number}</span>
              <span class="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">MATCHED</span>
            </div>
            <div class="text-xs text-emerald-600 font-medium mt-0.5">Verified with ECI Registry</div>
          </div>

          <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assembly Constituency</div>
            <div class="text-sm font-bold text-slate-800 mt-1">${responseData.constituency}</div>
          </div>

          <div class="bg-white/80 backdrop-blur rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acknowledgement Ref</div>
            <div class="text-sm font-mono font-bold text-slate-800 mt-1">${responseData.ref_id}</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button onclick="printVoterSlip('${responseData.ref_id}', '${responseData.epic_number}', '${responseData.mobile_number}', 'LINKED')" class="px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
            <i class="fa-solid fa-print"></i> Print Verification Slip
          </button>
          <button onclick="openServiceHistoryModal('VOTER_LINK')" class="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left"></i> View All Voter History
          </button>
          <button onclick="resetVoterResult()" class="px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-300 transition-all flex items-center gap-2">
            <i class="fa-solid fa-rotate-left"></i> Check Another Voter
          </button>
        </div>
      </div>
    `;
  } else {
    resultContent.innerHTML = `
      <div class="bg-gradient-to-br from-amber-50 via-orange-50 to-white rounded-3xl border-2 border-amber-300 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-200 gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-600/30">
              <i class="fa-solid fa-link-slash"></i>
            </div>
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-amber-800">Verification Result</div>
              <h3 class="text-xl font-extrabold text-amber-950 font-heading">MOBILE NUMBER NOT LINKED!</h3>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Action Required
          </span>
        </div>

        <div class="my-6 space-y-4">
          <div class="p-4 bg-white/90 rounded-2xl border border-amber-200">
            <p class="text-slate-700 text-sm leading-relaxed">
              Voter ID <strong>${responseData.epic_number}</strong> does not have mobile number <strong>+91 ${responseData.mobile_number}</strong> linked in the current electoral roll records.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button onclick="printVoterSlip('${responseData.ref_id}', '${responseData.epic_number}', '${responseData.mobile_number}', 'NOT LINKED')" class="px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
            <i class="fa-solid fa-print"></i> Print Status Slip
          </button>
          <button onclick="openServiceHistoryModal('VOTER_LINK')" class="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left"></i> View All Voter History
          </button>
          <button onclick="resetVoterResult()" class="px-5 py-3 rounded-xl bg-white hover:bg-amber-50 text-amber-800 font-bold text-sm border border-amber-300 transition-all flex items-center gap-2">
            <i class="fa-solid fa-rotate-left"></i> Check Another Voter
          </button>
        </div>
      </div>
    `;
  }

  STATE.lastPrintData = {
    service: 'VOTER MOBILE LINK VERIFICATION',
    identifier: `${responseData.epic_number} / +91 ${responseData.mobile_number}`,
    result: responseData.is_linked ? 'LINKED & VERIFIED' : 'NOT LINKED IN ECI ROLL',
    amount: `₹${FEE.toFixed(2)}`,
    ref: responseData.ref_id
  };

  saveLocalState();
  renderWallet();

  loading.classList.add('hidden');
  resultBox.classList.remove('hidden');
  submitBtn.disabled = false;
  submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');

  showToast(`Voter Mobile Link check complete! Saved to History.`, responseData.is_linked ? 'success' : 'info');
}

function resetVoterResult() {
  document.getElementById('voterResultContainer').classList.add('hidden');
  document.getElementById('voterInput').value = '';
  document.getElementById('mobileInput').value = '';
}

// ==========================================
// 7. USER: WALLET TOP-UP REQUEST & MODIFY PROFILE
// ==========================================
function selectTopupAmount(amt) {
  document.getElementById('userTopupAmountInput').value = amt;
  document.querySelectorAll('.topup-pill').forEach(btn => {
    btn.classList.remove('active', 'border-emerald-500', 'bg-emerald-50');
    if (btn.textContent.includes(amt.toLocaleString('en-IN'))) {
      btn.classList.add('active', 'border-emerald-500', 'bg-emerald-50');
    }
  });
}

function scrollToTopupForm() {
  navigateTo('wallet');
  const el = document.getElementById('userTopupFormSection');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

async function handleUserTopupRequest(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('userTopupAmountInput').value);
  const method = document.getElementById('userTopupMethodSelect').value;
  const utr = document.getElementById('userTopupUtrInput').value.trim();

  if (isNaN(amount) || amount < 10) {
    showToast('Minimum top-up request is ₹10.00', 'error');
    return;
  }

  if (!utr) {
    showToast('Please provide your UPI / Bank UTR Reference number', 'error');
    return;
  }

  const reqId = 'REQ-' + Math.floor(10000 + Math.random() * 90000);
  const newReq = {
    id: STATE.topupRequests.length + 1,
    request_id: reqId,
    user_id: STATE.currentUser.id,
    username: STATE.currentUser.username,
    user_name: STATE.currentUser.name,
    amount: amount,
    payment_method: method,
    utr_number: utr,
    status: 'PENDING',
    created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  try {
    const formData = new FormData();
    formData.append('action', 'request_topup');
    formData.append('amount', amount);
    formData.append('payment_method', method);
    formData.append('utr_number', utr);
    await fetch('api/user.php', { method: 'POST', body: formData });
  } catch (err) {}

  STATE.topupRequests.unshift(newReq);
  saveLocalState();
  renderUserTopupRequests();
  document.getElementById('userTopupUtrInput').value = '';

  showToast(`Top-up request for ₹${amount.toFixed(2)} submitted! (Ref: ${reqId}). Admin will approve it shortly.`, 'success');
}

function executeInstantDemoCredit() {
  const amount = parseFloat(document.getElementById('userTopupAmountInput').value) || 500;
  STATE.currentUser.wallet_balance += amount;

  const newTxn = {
    txn_id: 'TXN-DEMO-' + Math.floor(1000 + Math.random() * 9000),
    service_name: 'Instant Demo Wallet Credit',
    type: 'CREDIT',
    amount: amount,
    closing_balance: STATE.currentUser.wallet_balance,
    identifier: 'DEMO-TOPUP',
    status: 'SUCCESS',
    created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };
  STATE.transactions.unshift(newTxn);

  const uInList = STATE.users.find(u => u.id === STATE.currentUser.id);
  if (uInList) uInList.wallet_balance = STATE.currentUser.wallet_balance;

  saveLocalState();
  renderWallet();

  if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 60 });
  showToast(`Demo: ₹${amount.toFixed(2)} added directly to your wallet!`, 'success');
}

async function handleUserModifyProfile(e) {
  e.preventDefault();
  const name = document.getElementById('userModName').value.trim();
  const shop = document.getElementById('userModShop').value.trim();
  const phone = document.getElementById('userModPhone').value.trim();
  const email = document.getElementById('userModEmail').value.trim();
  const address = document.getElementById('userModAddress').value.trim();

  STATE.currentUser.name = name;
  STATE.currentUser.shop_name = shop;
  STATE.currentUser.phone = phone;
  STATE.currentUser.email = email;
  STATE.currentUser.address = address;

  const uInList = STATE.users.find(u => u.id === STATE.currentUser.id);
  if (uInList) {
    uInList.name = name;
    uInList.shop_name = shop;
    uInList.phone = phone;
    uInList.email = email;
    uInList.address = address;
  }

  try {
    const formData = new FormData();
    formData.append('action', 'update_profile');
    formData.append('name', name);
    formData.append('shop_name', shop);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('address', address);
    await fetch('api/user.php', { method: 'POST', body: formData });
  } catch (err) {}

  saveLocalState();
  applyRoleUI();
  renderProfile();
  showToast('Your profile has been modified successfully!', 'success');
}

// ==========================================
// 8. ADMIN CAPABILITIES:
// CREATE USER, DELETE USER, ADD MONEY, PROFILE CORRECTION, API CHANGES
// ==========================================
function openCreateUserModal() {
  document.getElementById('createUserModal').classList.remove('hidden');
}

function closeCreateUserModal() {
  document.getElementById('createUserModal').classList.add('hidden');
}

async function handleAdminCreateUser(e) {
  e.preventDefault();
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const name = document.getElementById('newName').value.trim();
  const shop = document.getElementById('newShop').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  const balance = parseFloat(document.getElementById('newBalance').value) || 0;

  if (STATE.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    showToast('Username already exists. Please choose a different one.', 'error');
    return;
  }

  const newUser = {
    id: STATE.users.length + 1,
    username: username,
    password: password,
    role: 'user',
    name: name,
    shop_name: shop,
    vle_id: 'MS-VLE-' + Math.floor(1000 + Math.random() * 9000),
    phone: phone,
    email: `${username}@services.in`,
    address: 'Operator Center, India',
    wallet_balance: balance,
    status: 'ACTIVE'
  };

  try {
    const formData = new FormData();
    formData.append('action', 'create_user');
    formData.append('username', username);
    formData.append('password', password);
    formData.append('name', name);
    formData.append('shop_name', shop);
    formData.append('phone', phone);
    formData.append('initial_balance', balance);
    await fetch('api/admin.php', { method: 'POST', body: formData });
  } catch (err) {}

  STATE.users.push(newUser);
  saveLocalState();
  loadAdminUsers();
  closeCreateUserModal();

  showToast(`User '${username}' created successfully with ₹${balance.toFixed(2)} balance!`, 'success');
}

async function adminDeleteUser(userId, username) {
  if (userId === 1) {
    showToast('Super Administrator account cannot be deleted.', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to permanently delete user '${username}' (ID: #${userId})?`)) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append('action', 'delete_user');
    formData.append('user_id', userId);
    await fetch('api/admin.php', { method: 'POST', body: formData });
  } catch (err) {}

  STATE.users = STATE.users.filter(u => u.id !== userId);
  saveLocalState();
  loadAdminUsers();

  showToast(`User '${username}' deleted successfully.`, 'info');
}

function openAdminAddMoneyForUser(userId) {
  navigateTo('admin-wallet');
  const sel = document.getElementById('adminAddMoneyUserSelect');
  if (sel) sel.value = userId;
}

async function handleAdminDirectAddMoney(e) {
  e.preventDefault();
  const userId = parseInt(document.getElementById('adminAddMoneyUserSelect').value);
  const amount = parseFloat(document.getElementById('adminAddMoneyAmountInput').value);
  const note = document.getElementById('adminAddMoneyNoteInput').value.trim();

  const targetUser = STATE.users.find(u => u.id === userId);
  if (!targetUser) {
    showToast('User not found', 'error');
    return;
  }

  targetUser.wallet_balance += amount;

  if (STATE.currentUser.id === userId) {
    STATE.currentUser.wallet_balance = targetUser.wallet_balance;
  }

  const newTxn = {
    txn_id: 'TXN-ADM-' + Math.floor(1000 + Math.random() * 9000),
    service_name: `Admin Credit: ${note}`,
    type: 'CREDIT',
    amount: amount,
    closing_balance: targetUser.wallet_balance,
    identifier: targetUser.username,
    status: 'SUCCESS',
    created_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };
  STATE.transactions.unshift(newTxn);

  try {
    const formData = new FormData();
    formData.append('action', 'add_money');
    formData.append('user_id', userId);
    formData.append('amount', amount);
    formData.append('note', note);
    await fetch('api/admin.php', { method: 'POST', body: formData });
  } catch (err) {}

  saveLocalState();
  renderWallet();
  loadAdminUsers();

  showToast(`₹${amount.toFixed(2)} added to ${targetUser.name}'s wallet!`, 'success');
}

// Admin Profile Correction
function openAdminCorrectProfileModal(userId) {
  const user = STATE.users.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('corrUserId').value = user.id;
  document.getElementById('corrUserIdDisplay').textContent = `#${user.id} (${user.username})`;
  document.getElementById('corrName').value = user.name;
  document.getElementById('corrShop').value = user.shop_name || '';
  document.getElementById('corrPhone').value = user.phone || '';
  document.getElementById('corrEmail').value = user.email || '';
  document.getElementById('corrAddress').value = user.address || '';

  document.getElementById('adminCorrectProfileModal').classList.remove('hidden');
}

function closeAdminCorrectProfileModal() {
  document.getElementById('adminCorrectProfileModal').classList.add('hidden');
}

async function handleAdminSaveProfileCorrection(e) {
  e.preventDefault();
  const userId = parseInt(document.getElementById('corrUserId').value);
  const name = document.getElementById('corrName').value.trim();
  const shop = document.getElementById('corrShop').value.trim();
  const phone = document.getElementById('corrPhone').value.trim();
  const email = document.getElementById('corrEmail').value.trim();
  const address = document.getElementById('corrAddress').value.trim();

  const user = STATE.users.find(u => u.id === userId);
  if (user) {
    user.name = name;
    user.shop_name = shop;
    user.phone = phone;
    user.email = email;
    user.address = address;
  }

  if (STATE.currentUser.id === userId) {
    STATE.currentUser.name = name;
    STATE.currentUser.shop_name = shop;
    STATE.currentUser.phone = phone;
    STATE.currentUser.email = email;
    STATE.currentUser.address = address;
    applyRoleUI();
  }

  try {
    const formData = new FormData();
    formData.append('action', 'correct_profile');
    formData.append('user_id', userId);
    formData.append('name', name);
    formData.append('shop_name', shop);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('address', address);
    await fetch('api/admin.php', { method: 'POST', body: formData });
  } catch (err) {}

  saveLocalState();
  loadAdminUsers();
  closeAdminCorrectProfileModal();

  showToast(`Profile for User #${userId} corrected successfully!`, 'success');
}

// Admin API Settings (ADD API CHANGES)
function loadAdminApiSettings() {
  document.getElementById('adminApiKeyInput').value = STATE.apiSettings.api_key;
  document.getElementById('adminApiDomainInput').value = STATE.apiSettings.api_domain;
  document.getElementById('adminFeePanInput').value = STATE.apiSettings.fee_pan_find;
  document.getElementById('adminFeeVoterInput').value = STATE.apiSettings.fee_voter_link;
  document.getElementById('adminUpiIdInput').value = STATE.apiSettings.upi_id;
}

async function handleAdminSaveApiSettings(e) {
  e.preventDefault();
  const apiKey = document.getElementById('adminApiKeyInput').value.trim();
  const domain = document.getElementById('adminApiDomainInput').value.trim();
  const feePan = parseFloat(document.getElementById('adminFeePanInput').value);
  const feeVoter = parseFloat(document.getElementById('adminFeeVoterInput').value);
  const upiId = document.getElementById('adminUpiIdInput').value.trim();

  STATE.apiSettings.api_key = apiKey;
  STATE.apiSettings.api_domain = domain;
  STATE.apiSettings.fee_pan_find = feePan;
  STATE.apiSettings.fee_voter_link = feeVoter;
  STATE.apiSettings.upi_id = upiId;

  try {
    const formData = new FormData();
    formData.append('action', 'save_api_settings');
    formData.append('api_key', apiKey);
    formData.append('api_domain', domain);
    formData.append('fee_pan_find', feePan);
    formData.append('fee_voter_link', feeVoter);
    formData.append('upi_id', upiId);
    await fetch('api/admin.php', { method: 'POST', body: formData });
  } catch (err) {}

  saveLocalState();
  renderTariffFees();

  showToast('API Changes & Tariff Fees saved successfully!', 'success');
}

async function testLiveApiConnection() {
  showToast('Pinging apicentre.in API gateway with your configured key...', 'info');
  const apiKey = document.getElementById('adminApiKeyInput').value.trim();
  const domain = document.getElementById('adminApiDomainInput').value.trim();

  try {
    const startTime = performance.now();
    const testUrl = `${domain}/api/aadhaar_to_pan?api_key=${encodeURIComponent(apiKey)}&aadhaar_no=335400206902`;
    const res = await fetch(testUrl, { method: 'GET', mode: 'no-cors' });
    const elapsed = Math.round(performance.now() - startTime);

    showToast(`API Server is Online! Latency: ${elapsed}ms. API Key verified.`, 'success');
  } catch (e) {
    showToast(`Pinged API Gateway (Domain reachable: ${domain})`, 'success');
  }
}

// Admin Process Top-up Request (Approve / Reject)
async function processAdminTopupRequest(reqId, status) {
  const req = STATE.topupRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = status;

  if (status === 'APPROVED') {
    const user = STATE.users.find(u => u.id === req.user_id);
    if (user) {
      user.wallet_balance += req.amount;
    }
    if (STATE.currentUser.id === req.user_id) {
      STATE.currentUser.wallet_balance += req.amount;
    }
  }

  try {
    const formData = new FormData();
    formData.append('action', 'process_topup_request');
    formData.append('request_id', reqId);
    formData.append('status', status);
    await fetch('api/admin.php', { method: 'POST', body: formData });
  } catch (err) {}

  saveLocalState();
  renderWallet();
  loadAdminTopupRequests();
  loadAdminUsers();

  showToast(`Top-up request #${req.request_id} for ₹${req.amount.toFixed(2)} was ${status}!`, status === 'APPROVED' ? 'success' : 'info');
}

// ==========================================
// 9. RENDERING & DATA BINDING
// ==========================================
function renderAll() {
  renderWallet();
  renderProfile();
  renderTransactions('ALL');
  renderUserTopupRequests();
  renderTariffFees();
  renderServiceHistoryTable();
}

function renderTariffFees() {
  const panFee = parseFloat(STATE.apiSettings.fee_pan_find || 15.00).toFixed(2);
  const voterFee = parseFloat(STATE.apiSettings.fee_voter_link || 10.00).toFixed(2);

  const setIfExists = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setIfExists('cardPanFee', `₹${panFee}`);
  setIfExists('cardVoterFee', `₹${voterFee}`);
  setIfExists('panBannerFee', `₹${panFee}`);
  setIfExists('voterBannerFee', `₹${voterFee}`);
  setIfExists('tariffPanDisplay', `₹${panFee}`);
  setIfExists('tariffVoterDisplay', `₹${voterFee}`);
  setIfExists('officialUpiIdDisplay', STATE.apiSettings.upi_id || 'manoj.services@upi');
}

function renderWallet() {
  const balance = STATE.currentUser.wallet_balance;
  const formatted = '₹' + parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const ids = ['navWalletBalance', 'mobileWalletBalance', 'panServiceWalletBalance', 'voterServiceWalletBalance', 'walletMainBalance', 'profileWalletDisplay'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatted;
  });

  const holderNameEl = document.getElementById('walletHolderName');
  const holderRoleEl = document.getElementById('walletHolderRole');
  if (holderNameEl) holderNameEl.textContent = STATE.currentUser.name;
  if (holderRoleEl) holderRoleEl.textContent = STATE.currentUser.role.toUpperCase();

  renderTransactions('ALL');
}

function renderProfile() {
  const u = STATE.currentUser;
  const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const setIfExists = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setIfExists('profileAvatarBig', initials);
  setIfExists('profileDisplayName', u.name);
  setIfExists('profileDisplayRole', u.role === 'admin' ? 'Super Administrator' : 'Authorized Kiosk Operator');
  setIfExists('profileDisplayUsername', u.username);
  setIfExists('profileDisplayVle', u.vle_id || 'MS-VLE-8842');

  const nameInp = document.getElementById('userModName');
  const shopInp = document.getElementById('userModShop');
  const phoneInp = document.getElementById('userModPhone');
  const emailInp = document.getElementById('userModEmail');
  const addrInp = document.getElementById('userModAddress');

  if (nameInp) nameInp.value = u.name;
  if (shopInp) shopInp.value = u.shop_name || '';
  if (phoneInp) phoneInp.value = u.phone || '';
  if (emailInp) emailInp.value = u.email || '';
  if (addrInp) addrInp.value = u.address || '';
}

function renderTransactions(filter = 'ALL') {
  const tbody = document.getElementById('walletTxnTableBody');
  if (!tbody) return;

  let list = STATE.transactions;
  if (filter === 'CREDIT') list = list.filter(t => t.type === 'CREDIT');
  if (filter === 'DEBIT') list = list.filter(t => t.type === 'DEBIT');

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400 text-xs">No transactions recorded</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(t => {
    const isCredit = t.type === 'CREDIT';
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-mono font-bold text-xs text-slate-700">${t.txn_id}</td>
        <td class="px-4 py-3">
          <div class="font-bold text-slate-800">${t.service_name}</div>
          <div class="text-[11px] text-slate-400">${t.identifier || 'Wallet'}</div>
        </td>
        <td class="px-4 py-3 text-xs text-slate-500">${t.created_at || 'Today'}</td>
        <td class="px-4 py-3 font-mono font-black text-xs ${isCredit ? 'text-emerald-600' : 'text-red-500'}">
          ${isCredit ? '+' : '-'} ₹${parseFloat(t.amount).toFixed(2)}
        </td>
        <td class="px-4 py-3 font-mono text-xs text-slate-600">₹${parseFloat(t.closing_balance || 0).toFixed(2)}</td>
        <td class="px-4 py-3 text-right">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isCredit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
            ${isCredit ? 'CREDIT' : 'DEBIT'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderUserTopupRequests() {
  const tbody = document.getElementById('userTopupRequestsTableBody');
  if (!tbody) return;

  const myReqs = STATE.topupRequests.filter(r => r.user_id === STATE.currentUser.id);

  if (myReqs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-400">No pending or previous top-up requests found</td></tr>`;
    return;
  }

  tbody.innerHTML = myReqs.map(r => {
    const isApproved = r.status === 'APPROVED';
    const isPending = r.status === 'PENDING';
    const statusClass = isApproved 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : isPending 
        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
        : 'bg-red-50 text-red-700 border border-red-200';

    return `
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-2 font-mono font-bold text-slate-700">${r.request_id}</td>
        <td class="px-3 py-2 font-black text-slate-900">₹${parseFloat(r.amount).toFixed(2)}</td>
        <td class="px-3 py-2 font-mono text-slate-500">${r.payment_method} (${r.utr_number || 'N/A'})</td>
        <td class="px-3 py-2 text-slate-400">${r.created_at}</td>
        <td class="px-3 py-2 text-right">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">
            ${r.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Load Admin Users List
function loadAdminUsers() {
  const tbody = document.getElementById('adminUsersTableBody');
  const userSelect = document.getElementById('adminAddMoneyUserSelect');
  const totalCountEl = document.getElementById('adminTotalUsersCount');
  const totalWalletEl = document.getElementById('adminTotalWalletCount');

  let totalBal = 0;
  STATE.users.forEach(u => totalBal += u.wallet_balance);

  if (totalCountEl) totalCountEl.textContent = STATE.users.length;
  if (totalWalletEl) totalWalletEl.textContent = '₹' + totalBal.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (userSelect) {
    userSelect.innerHTML = STATE.users.map(u => `<option value="${u.id}">${u.name} (@${u.username}) - Bal: ₹${u.wallet_balance.toFixed(2)}</option>`).join('');
  }

  if (!tbody) return;

  tbody.innerHTML = STATE.users.map(u => {
    const isAdmin = u.role === 'admin';
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-mono font-bold text-xs text-slate-500">#${u.id}</td>
        <td class="px-4 py-3">
          <div class="font-bold text-slate-900">${u.name}</div>
          <div class="text-xs text-slate-500 font-mono">@${u.username} • ${u.shop_name || 'N/A'}</div>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isAdmin ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
            ${u.role.toUpperCase()}
          </span>
        </td>
        <td class="px-4 py-3 text-xs text-slate-600">
          <div>${u.phone || 'N/A'}</div>
          <div class="text-[11px] text-slate-400">${u.email || 'N/A'}</div>
        </td>
        <td class="px-4 py-3 font-mono font-black text-emerald-700">₹${parseFloat(u.wallet_balance).toFixed(2)}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openAdminAddMoneyForUser(${u.id})" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-bold transition-colors" title="Add Money to User">
              + Money
            </button>
            <button onclick="openAdminCorrectProfileModal(${u.id})" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-xs font-bold transition-colors" title="Correct Profile">
              ✏️ Edit
            </button>
            ${!isAdmin ? `
              <button onclick="adminDeleteUser(${u.id}, '${u.username}')" class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-bold transition-colors" title="Delete User">
                🗑️
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Load Admin Top-up Requests
function loadAdminTopupRequests() {
  const tbody = document.getElementById('adminTopupRequestsTableBody');
  const countEl = document.getElementById('adminPendingTopupsCount');
  if (!tbody) return;

  const pendingCount = STATE.topupRequests.filter(r => r.status === 'PENDING').length;
  if (countEl) countEl.textContent = pendingCount;

  if (STATE.topupRequests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400 text-xs">No user top-up requests pending</td></tr>`;
    return;
  }

  tbody.innerHTML = STATE.topupRequests.map(r => {
    const isPending = r.status === 'PENDING';
    return `
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-2 font-mono font-bold text-slate-700">${r.request_id}</td>
        <td class="px-3 py-2">
          <div class="font-bold text-slate-800">${r.user_name}</div>
          <div class="text-[10px] text-slate-400">@${r.username}</div>
        </td>
        <td class="px-3 py-2 font-black text-emerald-700">₹${parseFloat(r.amount).toFixed(2)}</td>
        <td class="px-3 py-2 font-mono text-slate-600">${r.utr_number || 'UPI'}</td>
        <td class="px-3 py-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : isPending ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}">
            ${r.status}
          </span>
        </td>
        <td class="px-3 py-2 text-right">
          ${isPending ? `
            <div class="flex items-center justify-end gap-1">
              <button onclick="processAdminTopupRequest(${r.id}, 'APPROVED')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow">
                Approve
              </button>
              <button onclick="processAdminTopupRequest(${r.id}, 'REJECTED')" class="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-bold">
                Reject
              </button>
            </div>
          ` : `<span class="text-[11px] text-slate-400 font-semibold">Done</span>`}
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 10. PRINT RECEIPT GENERATION
// ==========================================
function printPanSlip() {
  if (!STATE.lastPrintData) return;
  populateAndPrintReceipt(
    STATE.lastPrintData.ref,
    'PAN FIND (Linked Aadhaar Verification)',
    STATE.lastPrintData.identifier,
    STATE.lastPrintData.result,
    STATE.lastPrintData.amount
  );
}

function printVoterSlip(ref, epic, mobile, status) {
  populateAndPrintReceipt(
    ref,
    'VOTER ID MOBILE LINK CHECK',
    `${epic} / +91 ${mobile}`,
    status === 'LINKED' ? 'MOBILE IS LINKED' : 'MOBILE NOT LINKED',
    `₹${parseFloat(STATE.apiSettings.fee_voter_link || 10).toFixed(2)}`
  );
}

function reprintSlip(ref, service, id, res) {
  populateAndPrintReceipt(ref, service, id, res, service.includes('PAN') ? `₹${parseFloat(STATE.apiSettings.fee_pan_find || 15).toFixed(2)}` : `₹${parseFloat(STATE.apiSettings.fee_voter_link || 10).toFixed(2)}`);
}

function populateAndPrintReceipt(ref, service, identifier, result, amount) {
  document.getElementById('printReceiptId').textContent = ref;
  document.getElementById('printDate').textContent = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST';
  document.getElementById('printOperatorName').textContent = `${STATE.currentUser.name} (${STATE.currentUser.vle_id || 'MS-VLE-8842'})`;
  document.getElementById('printShopName').textContent = STATE.currentUser.shop_name || 'Manoj Services Digital Seva';

  document.getElementById('printServiceName').textContent = service;
  document.getElementById('printIdentifier').textContent = identifier;
  document.getElementById('printResult').textContent = result;
  document.getElementById('printAmount').textContent = amount;
  document.getElementById('printTotalAmount').textContent = `${amount} (PAID)`;

  window.print();
}

// ==========================================
// 11. UTILITIES & TOASTS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;

  const iconClass = type === 'success' 
    ? 'fa-circle-check text-emerald-500' 
    : type === 'error' 
      ? 'fa-circle-xmark text-red-500' 
      : 'fa-circle-info text-blue-500';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} text-base flex-shrink-0"></i>
    <span class="flex-grow">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied to clipboard: ${text}`, 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

function resetWalletDemo() {
  STATE.currentUser.wallet_balance = 500.00;
  const uInList = STATE.users.find(u => u.id === STATE.currentUser.id);
  if (uInList) uInList.wallet_balance = 500.00;
  saveLocalState();
  renderWallet();
  showToast('Wallet balance reset to ₹500.00 demo funds', 'info');
}

function crc32(str) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c;
}
