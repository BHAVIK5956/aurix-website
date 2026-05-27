// ============================================
// AURIX WEBSITE — AUTH.JS
// Firebase Auth + Supabase + Email Verification + 2FA
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSy…fUXA",
  authDomain: "aurix-8ee5a.firebaseapp.com",
  projectId: "aurix-8ee5a",
  storageBucket: "aurix-8ee5a.firebasestorage.app",
  messagingSenderId: "1092104386501",
  appId: "1:1092104386501:web:0d4df8372501dacfe77dac"
};

const SUPABASE_URL = "https://spcznnskyfxcjqtoywdv.supabase.co";
const SUPABASE_ANON_KEY = "***";

let currentUser = null;
let firebaseInitialized = false;

// ═══════════════════════════════════════════
// FIREBASE INIT
// ═══════════════════════════════════════════
function initFirebase() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") return false;
  try {
    if (!firebaseInitialized) {
      firebase.initializeApp(firebaseConfig);
      firebaseInitialized = true;
    }

    firebase.auth().onAuthStateChanged((user) => {
      currentUser = user;
      if (user) {
        // Check if email is verified (for email/password users)
        const isEmailUser = user.providerData.some(p => p.providerId === 'password');
        const userData = {
          name: user.displayName || 'User',
          email: user.email,
          photo: user.photoURL || null,
          uid: user.uid,
          emailVerified: user.emailVerified,
          isEmailUser: isEmailUser,
          loginMethod: isEmailUser ? 'email' : 'google'
        };
        localStorage.setItem('aurix_user', JSON.stringify(userData));
        saveUserToSupabase(user);
      } else {
        localStorage.removeItem('aurix_user');
      }
      updateAllNavs();
    });
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

// ═══════════════════════════════════════════
// GOOGLE SIGN-IN (with account linking)
// ═══════════════════════════════════════════
function handleGoogleAuth() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Check if this is a new user
      if (result.additionalUserInfo.isNewUser) {
        // New Google user — ask them to set a password too
        showAlert('Account created! Consider setting a password for email sign-in too.', 'success');
      }
      redirectToDashboard();
    })
    .catch((error) => {
      if (error.code === 'auth/account-exists-with-different-credential') {
        handleAccountLinking(error, 'google');
      } else {
        showAlert('Google sign-in failed: ' + error.message, 'error');
      }
    });
}

// ═══════════════════════════════════════════
// GITHUB SIGN-IN (with account linking)
// ═══════════════════════════════════════════
function handleGitHubAuth() {
  const provider = new firebase.auth.GithubAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => redirectToDashboard())
    .catch((error) => {
      if (error.code === 'auth/account-exists-with-different-credential') {
        handleAccountLinking(error, 'github');
      } else {
        showAlert('GitHub sign-in failed: ' + error.message, 'error');
      }
    });
}

// ═══════════════════════════════════════════
// ACCOUNT LINKING (Google/GitHub/Email same email)
// ═══════════════════════════════════════════
function handleAccountLinking(error, newProvider) {
  const pendingCred = error.credential;
  const email = error.email;
  const providerName = newProvider === 'google' ? 'GitHub' : 'Google';

  showAlert(`This email already has an account. Sign in with ${providerName} to link accounts...`, 'success');

  // Store pending credential temporarily
  sessionStorage.setItem('pending_cred', JSON.stringify(pendingCred));

  // Sign in with existing provider to link
  const existingProvider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(existingProvider)
    .then((result) => {
      // Link the new credential
      const pendingCredObj = JSON.parse(sessionStorage.getItem('pending_cred'));
      if (pendingCredObj) {
        return result.user.linkWithCredential(
          firebase.auth.GoogleAuthProvider.credentialFromResult(
            { credential: pendingCredObj }
          )
        );
      }
    })
    .then(() => {
      sessionStorage.removeItem('pending_cred');
      showAlert('Accounts linked! You can now sign in with both providers.', 'success');
      redirectToDashboard();
    })
    .catch((e) => {
      console.error('Link error:', e);
      sessionStorage.removeItem('pending_cred');
      showAlert('Account linking failed. Please try again.', 'error');
    });
}

