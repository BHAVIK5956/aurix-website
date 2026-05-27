// ============================================
// AURIX WEBSITE — AUTH.JS
// Firebase Authentication + Supabase Database
// Account linking: Google + GitHub same email
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
const SUPABASE_ANON_KEY = "eyJhbG…Qhb0";

let currentUser = null;
let firebaseInitialized = false;

// ── Initialize Firebase ──
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
        const userData = {
          name: user.displayName || 'User',
          email: user.email,
          photo: user.photoURL || null,
          uid: user.uid
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

// ── Account Error Handler (GitHub/Google same email) ──
function handleAuthError(error) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    // Get pending credentials
    const pendingCred = error.credential;
    const email = error.email;

    showAlert(`An account with ${email} already exists via Google. Linking accounts...`, 'success');

    // First, ask user to sign in with their existing provider (Google)
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().currentUser.linkWithPopup(provider)
      .then((result) => {
        // Now link the GitHub credential too
        return result.user.linkWithCredential(pendingCred);
      })
      .then(() => {
        showAlert('Accounts linked! You can now sign in with both Google and GitHub.', 'success');
        redirectToDashboard();
      })
      .catch((linkError) => {
        console.error('Link error:', linkError);
        // Fallback: just sign in with the new provider directly
        firebase.auth().signInWithCredential(pendingCred)
          .then(() => redirectToDashboard())
          .catch((e) => showAlert('Sign in failed: ' + e.message, 'error'));
      });
  } else {
    showAlert('Sign in failed: ' + error.message, 'error');
  }
}

// ── Google Auth ──
function handleGoogleAuth() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => redirectToDashboard())
    .catch(handleAuthError);
}

// ── GitHub Auth ──
function handleGitHubAuth() {
  const provider = new firebase.auth.GithubAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => redirectToDashboard())
    .catch(handleAuthError);
}

// ── Email/Password Sign Up ──
function handleEmailSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      return result.user.updateProfile({ displayName: name });
    })
    .then(() => {
      showAlert('Account created! Redirecting...', 'success');
      setTimeout(redirectToDashboard, 1000);
    })
    .catch((error) => {
      showAlert('Sign up failed: ' + error.message, 'error');
    });
}

// ── Email/Password Sign In ──
function handleEmailSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => redirectToDashboard())
    .catch((error) => {
      showAlert('Sign in failed: ' + error.message, 'error');
    });
}

// ── Save User to Supabase ──
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

// ── Generate Custom Avatar (A-Z, brand colors) ──
function getAvatarColor(letter) {
  // 26 distinct brand-adjacent colors for A-Z
  const colors = [
    '#00BFA6', '#00A38C', '#00D4AA', '#00E0C4', '#008975',
    '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB', '#00BFA6',
    '#00ACC1', '#26C6DA', '#4DD0E1', '#80DEEA', '#0097A7',
    '#00838F', '#006064', '#00BFA6', '#00D4AA', '#00E0C4',
    '#00A38C', '#008975', '#26A69A', '#4DB6AC', '#80CBC4', '#00ACC1'
  ];
  const idx = letter.toUpperCase().charCodeAt(0) - 65;
  return colors[idx >= 0 && idx < 26 ? idx : 0];
}

