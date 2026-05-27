// ============================================
// AURIX WEBSITE — MAIN.JS
// System theme (no toggle), navigation, scroll effects
// ============================================

const html = document.documentElement;

// ── System Theme Detection (NO toggle, always follow browser) ──
// Clear any old saved theme so system preference always wins
localStorage.removeItem('aurix_theme');

function applyTheme() {
  const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  html.setAttribute('data-theme', isLight ? 'light' : 'dark');
}

// Apply immediately
applyTheme();

// Listen for system theme changes in real-time
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
}

// ── Smooth Scroll for Anchor Links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '') return;
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
      const isDark = html.getAttribute('data-theme') === 'dark';
      navbar.style.background = isDark ? 'rgba(13, 13, 15, 0.9)' : 'rgba(250, 250, 250, 0.9)';
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

// ── Console Easter Egg ──
console.log('%c✨ AURIX — AI That Grows With You', 'font-size: 20px; font-weight: bold; color: #00BFA6;');
console.log('%cBuilt with ❤️ by Bhavik in Bengaluru', 'font-size: 12px; color: #888;');