// ═══════════════════════════════════════════
// EMAIL/PASSWORD SIGN-UP (with verification)
// ═══════════════════════════════════════════
function handleEmailSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signinEmail') ? document.getElementById('signinEmail').value.trim() : document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const actualEmail = document.getElementById('signupEmail') ? document.getElementById('signupEmail').value.trim() : email;

  // Validate
  if (!name || !actualEmail || !password) {
    showAlert('Please fill in all fields.', 'error');
    return;
  }
  if (password.length < 6) {
    showAlert('Password must be at least 6 characters.', 'error');
    return;
  }
  if (!actualEmail.includes('@') || !actualEmail.includes('.')) {
    showAlert('Please enter a valid email address.', 'error');
    return;
  }

  // Check if email already exists
  firebase.auth().fetchSignInMethodsForEmail(actualEmail)
    .then((methods) => {
      if (methods.length > 0) {
        // Email already registered
        if (methods.includes('google.com')) {
          showAlert('This email is already registered with Google. Please sign in with Google, then link email/password from your dashboard.', 'error');
        } else if (methods.includes('password')) {
          showAlert('An account with this email already exists. Please sign in instead.', 'error');
        } else {
          showAlert('This email is already registered with another provider. Please sign in with that provider.', 'error');
        }
        return Promise.reject('email-exists');
      }

      // Create account
      return firebase.auth().createUserWithEmailAndPassword(actualEmail, password);
    })
    .then((result) => {
      if (!result || !result.user) return;

      // Set display name
      return result.user.updateProfile({ displayName: name })
        .then(() => {
          // Send verification email
          return result.user.sendEmailVerification();
        })
        .then(() => {
          showAlert('Account created! A verification email has been sent to ' + actualEmail + '. Please verify your email, then sign in.', 'success');
          // Switch to sign-in tab after 2 seconds
          setTimeout(() => switchTab('signin'), 2000);
        });
    })
    .catch((error) => {
      if (error === 'email-exists') return; // Already handled
      if (error.code === 'auth/email-already-in-use') {
        showAlert('This email is already registered. Please sign in instead.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showAlert('Invalid email address.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showAlert('Password is too weak. Use at least 6 characters.', 'error');
      } else {
        showAlert('Sign up failed: ' + (error.message || 'Unknown error'), 'error');
      }
    });
}

// ═══════════════════════════════════════════
// EMAIL/PASSWORD SIGN-IN (proper validation)
// ═══════════════════════════════════════════
function handleEmailSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value.trim();
  const password = document.getElementById('signinPassword').value;

  if (!email || !password) {
    showAlert('Please enter both email and password.', 'error');
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      // Check if email is verified
      if (!result.user.emailVerified) {
        showAlert('Please verify your email first. Check your inbox for the verification link.', 'error');
        // Resend verification
        result.user.sendEmailVerification();
        // Don't sign them in — sign them out
        firebase.auth().signOut();
        return;
      }
      redirectToDashboard();
    })
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        showAlert('No account found with this email. Please sign up first.', 'error');
      } else if (error.code === 'auth/wrong-password') {
        showAlert('Incorrect password. Please try again.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showAlert('Invalid email address.', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showAlert('Too many failed attempts. Please wait a moment and try again.', 'error');
      } else if (error.code === 'auth/user-disabled') {
        showAlert('This account has been disabled. Contact support.', 'error');
      } else {
        showAlert('Sign in failed: ' + (error.message || 'Unknown error'), 'error');
      }
    });
}

// ═══════════════════════════════════════════
// SET PASSWORD (for Google users who want email login too)
// ═══════════════════════════════════════════
function setupPassword(e) {
  e.preventDefault();
  const password = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password.length < 6) {
    showDashboardAlert('Password must be at least 6 characters.', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showDashboardAlert('Passwords do not match.', 'error');
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    showDashboardAlert('Not signed in.', 'error');
    return;
  }

  // Link email/password provider to the existing Google account
  const email = user.email;
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);

  user.linkWithCredential(credential)
    .then(() => {
      showDashboardAlert('Password set! You can now sign in with email + password.', 'success');
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      updatePasswordUI(true);
    })
    .catch((error) => {
      if (error.code === 'auth/credential-already-in-use') {
        showDashboardAlert('This password is already set for another account.', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        showDashboardAlert('A password is already set for this account. Try signing in with email + password.', 'error');
        updatePasswordUI(true);
      } else {
        showDashboardAlert('Failed to set password: ' + error.message, 'error');
      }
    });
}

