// ================================================================
//  BLOOM BEYOND — Shared JavaScript
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar Scroll Effect ─────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  // ── WebGL Globe (Global Portfolio) ───────────────────────────
  const globeContainer = document.getElementById('globeContainer');
  if (globeContainer && window.Globe) {
    const locations = [
      { lat: 25.2048, lng: 55.2708, city: 'Dubai, UAE', title: 'The Elysian Tower', desc: 'A 92-story architectural marvel offering unrestricted views of the Persian Gulf. Features private infinity pools and helipad access.', price: '$12,500,000', status: 'Off-Plan' },
      { lat: 51.5074, lng: -0.1278, city: 'London, UK', title: 'Mayfair Penthouse', desc: 'An ultra-rare, lateral penthouse in the heart of London’s most exclusive district. Bespoke interiors by royal warrant holders.', price: '$28,000,000', status: 'Available' },
      { lat: 40.7128, lng: -74.0060, city: 'New York, USA', title: 'Central Park Skyhouse', desc: 'Occupying the entire 84th floor with 360-degree views of Manhattan. Triple-height ceilings and a private art gallery.', price: '$45,000,000', status: 'Available' },
      { lat: 43.7384, lng: 7.4246, city: 'Monaco', title: 'La Mer Villa', desc: 'A cliffside modern masterpiece with private yacht mooring, a subterranean supercar vault, and direct Mediterranean access.', price: '$65,000,000', status: 'Off-Market' },
      { lat: 25.7617, lng: -80.1918, city: 'Miami, USA', title: 'Biscayne Bay Estate', desc: 'A sprawling waterfront estate designed by renowned architects, featuring a private beach and a 100ft dock.', price: '$18,500,000', status: 'Available' }
    ];

    const globe = Globe()
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .htmlElementsData(locations)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.className = 'globe-marker';
        const pulse = document.createElement('div');
        pulse.className = 'globe-marker-pulse';
        el.appendChild(pulse);
        
        el.onclick = () => {
          const panel = document.getElementById('globeSidePanel');
          document.getElementById('gpLocation').innerText = d.city;
          document.getElementById('gpTitle').innerText = d.title;
          document.getElementById('gpDesc').innerText = d.desc;
          document.getElementById('gpPrice').innerText = d.price;
          document.getElementById('gpStatus').innerText = d.status;
          panel.classList.add('open');
        };
        return el;
      })
      (globeContainer);

    // Initial rotation and settings
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableZoom = false;
    globe.pointOfView({ altitude: 2.2 });

    // Handle resize
    window.addEventListener('resize', () => {
      globe.width(globeContainer.clientWidth);
      globe.height(globeContainer.clientHeight);
    });
    
    // Close panel
    const closePanel = document.getElementById('closeGlobePanel');
    if (closePanel) {
      closePanel.addEventListener('click', () => {
        document.getElementById('globeSidePanel').classList.remove('open');
      });
    }
  }

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
