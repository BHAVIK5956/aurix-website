// ============================================
// AURIX WEBSITE — MAIN.JS
// System theme, navigation, scroll effects
// ============================================

// ── System Theme Detection ──
const html = document.documentElement;

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

// Use saved preference first, then fall back to system
const savedTheme = localStorage.getItem('aurix_theme');
const initialTheme = savedTheme || getSystemTheme();
html.setAttribute('data-theme', initialTheme);

// Listen for system theme changes (real-time)
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('aurix_theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

// ── Smooth Scroll for Anchor Links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Navbar Scroll Effect ──
const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = 'var(--shadow-md)';
      navbar.style.background = html.getAttribute('data-theme') === 'dark'
        ? 'rgba(13, 13, 15, 0.9)'
        : 'rgba(250, 250, 250, 0.9)';
      navbar.style.backdropFilter = 'blur(12px)';
      navbar.style.webkitBackdropFilter = 'blur(12px)';
    } else {
      navbar.style.boxShadow = 'none';
      navbar.style.background = '';
      navbar.style.backdropFilter = '';
      navbar.style.webkitBackdropFilter = '';
    }
  });
}

// ── Homepage Scroll-Based Nav Highlighting ──
const sections = document.querySelectorAll('#hero, #about, #products, #contact');
const navLinks = document.querySelectorAll('.nav-link');

if (sections.length > 0 && navLinks.length > 0) {
  window.addEventListener('scroll', () => {
    let currentSection = 'hero';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    // Handle bottom of page — highlight Contact
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      currentSection = 'contact';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSection) {
        link.classList.add('active');
      }
    });
  });
}

// ── Auth State: Update Nav for Homepage ──
function updateHomepageNav() {
  const authNavItem = document.getElementById('authNavItem');
  if (!authNavItem) return;

  const user = JSON.parse(localStorage.getItem('aurix_user') || 'null');
  if (user) {
    // User is logged in — show Dashboard link instead of Sign In
    authNavItem.innerHTML = `<a href="pages/dashboard.html" class="btn btn-primary nav-signin">Dashboard →</a>`;
  } else {
    authNavItem.innerHTML = `<a href="pages/login.html" class="btn btn-primary nav-signin">Sign In</a>`;
  }
}

// Run on homepage load
document.addEventListener('DOMContentLoaded', () => {
  updateHomepageNav();

  // Animate on Scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .stat-card, .user-type-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

// ── Console Easter Egg ──
console.log('%c✨ AURIX — AI That Grows With You', 'font-size: 20px; font-weight: bold; color: #00BFA6;');
console.log('%cBuilt with ❤️ by Bhavik in Bengaluru', 'font-size: 12px; color: #888;');
