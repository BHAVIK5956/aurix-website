// ============================================
// AURIX WEBSITE — AUTH.JS
// Firebase Authentication + Supabase Database
// ============================================

// ── Firebase Configuration ──
const firebaseConfig = {
  apiKey: "AIzaSyAblqUFOmaeCkBKDdcZdjqy8719qnyfUXA",
  authDomain: "aurix-8ee5a.firebaseapp.com",
  projectId: "aurix-8ee5a",
  storageBucket: "aurix-8ee5a.firebasestorage.app",
  messagingSenderId: "1092104386501",
  appId: "1:1092104386501:web:0d4df8372501dacfe77dac"
};

// ── Supabase Configuration ──
const SUPABASE_URL = "https://spcznnskyfxcjqtoywdv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwY3pubnNreWZ4Y2pxdG95d2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTk0MzQsImV4cCI6MjA5NTQzNTQzNH0.fcjooZWZQQGD-WpWjBFtU9QWu8pnLK5PgjmncBCQhb0";

// ── Auth State ──
let currentUser = null;
let firebaseInitialized = false;

// ── Initialize Firebase ──
function initFirebase() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn('Firebase not configured yet.');
    return false;
  }
  try {
    if (!firebaseInitialized) {
      firebase.initializeApp(firebaseConfig);
      firebaseInitialized = true;
    }

    // Listen for auth state changes — this is the KEY to persistence
    // Firebase remembers the session in IndexedDB automatically
    firebase.auth().onAuthStateChanged((user) => {
      currentUser = user;
      if (user) {
        // Save/update user data in localStorage AND Supabase
        const userData = {
          name: user.displayName || 'User',
          email: user.email,
          photo: user.photoURL || null,
          uid: user.uid
        };
        localStorage.setItem('aurix_user', JSON.stringify(userData));
        saveUserToSupabase(user);
        // Update nav on every page because auth state changed
        updateAllNavs();
      } else {
        localStorage.removeItem('aurix_user');
        updateAllNavs();
      }
    });

    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

// ── Update Nav on ALL Pages ──
function updateAllNavs() {
  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');

  // Homepage nav (#authNavItem)
  const authNavItem = document.getElementById('authNavItem');
  if (authNavItem) {
    if (user) {
      // Show profile avatar + name + Dashboard link
      authNavItem.innerHTML = `
        <a href="pages/dashboard.html" class="nav-user-profile">
          <div class="nav-avatar">${(user.name || 'U')[0].toUpperCase()}</div>
          <span class="nav-username">${user.name || 'User'}</span>
        </a>
      `;
    } else {
      authNavItem.innerHTML = `<a href="pages/login.html" class="btn btn-primary nav-signin">Sign In</a>`;
    }
  }

  // Dashboard page nav (#dashboardAuthNav)
  const dashboardAuth = document.getElementById('dashboardAuthNav');
  if (dashboardAuth) {
    if (user) {
      dashboardAuth.innerHTML = `
        <div class="nav-user-profile">
          <div class="nav-avatar">${(user.name || 'U')[0].toUpperCase()}</div>
          <span class="nav-username">${user.name || 'User'}</span>
        </div>
      `;
    }
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

  // Homepage hero buttons — change "Get Started" to "Go to Dashboard" if logged in
  const heroButtons = document.querySelector('.hero-buttons');
  if (heroButtons && user) {
    const getStartedBtn = heroButtons.querySelector('a[href="pages/login.html"]');
    if (getStartedBtn) {
      getStartedBtn.href = 'pages/dashboard.html';
      getStartedBtn.textContent = 'Go to Dashboard →';
    }
  }
}

// ── Google Auth ──
function handleGoogleAuth() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => {
      // onAuthStateChanged will handle the rest
      redirectToDashboard();
    })
    .catch((error) => {
      showAlert('Google sign-in failed: ' + error.message, 'error');
    });
}

// ── GitHub Auth ──
function handleGitHubAuth() {
  const provider = new firebase.auth.GithubAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => {
      redirectToDashboard();
    })
    .catch((error) => {
      showAlert('GitHub sign-in failed: ' + error.message, 'error');
    });
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
    .then(() => {
      redirectToDashboard();
    })
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

// ── Check Auth on Protected Pages (Dashboard) ──
// This checks IMMEDIATELY on page load, before Firebase async check completes
function requireAuth() {
  // Check localStorage first for instant redirect decision
  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');
  if (!user) {
    // Not even in localStorage — definitely not logged in
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});