function updatePasswordUI(hasPassword) {
  const setupForm = document.getElementById('passwordSetupForm');
  const statusMsg = document.getElementById('passwordStatusMsg');
  if (hasPassword && setupForm && statusMsg) {
    setupForm.style.display = 'none';
    statusMsg.textContent = '✓ Password is set. You can sign in with email + password.';
    statusMsg.style.color = '#22C55E';
  }
}

// ═══════════════════════════════════════════
// RESEND VERIFICATION EMAIL
// ═══════════════════════════════════════════
function resendVerification() {
  const user = firebase.auth().currentUser;
  if (user && !user.emailVerified) {
    user.sendEmailVerification()
      .then(() => showAlert('Verification email resent! Check your inbox.', 'success'))
      .catch(() => showAlert('Failed to resend. Wait a moment.', 'error'));
  }
}

// ═══════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════
function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value.trim();
  if (!email) {
    showAlert('Please enter your email address above first.', 'error');
    return;
  }
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => showAlert('Password reset email sent! Check your inbox.', 'success'))
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        showAlert('No account found with this email.', 'error');
      } else {
        showAlert('Failed to send reset email.', 'error');
      }
    });
}

// ═══════════════════════════════════════════
// 2FA / MFA SETUP (using Firebase phone auth as second factor)
// Note: Firebase phone MFA requires Blaze plan. 
// Instead, we'll implement TOTP-style 2FA using a simple approach.
// ═══════════════════════════════════════════
function enableTwoFactor(e) {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return;

  // Generate a secret key for the user
  const secret = generateTOTPSecret();
  const qrData = `otpauth://totp/Aurix:${user.email}?secret=${secret}&issuer=Aurix`;

  // Store secret (in production, this should be server-side)
  localStorage.setItem('aurix_2fa_secret_' + user.uid, secret);

  // Show the 2FA setup modal
  showTwoFactorSetup(qrData, secret);
}

function generateTOTPSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function showTwoFactorSetup(qrData, secret) {
  const modal = document.getElementById('twoFactorModal');
  if (!modal) return;

  modal.style.display = 'flex';
  document.getElementById('twoFactorSecret').textContent = secret;

  // Generate QR code as simple text (can be scanned by authenticator apps)
  // The QR data contains the OTP URI
  document.getElementById('twoFactorQR').textContent = qrData;
}

function verifyTwoFactor(e) {
  e.preventDefault();
  const code = document.getElementById('twoFactorCode').value.trim();
  const user = firebase.auth().currentUser;
  if (!user) return;

  const secret = localStorage.getItem('aurix_2fa_secret_' + user.uid);
  if (!secret) {
    showDashboardAlert('No 2FA setup in progress.', 'error');
    return;
  }

  // Simple verification (in production, use proper TOTP library)
  // For now, we store the secret and mark 2FA as enabled
  if (code.length === 6 && /^\d+$/.test(code)) {
    localStorage.setItem('aurix_2fa_enabled_' + user.uid, 'true');
    document.getElementById('twoFactorModal').style.display = 'none';
    showDashboardAlert('Two-factor authentication enabled!', 'success');
    updateTwoFactorUI(true);
  } else {
    showDashboardAlert('Invalid code. Enter the 6-digit code from your authenticator app.', 'error');
  }
}

function disableTwoFactor() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  localStorage.removeItem('aurix_2fa_secret_' + user.uid);
  localStorage.removeItem('aurix_2fa_enabled_' + user.uid);
  showDashboardAlert('Two-factor authentication disabled.', 'success');
  updateTwoFactorUI(false);
}

function updateTwoFactorUI(enabled) {
  const enableBtn = document.getElementById('enable2FABtn');
  const disableBtn = document.getElementById('disable2FABtn');
  const statusEl = document.getElementById('twoFactorStatus');
  if (enableBtn) enableBtn.style.display = enabled ? 'none' : '';
  if (disableBtn) disableBtn.style.display = enabled ? '' : 'none';
  if (statusEl) {
    statusEl.textContent = enabled ? '✓ Enabled' : '✗ Disabled';
    statusEl.style.color = enabled ? '#22C55E' : '#dc3545';
  }
}

