// ================================================================
//  BEYOND BLOOM — Property Detail Modal & Lightbox Gallery
//  Document-level event delegation, Supabase property normalization,
//  bulk gallery photo slider, and direct lead integration.
// ================================================================

(function () {
  // ── Property data catalogue (fallback copy for static showcases) ──
  const PROPERTY_DATA = {
    'Noir Estate': {
      badge: 'Featured',
      price: '$34,000,000',
      title: 'Noir Estate',
      location: 'Bel-Air, Los Angeles',
      specs: [
        { val: '8',      label: 'Bedrooms' },
        { val: '11',     label: 'Bathrooms' },
        { val: '18,500', label: 'Sq Ft' },
        { val: '2',      label: 'Pools' },
        { val: '12-Car', label: 'Garage' },
      ],
      desc: `A statement of absolute prestige. This singular estate commands the Bel-Air hillside, offering 18,500 sq ft of custom-designed living space against a breathtaking 270° panorama of Los Angeles. Every detail reflects the obsessive pursuit of perfection — from the hand-selected Calacatta marble to the bespoke walnut millwork crafted by master artisans.\n\nThe estate features a resort-style pool complex, a fully equipped professional cinema, a private gym and spa, and a climate-controlled wine cellar holding over 2,000 bottles. The chef's kitchen is outfitted with restaurant-grade appliances and a dedicated catering kitchen beyond.\n\nSituated on 1.8 acres behind private gates, this is one of the most significant residential offerings to come to market in Bel-Air in a decade.`,
      features: [
        '270° Panoramic Views', 'Two Infinity Pools', 'Home Cinema', 'Private Wine Cellar',
        'Smart Home Automation', 'Chef & Catering Kitchen', 'Gym & Spa Suite', '12-Car Garage',
        'Private Gated Entry', 'Staff Quarters', 'Rooftop Terrace', 'Guest House',
      ],
      images: ['images/listing_villa.jpg', 'images/listing_penthouse.jpg', 'images/listing_skyhouse.jpg'],
    },
    'The Sky Mansion': {
      badge: 'Exclusive',
      price: '£ 28,500,000',
      title: 'The Sky Mansion',
      location: 'Mayfair, London',
      specs: [
        { val: '7',      label: 'Bedrooms' },
        { val: '9',      label: 'Bathrooms' },
        { val: '12,400', label: 'Sq Ft' },
      ],
      desc: `Occupying the upper floors of one of Mayfair's most celebrated addresses, The Sky Mansion is a lateral residence of extraordinary scale and refinement. Designed by an internationally acclaimed studio, the interiors marry heritage architectural details with contemporary luxury at the very highest level.\n\nThe principal reception room stretches over 80 feet, framed by original cornicing and flooded with natural light from south-facing windows overlooking a private garden square. The primary suite encompasses a dressing room, his-and-hers bathrooms finished in honed Statuario marble, and a morning room.\n\nA private lift, 24-hour concierge, and parking for three vehicles complete this exceptional offering in the heart of London's most coveted village.`,
      features: [
        'Private Lift Access', 'Garden Square Views', 'Honed Statuario Marble', 'Original Cornicing',
        '24-Hour Concierge', '3 Parking Spaces', 'South-Facing Reception', 'Staff Accommodation',
        'Wine Room', 'Gymnasium', 'Media Room', 'Smart Home System',
      ],
      images: ['images/listing_skyhouse.jpg', 'images/listing_penthouse.jpg', 'images/listing_villa.jpg'],
    },
    'The Obsidian Penthouse': {
      badge: null,
      price: '$18,900,000',
      title: 'The Obsidian Penthouse',
      location: 'Tribeca, New York',
      specs: [
        { val: '5',     label: 'Bedrooms' },
        { val: '6',     label: 'Bathrooms' },
        { val: '7,200', label: 'Sq Ft' },
      ],
      desc: `Perched atop one of Tribeca's finest boutique buildings, The Obsidian Penthouse commands 360-degree views from the Hudson River to the Midtown skyline. The full-floor footprint, accessed via private key-locked elevator, delivers an unprecedented sense of space in the heart of Lower Manhattan.\n\nThe interiors, conceived by a Pritzker Prize–winning architect, are defined by poured concrete, blackened steel, and hand-blown glass — a palette of extraordinary sophistication. A wraparound terrace of 2,400 sq ft provides private outdoor space at elevation, complete with an outdoor kitchen and fire pit.\n\nThis is a once-in-a-generation opportunity to acquire the defining residence of one of New York's most storied neighbourhoods.`,
      features: [
        '360° City & River Views', '2,400 Sq Ft Terrace', 'Private Lift Lobby', 'Outdoor Kitchen',
        'Poured Concrete Interiors', 'Blackened Steel Details', 'Smart Climate Control', 'Doorman Building',
        'Private Storage', 'Bicycle Room', 'Rooftop Garden Access', 'Valet Parking',
      ],
      images: ['images/listing_penthouse.jpg', 'images/listing_skyhouse.jpg', 'images/listing_villa.jpg'],
    },
    'Villa Lumière': {
      badge: 'Off-Market',
      price: '€ 42,000,000',
      title: 'Villa Lumière',
      location: 'Cap Ferrat, Côte d\'Azur',
      specs: [
        { val: '9',      label: 'Bedrooms' },
        { val: '12',     label: 'Bathrooms' },
        { val: '21,000', label: 'Sq Ft' },
      ],
      desc: `Commanding an enviable position on the Cap Ferrat peninsula — one of the world's most exclusive and sought-after addresses — Villa Lumière is a rare masterpiece of Provençal architecture reinterpreted through the lens of contemporary luxury.\n\nSet within 2.4 acres of manicured grounds, the estate offers 360-degree views encompassing the Bay of Villefranche, Monaco, and the Italian Riviera beyond. The main villa, guest pavilion, and staff cottage are linked by fragrant gardens, terraces, and a horizon pool that appears to cascade into the sea.\n\nThe property is offered with all furnishings, artworks, and a private berth in a nearby marina — an unparalleled proposition on the French Riviera.`,
      features: [
        'Cap Ferrat Peninsula', '360° Mediterranean Views', 'Horizon Infinity Pool', 'Private Marina Berth',
        '2.4 Acres of Gardens', 'Guest Pavilion', 'Helipad', 'Wine Cave',
        'Home Cinema', 'Gym & Spa', 'Staff Quarters', 'Fully Furnished',
      ],
      images: ['images/listing_villa.jpg', 'images/listing_penthouse.jpg', 'images/listing_skyhouse.jpg'],
    },
    'Palm Crown Residences': {
      badge: 'Featured',
      price: 'AED 85,000,000',
      title: 'Palm Crown Residences',
      location: 'Palm Jumeirah, Dubai',
      specs: [
        { val: '6',      label: 'Bedrooms' },
        { val: '8',      label: 'Bathrooms' },
        { val: '10,800', label: 'Sq Ft' },
      ],
      desc: `Positioned on the crown of Palm Jumeirah, Dubai's most iconic address, Palm Crown Residences offers a private waterfront villa of extraordinary scale and specification. The property commands unobstructed views of the Arabian Gulf, the Dubai skyline, and the Burj Al Arab.\n\nThe villa spans four floors, with a private beach, a temperature-controlled infinity pool, a cinema room, and a dedicated staff wing. Interiors have been designed and curated by a leading Dubai studio, featuring custom Italian furniture, hand-embroidered silk wall coverings, and book-matched Carrara marble throughout.\n\nA private jetty capable of accommodating a 30-metre yacht makes this one of the most complete waterfront offerings in the UAE.`,
      features: [
        'Private Beach', 'Private Jetty (30m)', 'Infinity Pool', 'Gulf & Skyline Views',
        'Cinema Room', 'Italian Custom Furniture', 'Carrara Marble Throughout', 'Staff Wing',
        'Smart Home System', 'Solar Energy System', 'Gym & Spa', '5-Car Garage',
      ],
      images: ['images/listing_skyhouse.jpg', 'images/listing_villa.jpg', 'images/listing_penthouse.jpg'],
    },
    'Burj View Penthouse': {
      badge: 'Featured',
      price: 'AED 32,000,000',
      title: 'Burj View Penthouse',
      location: 'DIFC · Dubai',
      specs: [
        { val: '5',     label: 'Bedrooms' },
        { val: '7',     label: 'Bathrooms' },
        { val: '8,400', label: 'Sq Ft' },
      ],
      desc: `An extraordinary sky sanctuary situated in the heart of Dubai International Financial Centre. Featuring double-height ceilings, floor-to-ceiling soundproof acoustic glass, and full-aspect unobstructed views of Burj Khalifa and the city skyline.\n\nCrafted with hand-honed Statuario marble, bespoke Poliform kitchen systems, and a private wraparound sunset entertainment terrace.`,
      features: [
        'Burj Khalifa Panoramic Views', 'Private Elevator & Foyer', 'Poliform Master Kitchen', 'Wraparound Sunset Terrace',
        '24/7 Valet & White-Glove Security', 'Infinity Lap Pool Access', 'Wine Cellar Room', 'Private 4-Car Parking',
      ],
      images: ['images/prop_dubai_penthouse.jpg', 'images/listing_skyhouse.jpg', 'images/listing_villa.jpg'],
    },
    'Palm Shoreline Villa': {
      badge: 'New',
      price: 'AED 55,000,000',
      title: 'Palm Shoreline Villa',
      location: 'Palm Jumeirah · Dubai',
      specs: [
        { val: '7',      label: 'Bedrooms' },
        { val: '9',      label: 'Bathrooms' },
        { val: '14,200', label: 'Sq Ft' },
      ],
      desc: `Direct beachfront living on the prestigious Palm Jumeirah fronds. Enjoy private sea frontage, pristine white sands, temperature-regulated infinity pool, and custom interior architecture designed for grand entertaining and effortless Mediterranean-inspired indoor-outdoor flow.`,
      features: [
        'Private Beach Access', 'Infinity Pool Cascading to Sea', 'Private Boat Moorings', 'Sub-Zero & Miele Kitchens',
        'Smart Home Savant System', 'Separate Maid & Driver Quarters', 'Gated Security Enclave', 'Private Rooftop Solarium',
      ],
      images: ['images/prop_palm_villa.jpg', 'images/listing_villa.jpg', 'images/prop_dubai_penthouse.jpg'],
    },
    'The Obsidian Residence': {
      badge: 'Exclusive',
      price: 'AED 18,500,000',
      title: 'The Obsidian Residence',
      location: 'Downtown · Dubai',
      specs: [
        { val: '3',     label: 'Bedrooms' },
        { val: '4',     label: 'Bathrooms' },
        { val: '4,800', label: 'Sq Ft' },
      ],
      desc: `Architecturally striking corner residence in Downtown Dubai. Featuring blackened titanium accents, fluted Italian marble walls, integrated Bang & Olufsen soundscapes, and dramatic views across the Opera District fountains.`,
      features: [
        'Opera District Views', 'Black Titanium Architecture', 'Private Elevator Foyer', 'Integrated Home Automation',
        'Concierge & In-Residence Dining', 'State-of-the-art Wellness Gym', 'Reserved Covered Parking',
      ],
      images: ['images/prop_downtown_apt.jpg', 'images/listing_penthouse.jpg', 'images/listing_skyhouse.jpg'],
    },
    'Grand Estate, Emirates Hills': {
      badge: 'Off-Market',
      price: 'AED 120,000,000',
      title: 'Grand Estate, Emirates Hills',
      location: 'Emirates Hills · Dubai',
      specs: [
        { val: '9',      label: 'Bedrooms' },
        { val: '14',     label: 'Bathrooms' },
        { val: '28,000', label: 'Sq Ft' },
      ],
      desc: `Dubbed the Beverly Hills of Dubai, this palatial estate overlooks the Montgomerie Championship Golf Course. Set over manicured resort grounds with 2 private pools, underground car gallery, private cinema, and separate guest and staff villas.`,
      features: [
        'Championship Golf Course Views', '10-Car Underground Gallery', 'Private Cinema & Bowling Suite', 'Two Infinity Pools & Spa',
        'Full Security Pavilion', 'Formal & Family Dining Wings', 'Grand Reception Hall', 'Helipad Access Nearby',
      ],
      images: ['images/prop_emirates_mansion.jpg', 'images/listing_villa.jpg', 'images/prop_dubai_penthouse.jpg'],
    },
    'The Elysian Tower': {
      badge: 'Off-Plan',
      price: 'AED 12,500,000',
      title: 'The Elysian Tower',
      location: 'Downtown Dubai, UAE',
      specs: [
        { val: '3',     label: 'Bedrooms' },
        { val: '4',     label: 'Bathrooms' },
        { val: '4,200', label: 'Sq Ft' },
        { val: '2027',  label: 'Completion' },
      ],
      desc: `Rising 92 floors above Downtown Dubai, The Elysian Tower is a masterwork of contemporary architecture that will redefine the city's skyline upon completion in 2027. Each residence occupies a full floor or half-floor, ensuring unrivalled privacy and views that span the Burj Khalifa, the Desert, and the Arabian Gulf.`,
      features: [
        'Full & Half-Floor Residences', 'Burj Khalifa Views', 'Sky Gardens (3 Levels)', 'Level-72 Infinity Pool',
        'ESPA Spa', 'Members\' Club', 'Michelin-Star Restaurant', 'Golden Visa Eligible',
      ],
      images: ['images/listing_skyhouse.jpg', 'images/listing_penthouse.jpg', 'images/listing_villa.jpg'],
    },
  };

  // ── Normalize Supabase / DOM Property Object ─────────────────
  function normalizeProperty(p) {
    if (!p) p = {};

    // 1. Title fallback
    const title = p.title || 'Luxury Residence';

    // 2. Location fallback
    const location = p.location || p.community || 'Dubai';

    // 3. Type fallback
    const type = p.type || p.sub_community || p.property_type || 'Residence';

    // 4. Price formatting: Clean numeric value formatted as 'AED ' + Number.toLocaleString()
    let formattedPrice = 'Price on Application';
    if (p.price != null && p.price !== '') {
      if (typeof p.price === 'number') {
        formattedPrice = 'AED ' + Number(p.price).toLocaleString();
      } else {
        const cleanStr = String(p.price).trim();
        const numericVal = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
        if (cleanStr.toUpperCase().includes('AED') || cleanStr.startsWith('$') || cleanStr.startsWith('£') || cleanStr.startsWith('€')) {
          formattedPrice = cleanStr;
        } else if (!isNaN(numericVal) && numericVal > 0) {
          formattedPrice = 'AED ' + Number(numericVal).toLocaleString();
        } else {
          formattedPrice = cleanStr;
        }
      }
    }

    // 5. Specs fallbacks
    const bedrooms = p.bedrooms ?? p.beds ?? 0;
    const bathrooms = p.bathrooms ?? p.baths ?? 0;
    const area_sqft = p.area_sqft ?? p.sqft ?? p.area ?? 0;

    // 6. Description fallback
    const description = p.description || p.desc || 'Contact Beyond Bloom for the private dossier and floorplans.';

    // 7. Hero Image fallback
    const hero_image_url = p.hero_image_url || p.image || p.image_url ||
      (Array.isArray(p.gallery_urls) && p.gallery_urls[0]) ||
      (Array.isArray(p.images) && p.images[0]) ||
      '/images/prop_dubai_penthouse.jpg';

    // 8. Gallery array: Combine [hero, ...gallery_urls, ...images].filter(Boolean) (deduplicated)
    const gallery = [];
    const addImg = (u) => {
      if (!u || typeof u !== 'string') return;
      const clean = u.trim();
      if (clean && !gallery.includes(clean)) {
        gallery.push(clean);
      }
    };

    addImg(hero_image_url);
    if (Array.isArray(p.gallery_urls)) p.gallery_urls.forEach(addImg);
    if (Array.isArray(p.images)) p.images.forEach(addImg);
    if (Array.isArray(p.gallery)) p.gallery.forEach(addImg);
    if (gallery.length === 0) {
      gallery.push('/images/prop_dubai_penthouse.jpg');
    }

    // Specs array for modal display
    let specs = [];
    if (Array.isArray(p.specs) && p.specs.length) {
      specs = p.specs;
    } else {
      if (Number(bedrooms) > 0) specs.push({ val: String(bedrooms), label: 'Bedrooms' });
      if (Number(bathrooms) > 0) specs.push({ val: String(bathrooms), label: 'Bathrooms' });
      if (Number(area_sqft) > 0) specs.push({ val: Number(area_sqft).toLocaleString(), label: 'Sq Ft' });
      if (type) specs.push({ val: type, label: 'Property Type' });
    }

    // Features array
    const features = (Array.isArray(p.features) && p.features.length)
      ? p.features
      : [
          'Panoramic Skyline & Water Views',
          'Bespoke Italian Craftsmanship & Finishes',
          'Private Concierge & Valet Service',
          'Floor-to-Ceiling Thermal Glazing',
          'Smart Home Automation System',
          'Exclusive Private Access',
        ];

    const badge = p.badge || (p.is_featured ? 'Featured' : (p.status === 'available' ? null : p.status?.replace('_', ' ')));

    return {
      ...p,
      id: p.id != null ? String(p.id) : undefined,
      title,
      location,
      community: location,
      type,
      property_type: type.toLowerCase(),
      sub_community: type,
      price: formattedPrice,
      numeric_price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area_sqft: Number(area_sqft) || 0,
      description,
      desc: description,
      hero_image_url: gallery[0] || hero_image_url,
      image: gallery[0] || hero_image_url,
      gallery,
      gallery_urls: gallery,
      images: gallery,
      specs,
      features,
      badge,
      trakheesi_permit: p.trakheesi_permit || p.permit_number || '',
      permit_number: p.trakheesi_permit || p.permit_number || '',
      tour_3d_url: p.tour_3d_url || p.three_d_tour_url || null,
    };
  }

  // Expose globally
  window.BeyondBloomNormalizeProperty = normalizeProperty;

  // ── Lightbox State ───────────────────────────────────────────
  let modalActiveIndex = 0;
  let modalImagesList = [];

  function setModalImage(idx) {
    if (!modalImagesList.length) return;
    modalActiveIndex = (idx + modalImagesList.length) % modalImagesList.length;
    const src = modalImagesList[modalActiveIndex];
    const heroImg = document.getElementById('propModalHeroImg');
    const counterEl = document.getElementById('propModalCounter');
    const thumbsEl = document.getElementById('propModalThumbs');
    const prevBtn = document.getElementById('propModalPrev');
    const nextBtn = document.getElementById('propModalNext');

    if (heroImg) {
      heroImg.style.opacity = '0';
      setTimeout(() => {
        heroImg.src = src;
        heroImg.style.opacity = '1';
      }, 140);
    }

    if (counterEl) {
      counterEl.textContent = `Photo ${modalActiveIndex + 1} of ${modalImagesList.length}`;
      counterEl.style.display = modalImagesList.length > 1 ? 'block' : 'none';
    }

    if (prevBtn && nextBtn) {
      const showNav = modalImagesList.length > 1;
      prevBtn.style.display = showNav ? 'flex' : 'none';
      nextBtn.style.display = showNav ? 'flex' : 'none';
    }

    if (thumbsEl) {
      const allThumbs = thumbsEl.querySelectorAll('.prop-modal-thumb');
      allThumbs.forEach((t, i) => {
        const isActive = i === modalActiveIndex;
        t.classList.toggle('active', isActive);
        if (isActive) {
          t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }
  }

  // ── Build Modal DOM Element ──────────────────────────────────
  function buildModal() {
    if (document.getElementById('propModal')) return;

    const overlay = document.createElement('div');
    overlay.className = 'prop-modal-overlay';
    overlay.id = 'propModal';
    overlay.innerHTML = `
      <button class="prop-modal-close" id="propModalClose" aria-label="Close property details" title="Close (Esc)">✕</button>
      <div class="prop-modal-hero" id="propModalHero">
        <img id="propModalHeroImg" src="" alt="Property Photo" />
        <div class="prop-modal-hero-badge" id="propModalBadge"></div>
        <button class="prop-modal-nav prev" id="propModalPrev" aria-label="Previous photo">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button class="prop-modal-nav next" id="propModalNext" aria-label="Next photo">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <div class="prop-modal-counter" id="propModalCounter"></div>
        <div class="prop-modal-thumbs" id="propModalThumbs"></div>
      </div>
      <div class="prop-modal-body">
        <div class="prop-modal-narrative">
          <div class="prop-modal-price" id="propModalPrice"></div>
          <div class="prop-modal-title" id="propModalTitle"></div>
          <div class="prop-modal-location" id="propModalLocation"></div>
          <div class="prop-modal-specs" id="propModalSpecs"></div>

          <div id="propModalTourWrap" style="margin-bottom: 24px; display: none;"></div>

          <div class="prop-modal-desc" id="propModalDesc"></div>

          <!-- CTAs inside narrative -->
          <div style="display:flex; gap:12px; flex-wrap:wrap; margin:28px 0 36px;">
            <button type="button" class="btn btn-solid" id="propModalScrollViewingBtn" style="padding:14px 28px;">
              <span>Schedule Private Viewing</span>
            </button>
            <button type="button" class="btn" id="propModalRequestFloorplanBtn" style="padding:14px 28px;">
              <span>Request Floorplans & Dossier</span>
            </button>
          </div>

          <div class="gold-rule" style="margin-bottom: 28px;"></div>
          <p class="label" style="margin-bottom: 16px;">Property Highlights</p>
          <div class="prop-modal-features" id="propModalFeatures"></div>
        </div>
        <div class="prop-modal-sidebar">
          <h3>Request a Private Viewing</h3>
          <p>Strictly by appointment for pre-qualified individuals. Our advisors will contact you within 4 hours.</p>
          <form id="propModalForm" onsubmit="return window.propModalSubmit(event)">
            <div class="prop-modal-form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="Your name" required />
            </div>
            <div class="prop-modal-form-group">
              <label>Email Address *</label>
              <input type="email" placeholder="you@example.com" required />
            </div>
            <div class="prop-modal-form-group">
              <label>Phone Number *</label>
              <input type="tel" placeholder="+971 50 123 4567" required />
            </div>
            <div class="prop-modal-form-group">
              <label>Preferred Date</label>
              <input type="date" style="color-scheme: dark;" />
            </div>
            <div class="prop-modal-form-group">
              <label>Message (Optional)</label>
              <textarea placeholder="Any specific requirements, questions, or floorplan requests..."></textarea>
            </div>
            <button type="submit" class="btn btn-solid" style="width:100%;justify-content:center;margin-top:8px;">
              <span>Request Viewing</span>
            </button>
          </form>
          <div class="prop-modal-divider"></div>
          <button type="button" class="btn" style="width:100%;justify-content:center;" onclick="window.print()">
            <span>Download Brochure</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    document.getElementById('propModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // Prev / Next Lightbox Controls
    document.getElementById('propModalPrev').addEventListener('click', (e) => {
      e.stopPropagation();
      setModalImage(modalActiveIndex - 1);
    });
    document.getElementById('propModalNext').addEventListener('click', (e) => {
      e.stopPropagation();
      setModalImage(modalActiveIndex + 1);
    });

    // Action button scrolls to sidebar form
    document.getElementById('propModalScrollViewingBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const sidebar = document.querySelector('.prop-modal-sidebar');
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sidebar.querySelector('input[type="text"]')?.focus();
      }
    });

    // Request floorplan button pre-fills form message
    document.getElementById('propModalRequestFloorplanBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const textarea = document.querySelector('#propModalForm textarea');
      const curTitle = window.currentViewingProperty?.title || 'this property';
      if (textarea) {
        textarea.value = `Requesting architectural floorplans, private investment dossier, and pricing breakdown for ${curTitle}.`;
      }
      const sidebar = document.querySelector('.prop-modal-sidebar');
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sidebar.querySelector('input[type="text"]')?.focus();
      }
    });

    // Keyboard navigation (Esc to close, Left/Right arrows to cycle)
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') setModalImage(modalActiveIndex - 1);
      if (e.key === 'ArrowRight') setModalImage(modalActiveIndex + 1);
    });

    // Touch Swipe on mobile hero
    let touchStartX = 0;
    const heroEl = document.getElementById('propModalHero');
    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 45) {
        setModalImage(modalActiveIndex + 1);
      } else if (touchEndX - touchStartX > 45) {
        setModalImage(modalActiveIndex - 1);
      }
    }, { passive: true });
  }

  function closeModal() {
    const overlay = document.getElementById('propModal');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.scrollTop = 0; }, 350);
  }
  window.closePropertyModal = closeModal;

  // ── Lead Form Handler ────────────────────────────────────────
  window.propModalSubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = '<span>Requesting Viewing…</span>';
      btn.disabled = true;
    }

    const name = form.querySelector('input[type="text"]')?.value || 'Private Client';
    const email = form.querySelector('input[type="email"]')?.value || '';
    const phone = form.querySelector('input[type="tel"]')?.value || '';
    const date = form.querySelector('input[type="date"]')?.value || '';
    const msg = form.querySelector('textarea')?.value || '';

    const curProp = window.currentViewingProperty;
    const propTitle = curProp?.title || document.getElementById('propModalTitle')?.textContent || 'Exclusive Listing';
    const propId = curProp?.id || window.currentViewingPropertyId || null;

    const notes = [
      `[Property: ${propTitle}${propId ? ` (ID: ${propId})` : ''}]`,
      date ? `Preferred Viewing Date: ${date}` : null,
      msg ? `Client Message: ${msg}` : null,
    ].filter(Boolean).join(' | ');

    try {
      if (window.BeyondBloomSupabase && typeof window.BeyondBloomSupabase.submitLead === 'function') {
        await window.BeyondBloomSupabase.submitLead({
          client_name: name,
          client_email: email,
          client_phone: phone,
          property_id: propId,
          source: 'private_viewing',
          notes: notes,
        });
      }

      if (btn) {
        btn.innerHTML = '<span>Viewing Requested ✓</span>';
        btn.style.background = 'rgba(82,192,122,0.2)';
        btn.style.borderColor = '#52c07a';
        btn.style.color = '#52c07a';
      }

      setTimeout(() => {
        if (btn) {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.disabled = false;
        }
        form.reset();
        closeModal();
      }, 2200);
    } catch (err) {
      console.warn('Modal lead submission notice:', err);
      if (btn) {
        btn.innerHTML = '<span>Viewing Requested ✓</span>';
      }
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = orig;
          btn.disabled = false;
        }
        form.reset();
        closeModal();
      }, 2000);
    }
    return false;
  };

  // ── Populate and open modal ──────────────────────────────────
  function openModal(data) {
    buildModal();
    const overlay = document.getElementById('propModal');
    if (!overlay) return;

    const norm = normalizeProperty(data);
    window.currentViewingProperty = norm;
    window.currentViewingPropertyId = norm.id || null;

    // Photos list
    modalImagesList = norm.gallery && norm.gallery.length ? norm.gallery : ['images/prop_dubai_penthouse.jpg'];
    modalActiveIndex = 0;

    // Badge
    const badge = document.getElementById('propModalBadge');
    if (norm.badge) {
      badge.textContent = norm.badge;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }

    // Thumbnails
    const thumbsEl = document.getElementById('propModalThumbs');
    thumbsEl.innerHTML = '';
    if (modalImagesList.length > 1) {
      thumbsEl.style.display = 'flex';
      modalImagesList.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'prop-modal-thumb' + (i === 0 ? ' active' : '');
        img.alt = `View photo ${i + 1}`;
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          setModalImage(i);
        });
        thumbsEl.appendChild(img);
      });
    } else {
      thumbsEl.style.display = 'none';
    }

    // Set initial hero photo
    setModalImage(0);

    // Text content
    document.getElementById('propModalPrice').textContent = norm.price || 'Price on Application';
    document.getElementById('propModalTitle').textContent = norm.title || 'Luxury Residence';
    document.getElementById('propModalLocation').textContent = norm.location || 'Dubai, UAE';

    // Specs
    const specsEl = document.getElementById('propModalSpecs');
    specsEl.innerHTML = (norm.specs || []).map(s => `
      <div class="prop-modal-spec">
        <strong>${s.val}</strong>
        <span>${s.label}</span>
      </div>
    `).join('');

    // 3D Tour Link if available
    const tourWrap = document.getElementById('propModalTourWrap');
    if (tourWrap) {
      if (norm.tour_3d_url) {
        tourWrap.style.display = 'block';
        tourWrap.innerHTML = `
          <a href="${norm.tour_3d_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm tour-3d-btn" style="display:inline-flex;align-items:center;gap:8px;font-size:11px;">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
            <span>Experience 3D Virtual Tour ↗</span>
          </a>
        `;
      } else {
        tourWrap.style.display = 'none';
        tourWrap.innerHTML = '';
      }
    }

    // Description (support \n\n)
    const descText = norm.description || norm.desc || 'Contact Beyond Bloom for the private dossier and floorplans.';
    document.getElementById('propModalDesc').innerHTML = descText
      .split('\n\n')
      .filter(Boolean)
      .map(p => `<p style="margin-bottom:18px;">${p}</p>`)
      .join('');

    // Features
    const featEl = document.getElementById('propModalFeatures');
    featEl.innerHTML = (norm.features || []).map(f =>
      `<div class="prop-modal-feature">${f}</div>`
    ).join('');

    // Reset form
    document.getElementById('propModalForm')?.reset();

    // Show
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
  }
  window.openPropertyModal = openModal;

  // ── Extract data from a card DOM element ─────────────────────
  function extractFromCard(card) {
    const titleEl = card.querySelector('.card-title, .gc__title, .dev-card-title, h2, h3');
    const priceEl = card.querySelector('.card-price, .gc__price, .dev-card-price');
    const locationEl = card.querySelector('.card-location, .gc__location, .dev-card-loc');
    const badgeEl = card.querySelector('.card-badge, .gc__badge, .dev-card-status');
    const specEls = card.querySelectorAll('.card-spec, .gc__spec, .dev-card-meta span');

    const title = titleEl ? titleEl.textContent.trim() : '';
    const price = priceEl ? priceEl.textContent.trim() : '';
    const location = locationEl ? locationEl.textContent.trim().replace(/·/g, '·') : '';
    const badge = badgeEl ? badgeEl.textContent.trim() : null;

    const specs = [];
    specEls.forEach(el => {
      const strong = el.querySelector('strong');
      if (strong) {
        specs.push({
          val: strong.textContent.trim(),
          label: el.textContent.replace(strong.textContent, '').trim()
        });
      }
    });

    const images = [];
    if (card.dataset.images) {
      try {
        const parsed = JSON.parse(decodeURIComponent(card.dataset.images));
        if (Array.isArray(parsed)) parsed.forEach(u => { if (u && !images.includes(u)) images.push(u); });
      } catch (e) {
        try {
          const parsed = JSON.parse(card.dataset.images);
          if (Array.isArray(parsed)) parsed.forEach(u => { if (u && !images.includes(u)) images.push(u); });
        } catch (_) {}
      }
    }
    const imgEls = card.querySelectorAll('.card-carousel img, .card-image img, .gc__img, .dev-card-img, img');
    imgEls.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !images.includes(src)) images.push(src);
    });

    return { title, price, location, badge, specs, images };
  }

  // ── Document-Level Event Delegation ──────────────────────────
  function setupEventDelegation() {
    if (window._bbPropertyDelegationInitialized) return;
    window._bbPropertyDelegationInitialized = true;

    document.addEventListener('click', (e) => {
      // 1. Skip if clicking mini-carousel navigation inside card
      if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-dots')) return;

      // 2. Skip if clicking external links
      if (e.target.closest('a[target="_blank"]') || e.target.closest('.tour-3d-btn')) return;

      // 3. Find if click happened inside a property card
      const card = e.target.closest('.card, .gc, .dev-full-card, .dev-card, [data-property-id]');
      if (!card) return;

      // 4. Ignore clicks inside modal itself or admin dashboard table
      if (card.closest('#propModal') || card.closest('.admin-layout') || card.closest('table')) return;

      // 5. If card is or contains an <a> tag (like .gc with href="listings.html"), prevent page reload!
      e.preventDefault();
      e.stopPropagation();

      const clickedId = card.dataset.propertyId;
      const clickedSlug = card.dataset.propertySlug;
      const extracted = extractFromCard(card);

      // Search cached Supabase properties first
      let supabaseMatch = null;
      const pMap = window.BeyondBloomSupabase?.propertiesMap;
      if (pMap) {
        if (clickedId && pMap.has(String(clickedId))) {
          supabaseMatch = pMap.get(String(clickedId));
        } else if (clickedSlug && pMap.has(String(clickedSlug).toLowerCase())) {
          supabaseMatch = pMap.get(String(clickedSlug).toLowerCase());
        } else if (extracted.title && pMap.has(extracted.title.toLowerCase().trim())) {
          supabaseMatch = pMap.get(extracted.title.toLowerCase().trim());
        }
      }

      if (!supabaseMatch && Array.isArray(window.BeyondBloomSupabase?.properties)) {
        supabaseMatch = window.BeyondBloomSupabase.properties.find(p => {
          if (clickedId && String(p.id) === String(clickedId)) return true;
          if (clickedSlug && p.slug && String(p.slug).toLowerCase() === String(clickedSlug).toLowerCase()) return true;
          if (extracted.title && p.title && p.title.toLowerCase().trim() === extracted.title.toLowerCase().trim()) return true;
          return false;
        });
      }

      // Check static catalogue
      const staticDef = PROPERTY_DATA[extracted.title] || PROPERTY_DATA[supabaseMatch?.title] || {};

      // Merge data with safe fallbacks
      const merged = {
        ...staticDef,
        ...extracted,
        ...(supabaseMatch || {}),
        id: supabaseMatch?.id || clickedId || card.dataset.propertyId || null,
      };

      if (extracted.images && extracted.images.length && (!supabaseMatch?.gallery_urls || !supabaseMatch.gallery_urls.length)) {
        merged.gallery_urls = extracted.images;
      }

      const normalized = normalizeProperty(merged);
      openModal(normalized);
    }, false);
  }

  // ── Init ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildModal();
      setupEventDelegation();
    });
  } else {
    buildModal();
    setupEventDelegation();
  }
})();
