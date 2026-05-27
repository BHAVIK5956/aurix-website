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
// TODO: Replace with your actual Supabase config
// Get this from: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = "https://spcznnskyfxcjqtoywdv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwY3pubnNreWZ4Y2pxdG95d2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTk0MzQsImV4cCI6MjA5NTQzNTQzNH0.fcjooZWZQQGD-WpWjBFtU9QWu8pnLK5PgjmncBCQhb0";

// ── Auth State ──
let currentUser = null;

// Initialize Firebase (when config is set)
function initFirebase() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn('Firebase not configured yet. Auth buttons will show placeholder.');
    return false;
  }
  try {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged((user) => {
      currentUser = user;
      if (user) {
        localStorage.setItem('aurix_user', JSON.stringify({
          name: user.displayName || 'User',
          email: user.email,
          photo: user.photoURL || null,
          uid: user.uid
        }));
      }
    });
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

// ── Google Auth ──
function handleGoogleAuth() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    showAlert('Firebase is not configured yet. Please set up Firebase Auth first.', 'error');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      saveUserToSupabase(user);
      redirectToDashboard();
    })
    .catch((error) => {
      showAlert('Google sign-in failed: ' + error.message, 'error');
    });
}

// ── GitHub Auth ──
function handleGitHubAuth() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    showAlert('Firebase is not configured yet. Please set up Firebase Auth first.', 'error');
    return;
  }
  const provider = new firebase.auth.GithubAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      saveUserToSupabase(user);
      redirectToDashboard();
    })
    .catch((error) => {
      showAlert('GitHub sign-in failed: ' + error.message, 'error');
    });
}

// ── Email/Password Sign Up ──
function handleEmailSignUp(e) {
  e.preventDefault();
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    showAlert('Firebase is not configured yet.', 'error');
    return;
  }
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      return result.user.updateProfile({ displayName: name });
    })
    .then(() => {
      const user = firebase.auth().currentUser;
      saveUserToSupabase(user);
      showAlert('Account created successfully! Redirecting...', 'success');
      setTimeout(redirectToDashboard, 1000);
    })
    .catch((error) => {
      showAlert('Sign up failed: ' + error.message, 'error');
    });
}

// ── Email/Password Sign In ──
function handleEmailSignIn(e) {
  e.preventDefault();
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    showAlert('Firebase is not configured yet.', 'error');
    return;
  }
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      saveUserToSupabase(result.user);
      redirectToDashboard();
    })
    .catch((error) => {
      showAlert('Sign in failed: ' + error.message, 'error');
    });
}

// ── Save User to Supabase ──
async function saveUserToSupabase(user) {
  if (SUPABASE_URL.includes("YOUR_PROJECT")) {
    console.warn('Supabase not configured yet.');
    return;
  }
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
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.auth().signOut();
  }
  localStorage.removeItem('aurix_user');
  window.location.href = 'login.html';
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
      ? "Don't have an account? <a href='#' onclick=\"switchTab('signup')\">Sign up</a>"
      : "Already have an account? <a href='#' onclick=\"switchTab('signin')\">Sign in</a>";
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