function generateAvatarSVG(name) {
  const letter = (name || 'U')[0].toUpperCase();
  const bgColor = getAvatarColor(letter);
  // Generate a unique pattern based on letter
  const patternSeed = letter.charCodeAt(0);

  // Different accent shapes for variety
  const accents = [
    `<circle cx="50" cy="30" r="18" fill="rgba(255,255,255,0.15)"/>`,
    `<rect x="20" y="20" width="30" height="30" rx="8" fill="rgba(255,255,255,0.12)" transform="rotate(45 35 35)"/>`,
    `<circle cx="65" cy="55" r="20" fill="rgba(255,255,255,0.1)"/>`,
    `<path d="M10 60 Q30 20 50 40 Q70 60 90 30" stroke="rgba(255,255,255,0.15)" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    `<circle cx="30" cy="35" r="12" fill="rgba(255,255,255,0.13)"/><circle cx="70" cy="65" r="10" fill="rgba(255,255,255,0.1)"/>`,
    `<polygon points="50,10 80,40 65,70 35,70 20,40" fill="rgba(255,255,255,0.08)" transform="scale(0.6) translate(33,33)"/>`,
    `<rect x="15" y="15" width="35" height="35" rx="6" fill="rgba(255,255,255,0.1)" transform="rotate(15 32 32)"/>`,
    `<circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"/>`,
    `<path d="M20 20 L80 80 M80 20 L20 80" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>`,
    `<circle cx="35" cy="65" r="15" fill="rgba(255,255,255,0.12)"/>`,
    `<polygon points="50,5 61,35 95,35 68,55 79,85 50,68 21,85 32,55 5,35 39,35" fill="rgba(255,255,255,0.07)" transform="scale(0.7) translate(21,21)"/>`,
    `<rect x="25" y="10" width="50" height="50" rx="25" fill="rgba(255,255,255,0.1)"/>`,
    `<circle cx="50" cy="35" r="20" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="60" r="15" fill="rgba(255,255,255,0.06)"/>`,
    `<path d="M10 50 Q25 15 50 50 Q75 15 90 50" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"/>`,
    `<rect x="10" y="30" width="80" height="40" rx="20" fill="rgba(255,255,255,0.08)"/>`,
    `<circle cx="30" cy="30" r="8" fill="rgba(255,255,255,0.15)"/><circle cx="70" cy="30" r="8" fill="rgba(255,255,255,0.15)"/><circle cx="50" cy="70" r="8" fill="rgba(255,255,255,0.15)"/>`,
    `<polygon points="50,15 85,50 50,85 15,50" fill="rgba(255,255,255,0.1)"/>`,
    `<path d="M25 25 h50 v50 h-50 z" fill="rgba(255,255,255,0.08)" rx="8"/>`,
    `<circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" stroke-dasharray="10 5"/>`,
    `<rect x="20" y="20" width="60" height="60" rx="12" fill="rgba(255,255,255,0.06)" transform="rotate(10 50 50)"/>`,
    `<circle cx="50" cy="40" r="22" fill="rgba(255,255,255,0.1)"/><rect x="35" y="55" width="30" height="20" rx="10" fill="rgba(255,255,255,0.06)"/>`,
    `<path d="M30 70 Q50 10 70 70" stroke="rgba(255,255,255,0.12)" stroke-width="8" fill="none"/>`,
    `<circle cx="25" cy="25" r="10" fill="rgba(255,255,255,0.15)"/><circle cx="75" cy="75" r="10" fill="rgba(255,255,255,0.15)"/>`,
    `<polygon points="50,10 90,75 10,75" fill="rgba(255,255,255,0.08)"/>`,
    `<rect x="30" y="15" width="40" height="70" rx="8" fill="rgba(255,255,255,0.1)"/>`,
    `<ellipse cx="50" cy="50" rx="35" ry="25" fill="rgba(255,255,255,0.1)"/>`,
    `<path d="M15 50 Q50 5 85 50 Q50 95 15 50" stroke="rgba(255,255,255,0.1)" stroke-width="5" fill="none"/>`
  ];

  const accentIdx = patternSeed % accents.length;

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

// ── Update Nav on ALL Pages ──
function updateAllNavs() {
  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');
  const letter = (user ? user.name : 'U')[0].toUpperCase();
  const avatarURL = user ? getAvatarURL(user.name) : null;

  // Homepage nav (#authNavItem)
  const authNavItem = document.getElementById('authNavItem');
  if (authNavItem) {
    if (user) {
      authNavItem.innerHTML = `
        <a href="pages/dashboard.html" class="nav-user-profile">
          <img src="${avatarURL}" alt="${user.name}" class="nav-avatar-img">
          <span class="nav-username">${user.name || 'User'}</span>
        </a>
      `;
    } else {
      authNavItem.innerHTML = `<a href="pages/login.html" class="btn btn-primary nav-signin">Sign In</a>`;
    }
  }

  // Dashboard page nav (#dashboardAuthNav)
  const dashboardAuth = document.getElementById('dashboardAuthNav');
  if (dashboardAuth && user) {
    dashboardAuth.innerHTML = `
      <div class="nav-user-profile">
        <img src="${avatarURL}" alt="${user.name}" class="nav-avatar-img">
        <span class="nav-username">${user.name || 'User'}</span>
      </div>
    `;
  }

  // Product page nav
  const navDashboardE = document.getElementById('navDashboard');
  const navSigninE = document.getElementById('navSignin');
  if (navDashboardE && navSigninE) {
    if (user) {
      navDashboardE.style.display = '';
      navDashboardE.href = 'dashboard.html';
      navSigninE.style.display = 'none';
    } else {
      navDashboardE.style.display = 'none';
      navSigninE.style.display = '';
      navSigninE.href = 'login.html';
    }
  }

  // Dashboard user greeting area
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  if (userAvatar && user) {
    userAvatar.innerHTML = `<img src="${avatarURL}" alt="${user.name}">`;
    userAvatar.className = 'user-avatar-img-wrap';
  }
  if (userName && user) {
    userName.textContent = `Welcome back, ${user.name || 'User'}!`;
  }
  if (userEmail && user) {
    userEmail.textContent = user.email || '';
  }

  // Homepage hero buttons
  const heroButtons = document.querySelector('.hero-buttons');
  if (heroButtons && user) {
    const getStartedBtn = heroButtons.querySelector('a[href="pages/login.html"]');
    if (getStartedBtn) {
      getStartedBtn.href = 'pages/dashboard.html';
      getStartedBtn.textContent = 'Go to Dashboard →';
    }
  }

  // Login page user greeting
  const loginUser = document.getElementById('loginUser');
  if (loginUser && user) {
    loginUser.innerHTML = `
      <img src="${avatarURL}" alt="${user.name}" class="login-avatar">
      <div class="login-user-info">
        <span class="login-user-name">${user.name || 'User'}</span>
        <span class="login-user-email">${user.email || ''}</span>
      </div>
    `;
  }
}

// ── Logout ──
function handleLogout() {
  firebase.auth().signOut().then(() => {
    localStorage.removeItem('aurix_user');
    window.location.href = '../index.html';
  });
}

// ── Redirect to Dashboard ──
function redirectToDashboard() {
  window.location.href = 'dashboard.html';
}

// ── Show Alert ──
function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    setTimeout(() => { alertBox.className = 'alert'; }, 5000);
  }
}

// ── Tab Switching ──
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

// ── Check Auth on Protected Pages ──
function requireAuth() {
  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});