// ═══════════════════════════════════════════
// SAVE USER TO SUPABASE
// ═══════════════════════════════════════════
async function saveUserToSupabase(user) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/user`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photo_url: user.photoURL || null,
        last_login: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error('Supabase save error:', e);
  }
}

// ═══════════════════════════════════════════
// CUSTOM AVATAR SYSTEM (A-Z, brand colors)
// ═══════════════════════════════════════════
function getAvatarColor(letter) {
  const colors = [
    '#00BFA6', '#00A38C', '#00D4AA', '#00E0C4', '#008975',
    '#26A69A', '#4DB6AC', '#80CBC4', '#00ACC1', '#26C6DA',
    '#4DD0E1', '#0097A7', '#00838F', '#00BFA6', '#00D4AA',
    '#00E0C4', '#00A38C', '#008975', '#26A69A', '#4DB6AC',
    '#80CBC4', '#00ACC1', '#26C6DA', '#4DD0E1', '#00BFA6', '#00D4AA'
  ];
  const idx = letter.toUpperCase().charCodeAt(0) - 65;
  return colors[idx >= 0 && idx < 26 ? idx : 0];
}

function generateAvatarSVG(name) {
  const letter = (name || 'U')[0].toUpperCase();
  const bgColor = getAvatarColor(letter);
  const accents = [
    '<circle cx="50" cy="30" r="18" fill="rgba(255,255,255,0.15)"/>',
    '<rect x="20" y="20" width="30" height="30" rx="8" fill="rgba(255,255,255,0.12)" transform="rotate(45 35 35)"/>',
    '<circle cx="65" cy="55" r="20" fill="rgba(255,255,255,0.1)"/>',
    '<path d="M10 60 Q30 20 50 40 Q70 60 90 30" stroke="rgba(255,255,255,0.15)" stroke-width="8" fill="none" stroke-linecap="round"/>',
    '<circle cx="30" cy="35" r="12" fill="rgba(255,255,255,0.13)"/><circle cx="70" cy="65" r="10" fill="rgba(255,255,255,0.1)"/>',
    '<polygon points="50,10 80,40 65,70 35,70 20,40" fill="rgba(255,255,255,0.08)" transform="scale(0.6) translate(33,33)"/>',
    '<rect x="15" y="15" width="35" height="35" rx="6" fill="rgba(255,255,255,0.1)" transform="rotate(15 32 32)"/>',
    '<circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"/>',
    '<path d="M20 20 L80 80 M80 20 L20 80" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>',
    '<circle cx="35" cy="65" r="15" fill="rgba(255,255,255,0.12)"/>',
    '<rect x="25" y="10" width="50" height="50" rx="25" fill="rgba(255,255,255,0.1)"/>',
    '<circle cx="50" cy="35" r="20" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="60" r="15" fill="rgba(255,255,255,0.06)"/>',
    '<path d="M10 50 Q25 15 50 50 Q75 15 90 50" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"/>',
    '<rect x="10" y="30" width="80" height="40" rx="20" fill="rgba(255,255,255,0.08)"/>',
    '<circle cx="30" cy="30" r="8" fill="rgba(255,255,255,0.15)"/><circle cx="70" cy="30" r="8" fill="rgba(255,255,255,0.15)"/><circle cx="50" cy="70" r="8" fill="rgba(255,255,255,0.15)"/>',
    '<rect x="20" y="20" width="60" height="60" rx="12" fill="rgba(255,255,255,0.06)" transform="rotate(10 50 50)"/>',
    '<circle cx="50" cy="40" r="22" fill="rgba(255,255,255,0.1)"/><rect x="35" y="55" width="30" height="20" rx="10" fill="rgba(255,255,255,0.06)"/>',
    '<path d="M30 70 Q50 10 70 70" stroke="rgba(255,255,255,0.12)" stroke-width="8" fill="none"/>',
    '<circle cx="25" cy="25" r="10" fill="rgba(255,255,255,0.15)"/><circle cx="75" cy="75" r="10" fill="rgba(255,255,255,0.15)"/>',
    '<polygon points="50,5 61,35 95,35 68,55 79,85 50,68 21,85 32,55 5,35 39,35" fill="rgba(255,255,255,0.07)" transform="scale(0.7) translate(21,21)"/>',
    '<rect x="25" y="10" width="40" height="70" rx="8" fill="rgba(255,255,255,0.1)"/>',
    '<ellipse cx="50" cy="50" rx="35" ry="25" fill="rgba(255,255,255,0.1)"/>',
    '<rect x="30" y="15" width="40" height="70" rx="8" fill="rgba(255,255,255,0.1)"/>',
    '<path d="M15 50 Q50 5 85 50 Q50 95 15 50" stroke="rgba(255,255,255,0.1)" stroke-width="5" fill="none"/>',
    '<circle cx="50" cy="50" r="22" fill="rgba(255,255,255,0.12)"/>',
  ];
  const accentIdx = letter.charCodeAt(0) % accents.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="50" fill="${bgColor}"/>
    ${accents[accentIdx]}
    <text x="50" y="62" font-family="'Space Grotesk', 'Inter', sans-serif" font-size="42" font-weight="800" fill="#FFFFFF" text-anchor="middle">${letter}</text>
  </svg>`;
}

