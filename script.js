// ================================================================
//  BLOOM BEYOND — Shared JavaScript
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar Scroll Effect ─────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleNavScroll = () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;

    // Add .scrolled glass effect once past 60px
    if (currentScrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Hide on scroll down (past 120px from top), show on scroll up
    if (currentScrollY > 120) {
      if (scrollDelta > 4) {
        // Scrolling DOWN — collapse
        navbar?.classList.add('nav-hidden');
      } else if (scrollDelta < -4) {
        // Scrolling UP — reveal
        navbar?.classList.remove('nav-hidden');
      }
    } else {
      // Near the top — always show
      navbar?.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleNavScroll);
      ticking = true;
    }
  }, { passive: true });

  handleNavScroll();

  // ── Mobile Menu ──────────────────────────────────────────────
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile .nav-link');
  let menuOpen = false;

  hamburger?.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu?.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const bars = hamburger.querySelectorAll('span');
    if (menuOpen) {
      bars[0].style.cssText = 'transform: rotate(45deg) translate(4px, 4px)';
      bars[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
      bars[2].style.cssText = 'transform: rotate(-45deg) translate(4px, -4px)';
    } else {
      bars.forEach(b => b.style.cssText = '');
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
      hamburger?.querySelectorAll('span').forEach(b => b.style.cssText = '');
    });
  });

  // ── Scroll Reveal ────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ── Stat Counter Animation ───────────────────────────────────
  const counterEls = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const start = performance.now();
    const isDecimal = !Number.isInteger(target);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Filter Pills ─────────────────────────────────────────────
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const parent = pill.closest('.filter-inner');
      parent?.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;
      const cards = document.querySelectorAll('[data-category]');
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(() => card.style.opacity = '1', 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 300);
        }
      });
    });
  });

  // ── Custom Magnetic Cursor (desktop only) ────────────────────
  if (window.matchMedia("(pointer: fine)").matches) {
    const cursorDot = document.createElement('div');
    cursorDot.id = 'custom-cursor-dot';
    const cursorRing = document.createElement('div');
    cursorRing.id = 'custom-cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Instantly move the dot
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    // Smoothly animate the ring trailing behind the dot
    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Add magnetic effect to interactive elements
    const setupMagneticElements = () => {
      const interactables = document.querySelectorAll('a, button, input, textarea, select, .card, .gc, .btn, .nav-link, .globe-marker, .globe-panel-close');
      interactables.forEach(el => {
        // Prevent adding multiple listeners
        if (el.dataset.magneticInit) return;
        el.dataset.magneticInit = 'true';
        
        el.addEventListener('mouseenter', () => {
          cursorDot.classList.add('magnetic');
          cursorRing.classList.add('magnetic');
        });
        el.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('magnetic');
          cursorRing.classList.remove('magnetic');
        });
      });
    };
    setupMagneticElements();

    // Handle dynamically added elements (like globe markers)
    const observer = new MutationObserver(() => setupMagneticElements());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Smooth anchor links ──────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Active nav link ──────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  // ── Card hover parallax ──────────────────────────────────────
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  // ── Client Login Modal ───────────────────────────────────────
  const navClientAccess = document.getElementById('navClientAccess');
  const mobileClientAccess = document.getElementById('mobileClientAccess');
  const loginModal = document.getElementById('clientLoginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');

  if (loginModal && closeLoginModal) {
    const openModal = (e) => {
      e.preventDefault();
      loginModal.classList.add('active');
    };
    
    if (navClientAccess) navClientAccess.addEventListener('click', openModal);
    if (mobileClientAccess) mobileClientAccess.addEventListener('click', openModal);

    closeLoginModal.addEventListener('click', () => {
      loginModal.classList.remove('active');
    });

    // Close on click outside modal content
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.classList.remove('active');
      }
    });
  }

  // ── Mobile Bottom Nav Active State ───────────────────────────
  const path = window.location.pathname;
  const page = path.split("/").pop();
  
  document.querySelectorAll('.bottom-nav-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });

});
