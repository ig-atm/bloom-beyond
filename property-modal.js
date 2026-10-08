// ================================================================
//  BEYOND BLOOM — Property Detail Modal
//  Reads data from .card elements and renders a full-screen modal
// ================================================================

(function () {
  // ── Property data store (extend as needed) ───────────────────
  // Keyed by card title text. Falls back to generic copy if not found.
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
      badge: null,
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
    'Monaco Sky Penthouse': {
      badge: 'New',
      price: '€ 22,500,000',
      title: 'Monaco Sky Penthouse',
      location: 'Monte Carlo, Monaco',
      specs: [
        { val: '4',     label: 'Bedrooms' },
        { val: '5',     label: 'Bathrooms' },
        { val: '6,400', label: 'Sq Ft' },
      ],
      desc: `A rare opportunity to acquire a sky-level residence in the Principality of Monaco, the world's second-smallest sovereign state and its most densely packed concentration of ultra-high-net-worth individuals.\n\nThis full-floor penthouse commands views across the harbour of Monte Carlo, the Grimaldi Palace, and the turquoise Mediterranean beyond. A private rooftop terrace of 1,800 sq ft provides a spectacular setting for entertaining against the backdrop of the Grand Prix circuit.\n\nMonaco's favourable tax environment, combined with the exceptional quality of this residence, makes this one of the most compelling investment propositions in European luxury real estate.`,
      features: [
        'Harbour & Palace Views', '1,800 Sq Ft Roof Terrace', 'Zero Income Tax', 'F1 Circuit Views',
        'Private Elevator', '24-Hour Security', 'Concierge Service', 'Cellar & Storage',
        'Parking for 2 Cars', 'Smart Home System', 'Sea-View Master Suite', 'Guest Suite',
      ],
      images: ['images/listing_penthouse.jpg', 'images/listing_villa.jpg', 'images/listing_skyhouse.jpg'],
    },
    'Ocean Manor': {
      badge: 'Rare',
      price: '$67,000,000',
      title: 'Ocean Manor',
      location: 'Southampton, The Hamptons',
      specs: [
        { val: '12',     label: 'Bedrooms' },
        { val: '14',     label: 'Bathrooms' },
        { val: '28,000', label: 'Sq Ft' },
        { val: '4.2 acres', label: 'Ocean Front' },
      ],
      desc: `Positioned on 4.2 acres of oceanfront in Southampton, Ocean Manor represents the pinnacle of East Coast luxury. Designed by a celebrated architect as a singular private commission, every element of this estate reflects the very highest standards of craftsmanship and design.\n\nThe main residence spans 28,000 square feet across three floors, with a sweeping ocean terrace, two heated pools, a regulation-size tennis court, and a private beach path. The lower level is dedicated entirely to entertainment — featuring a cinema, bowling alley, professional-grade bar, and a 3,000-bottle wine vault.\n\nA separate guest house, staff cottage, and eight-car garage complete the estate. This is amongst the finest oceanfront estates ever to come to market in The Hamptons.`,
      features: [
        '4.2 Acres Oceanfront', 'Private Beach Access', 'Two Heated Pools', 'Tennis Court',
        'Home Cinema', 'Bowling Alley', '3,000-Bottle Wine Vault', 'Professional Bar',
        'Guest House', 'Staff Cottage', '8-Car Garage', 'Ocean-View Terraces',
      ],
      images: ['images/listing_villa.jpg', 'images/listing_skyhouse.jpg', 'images/listing_penthouse.jpg'],
    },
    'Aegean Crown Villa': {
      badge: null,
      price: '€ 15,800,000',
      title: 'Aegean Crown Villa',
      location: 'Oia, Santorini',
      specs: [
        { val: '5',     label: 'Bedrooms' },
        { val: '6',     label: 'Bathrooms' },
        { val: '5,600', label: 'Sq Ft' },
      ],
      desc: `Perched on the volcanic caldera cliffs of Oia, the most photographed village on earth, Aegean Crown Villa is a celebration of Cycladic architecture at the very highest level. Carved directly into the clifftop, the villa cascades down the caldera wall through a series of terraces, each offering unobstructed views of the famous Santorini sunset and the caldera below.\n\nThe property features an infinity pool that appears to merge with the Aegean Sea, a traditional cave cellar, and bespoke interiors that weave local stone, hand-crafted ceramics, and contemporary furnishings into a seamless whole.\n\nThis is one of only a handful of private villas in Oia of this scale and calibre, representing an exceptionally rare acquisition opportunity.`,
      features: [
        'Caldera Cliff Position', 'Sunset & Caldera Views', 'Infinity Pool', 'Cave Wine Cellar',
        'Hand-Crafted Ceramics', 'Local Stone Interiors', 'Multiple Terrace Levels', 'Private Entrance',
        'Outdoor Dining Terrace', 'Master Caldera Suite', 'Guest Suites', 'Concierge Service',
      ],
      images: ['images/listing_villa.jpg', 'images/listing_penthouse.jpg', 'images/listing_skyhouse.jpg'],
    },
    // Off-plan defaults
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
      desc: `Rising 92 floors above Downtown Dubai, The Elysian Tower is a masterwork of contemporary architecture that will redefine the city's skyline upon completion in 2027. Each residence occupies a full floor or half-floor, ensuring unrivalled privacy and views that span the Burj Khalifa, the Desert, and the Arabian Gulf.\n\nResidents will benefit from an unprecedented amenity collection — including sky gardens at three levels, a cantilevered infinity pool at level 72, a ESPA spa, a members' club, and a Michelin-starred restaurant operated by a globally renowned chef.\n\nWith construction now 40% complete and a developer track record of 14 delivered projects across the Gulf, The Elysian Tower represents the most compelling off-plan investment opportunity in Dubai today.`,
      features: [
        'Full & Half-Floor Residences', 'Burj Khalifa Views', 'Sky Gardens (3 Levels)', 'Level-72 Infinity Pool',
        'ESPA Spa', 'Members\' Club', 'Michelin-Star Restaurant', 'Private Cinema',
        '2027 Completion', 'Payment Plan Available', 'Capital Growth Projection', 'Golden Visa Eligible',
      ],
      images: ['images/listing_skyhouse.jpg', 'images/listing_penthouse.jpg', 'images/listing_villa.jpg'],
    },
    // Commercial properties
    'One Meridian Tower': {
      badge: 'Trophy Asset',
      price: '£ 420,000,000',
      title: 'One Meridian Tower',
      location: 'Canary Wharf, London',
      specs: [
        { val: '42',      label: 'Floors' },
        { val: '980,000', label: 'Sq Ft GIA' },
        { val: '4.8%',    label: 'Net Yield' },
        { val: '2019',    label: 'Built' },
      ],
      desc: `A landmark 42-storey Grade A office tower commanding the Canary Wharf skyline. Fully leased to blue-chip financial institutions including two global investment banks and a sovereign wealth fund, with a weighted average lease expiry (WALE) of 11.2 years.\n\nThe building has achieved BREEAM Outstanding certification and EPC A rating, positioning it at the forefront of the ESG investment agenda. Floor plates of up to 32,000 sq ft NIA are among the largest and most efficient in London, offering occupiers genuine flexibility.\n\nThe investment is offered at a net initial yield of 4.8% — representing a compelling entry point into prime London office investment at current market pricing.`,
      features: [
        'Grade A Tower', 'BREEAM Outstanding', 'EPC A Rating', '11.2 Years WALE',
        '32,000 Sq Ft Floor Plates', 'Blue-Chip Tenants', 'Trophy Location', 'Concierge Lobby',
        '£38M Net Income', 'Structured Finance Available', 'ESG Compliant', 'Business Rates Allowances',
      ],
      images: ['images/listing_skyhouse.jpg', 'images/listing_penthouse.jpg', 'images/listing_villa.jpg'],
    },
    'New Bond Street Flagship': {
      badge: 'Flagship Retail',
      price: '£ 95,000,000',
      title: 'New Bond Street Flagship',
      location: 'Mayfair, London',
      specs: [
        { val: '6',      label: 'Floors' },
        { val: '18,400', label: 'Sq Ft' },
        { val: '5.1%',   label: 'Yield' },
      ],
      desc: `A rare freehold retail investment on New Bond Street — consistently ranked among the world's most expensive and prestigious retail addresses. The building, tenanted by a global luxury maison on a 15-year lease, offers investors long-term, inflation-linked income from one of the world's most irreplaceable retail pitches.\n\nThe property spans six floors including basement storage and upper-floor offices, with a distinctive double-height ground floor frontage directly opposite one of London's most iconic intersections.\n\nNew Bond Street has demonstrated exceptional rental resilience through multiple economic cycles, underpinned by structurally limited supply and relentlessly strong demand from the world's leading luxury brands.`,
      features: [
        'New Bond Street Freehold', 'Luxury Brand Tenant', '15-Year Lease', 'Inflation-Linked Rent Reviews',
        'Double-Height Frontage', 'Basement Storage', 'Upper Floor Offices', 'Trophy Retail Pitch',
        'Planning Permissions Available', 'Rare Freehold Availability', 'Long WALE', 'Institutional Grade',
      ],
      images: ['images/listing_penthouse.jpg', 'images/listing_skyhouse.jpg', 'images/listing_villa.jpg'],
    },
  };

  // ── Build modal HTML ─────────────────────────────────────────
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.className = 'prop-modal-overlay';
    overlay.id = 'propModal';
    overlay.innerHTML = `
      <button class="prop-modal-close" id="propModalClose" aria-label="Close property details">✕</button>
      <div class="prop-modal-hero" id="propModalHero">
        <img id="propModalHeroImg" src="" alt="" />
        <div class="prop-modal-hero-badge" id="propModalBadge"></div>
        <div class="prop-modal-thumbs" id="propModalThumbs"></div>
      </div>
      <div class="prop-modal-body">
        <div class="prop-modal-narrative">
          <div class="prop-modal-price" id="propModalPrice"></div>
          <div class="prop-modal-title" id="propModalTitle"></div>
          <div class="prop-modal-location" id="propModalLocation"></div>
          <div class="prop-modal-specs" id="propModalSpecs"></div>
          <div class="prop-modal-desc" id="propModalDesc"></div>
          <div class="gold-rule" style="margin-bottom: 28px;"></div>
          <p class="label" style="margin-bottom: 16px;">Property Highlights</p>
          <div class="prop-modal-features" id="propModalFeatures"></div>
        </div>
        <div class="prop-modal-sidebar">
          <h3>Request a Private Viewing</h3>
          <p>Strictly by appointment for pre-qualified individuals. Our advisors will contact you within 4 hours.</p>
          <form id="propModalForm" onsubmit="return propModalSubmit(event)">
            <div class="prop-modal-form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your name" required />
            </div>
            <div class="prop-modal-form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" required />
            </div>
            <div class="prop-modal-form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 000 000 0000" />
            </div>
            <div class="prop-modal-form-group">
              <label>Preferred Date</label>
              <input type="date" style="color-scheme: dark;" />
            </div>
            <div class="prop-modal-form-group">
              <label>Message (Optional)</label>
              <textarea placeholder="Any specific requirements or questions..."></textarea>
            </div>
            <button type="submit" class="btn btn-solid" style="width:100%;justify-content:center;margin-top:8px;">
              <span>Request Viewing</span>
            </button>
          </form>
          <div class="prop-modal-divider"></div>
          <button class="btn" style="width:100%;justify-content:center;" onclick="window.print()">
            <span>Download Brochure</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    document.getElementById('propModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  function closeModal() {
    const overlay = document.getElementById('propModal');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.scrollTop = 0; }, 400);
  }

  window.propModalSubmit = function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Request Sent ✓</span>';
    btn.style.background = 'rgba(201,169,110,0.2)';
    btn.style.borderColor = 'var(--gold)';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      closeModal();
    }, 3000);
    return false;
  };

  // ── Populate and open modal ──────────────────────────────────
  function openModal(data, cardImages) {
    const overlay = document.getElementById('propModal');
    if (!overlay) return;

    // Images: use data.images, falling back to images grabbed from the card
    const images = (data.images && data.images.length) ? data.images : cardImages;

    // Hero image
    const heroImg = document.getElementById('propModalHeroImg');
    heroImg.src = images[0] || '';
    heroImg.alt = data.title || '';

    // Badge
    const badge = document.getElementById('propModalBadge');
    if (data.badge) {
      badge.textContent = data.badge;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }

    // Thumbnails
    const thumbsEl = document.getElementById('propModalThumbs');
    thumbsEl.innerHTML = '';
    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'prop-modal-thumb' + (i === 0 ? ' active' : '');
      img.alt = `View ${i + 1}`;
      img.addEventListener('click', () => {
        heroImg.style.opacity = '0';
        setTimeout(() => { heroImg.src = src; heroImg.style.opacity = '1'; }, 200);
        thumbsEl.querySelectorAll('.prop-modal-thumb').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
      });
      thumbsEl.appendChild(img);
    });

    // Text content
    document.getElementById('propModalPrice').textContent = data.price || '';
    document.getElementById('propModalTitle').textContent = data.title || '';
    document.getElementById('propModalLocation').textContent = data.location || '';

    // Specs
    const specsEl = document.getElementById('propModalSpecs');
    specsEl.innerHTML = (data.specs || []).map(s => `
      <div class="prop-modal-spec">
        <strong>${s.val}</strong>
        <span>${s.label}</span>
      </div>
    `).join('');

    // Description (support \n)
    document.getElementById('propModalDesc').innerHTML =
      (data.desc || 'A rare and extraordinary property. Contact us for full details.')
        .split('\n\n').map(p => `<p style="margin-bottom:18px;">${p}</p>`).join('');

    // Features
    const featEl = document.getElementById('propModalFeatures');
    featEl.innerHTML = (data.features || []).map(f =>
      `<div class="prop-modal-feature">${f}</div>`
    ).join('');

    // Reset form
    document.getElementById('propModalForm')?.reset();

    // Show
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
  }

  // ── Extract data from a card DOM element ─────────────────────
  function extractFromCard(card) {
    const titleEl = card.querySelector('.card-title');
    const priceEl = card.querySelector('.card-price');
    const locationEl = card.querySelector('.card-location');
    const badgeEl = card.querySelector('.card-badge');
    const specEls = card.querySelectorAll('.card-spec');
    const imgEls = card.querySelectorAll('.card-carousel img, .card-image img');

    const title = titleEl ? titleEl.textContent.trim() : '';
    const price = priceEl ? priceEl.textContent.trim() : '';
    const location = locationEl ? locationEl.textContent.trim() : '';
    const badge = badgeEl ? badgeEl.textContent.trim() : null;

    const specs = [];
    specEls.forEach(el => {
      const strong = el.querySelector('strong');
      if (strong) {
        specs.push({ val: strong.textContent.trim(), label: el.textContent.replace(strong.textContent, '').trim() });
      }
    });

    const images = [];
    imgEls.forEach(img => { if (img.src && !images.includes(img.src)) images.push(img.src); });

    return { title, price, location, badge, specs, images };
  }

  // ── Wire up all cards ────────────────────────────────────────
  function attachCardListeners() {
    document.querySelectorAll('.card').forEach(card => {
      if (card.dataset.modalWired) return;
      card.dataset.modalWired = 'true';

      card.addEventListener('click', (e) => {
        // Don't open modal if clicking carousel buttons or btn-arrow
        if (e.target.closest('.carousel-btn') || e.target.closest('.btn-arrow') || e.target.closest('button')) return;

        const cardData = extractFromCard(card);
        const stored = PROPERTY_DATA[cardData.title] || {};

        // Merge: stored data takes priority, card data fills missing fields
        const finalData = {
          badge:    stored.badge    !== undefined ? stored.badge    : cardData.badge,
          price:    stored.price    || cardData.price,
          title:    stored.title    || cardData.title,
          location: stored.location || cardData.location,
          specs:    (stored.specs && stored.specs.length) ? stored.specs : cardData.specs,
          desc:     stored.desc     || null,
          features: stored.features || [],
          images:   (stored.images  && stored.images.length) ? stored.images : cardData.images,
        };

        openModal(finalData, cardData.images);
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    buildModal();
    attachCardListeners();

    // Re-wire if new cards are added dynamically
    const observer = new MutationObserver(() => attachCardListeners());
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