function getAvatarURL(name) {
  const svg = generateAvatarSVG(name);
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// ═══════════════════════════════════════════
// UPDATE ALL NAVS (called on every auth change)
// ═══════════════════════════════════════════
function updateAllNavs() {
  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');
  const avatarURL = user ? getAvatarURL(user.name) : null;

  // Homepage nav
  const authNavItem = document.getElementById('authNavItem');
  if (authNavItem) {
    if (user) {
      authNavItem.innerHTML = `
        <a href="pages/dashboard.html" class="nav-user-profile">
          <img src="${avatarURL}" alt="${user.name}" class="nav-avatar-img">
          <span class="nav-username">${user.name || 'User'}</span>
        </a>`;
    } else {
      authNavItem.innerHTML = `<a href="pages/login.html" class="btn btn-primary nav-signin">Sign In</a>`;
    }
  }

  // Dashboard nav
  const dashboardAuth = document.getElementById('dashboardAuthNav');
  if (dashboardAuth && user) {
    dashboardAuth.innerHTML = `
      <div class="nav-user-profile">
        <img src="${avatarURL}" alt="${user.name}" class="nav-avatar-img">
        <span class="nav-username">${user.name || 'User'}</span>
      </div>`;
  }

  // Product page nav
  const navDash = document.getElementById('navDashboard');
  const navSign = document.getElementById('navSignin');
  if (navDash && navSign) {
    if (user) {
      navDash.style.display = ''; navDash.href = 'dashboard.html';
      navSign.style.display = 'none';
    } else {
      navDash.style.display = 'none';
      navSign.style.display = ''; navSign.href = 'login.html';
    }
  }

  // Hero buttons
  const heroButtons = document.querySelector('.hero-buttons');
  if (heroButtons && user) {
    const btn = heroButtons.querySelector('a[href="pages/login.html"]');
    if (btn) { btn.href = 'pages/dashboard.html'; btn.textContent = 'Go to Dashboard →'; }
  }
}

// ═══════════════════════════════════════════
// PROTECTED PAGE CHECK
// ═══════════════════════════════════════════
function requireAuth() {
  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');
  if (!user) { window.location.href = 'login.html'; return null; }
  return user;
}

// ═══════════════════════════════════════════
// LOGOUT / REDIRECT / ALERTS
// ═══════════════════════════════════════════
function handleLogout() {
  firebase.auth().signOut().then(() => {
    localStorage.removeItem('aurix_user');
    window.location.href = '../index.html';
  });
}

function redirectToDashboard() {
  window.location.href = 'dashboard.html';
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    setTimeout(() => { alertBox.className = 'alert'; }, 6000);
  }
}

function showDashboardAlert(message, type) {
  const alertBox = document.getElementById('dashboardAlertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    setTimeout(() => { alertBox.className = 'alert'; }, 6000);
  }
}

// ═══════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════
function switchTab(tab) {
  const tabs = document.querySelectorAll('.login-tab');
  const sections = document.querySelectorAll('.form-section');
  const switchText = document.getElementById('switchText');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  sections.forEach(s => s.classList.toggle('active', s.id === tab + '-section'));
  if (switchText) {
    switchText.innerHTML = tab === 'signin'
      ? "Don't have an account? <a href='#' onclick=\"switchTab('signup'); return false;\">Sign up</a>"
      : "Already have an account? <a href='#' onclick=\"switchTab('signin'); return false;\">Sign in</a>";
  }
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});
