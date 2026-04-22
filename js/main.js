/* ============================================================
   LES VOIX D'ÈVE — JavaScript principal
   ============================================================ */

// ── Navigation scroll effect ──────────────────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ── Burger menu ───────────────────────────────────────────────
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    burger.setAttribute('aria-expanded', isOpen);

    // Animate burger spans
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

// ── Intersection Observer — fade-in sections ──────────────────
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards and sections
document.querySelectorAll(
  '.service-card, .fondatrices-card, .pilier-item, .stat-content, .approche-texte'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add visible class styles
const style = document.createElement('style');
style.textContent = `
  .visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// Stagger service cards
document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// Stagger pilier items
document.querySelectorAll('.pilier-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.1}s`;
});
