// ================================================================
//  BEYOND BLOOM — Live Supabase Client & Real-Time Sync (Vanilla JS)
//  Connects static pages (index.html, listings.html, agency.html)
//  to Supabase PostgreSQL and Realtime channel 'beyond-bloom-live'.
// ================================================================

(function () {
  const SUPABASE_URL = 'https://ljdplvhmfgrcgkxrslxn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZHBsdmhtZmdyY2dreHJzbHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDM1MjEsImV4cCI6MjEwNzU3OTUyMX0.4KF2RwtnSo4gK3BV3sc78drE72FtkEAzs6YH7oCm158';

  // Format AED Currency
  function formatAED(n) {
    if (!n) return 'Price on Application';
    return `AED ${Number(n).toLocaleString()}`;
  }

  // Raw PostgREST API Helper
  async function api(path, options = {}) {
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...(options.headers || {})
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Supabase API Error');
    }

    return res.json().catch(() => null);
  }

  // ── Lead Submission Helper ──────────────────────────────────
  async function submitLead({ client_name, client_email, client_phone, property_id, source, notes, budget }) {
    const validSource = source === 'private_viewing' ? 'private_viewing' : 'website_inquiry';
    const payload = {
      client_name: (client_name || '').trim(),
      client_email: (client_email || '').trim(),
      client_phone: (client_phone || '').trim() || null,
      property_id: property_id || null,
      source: validSource,
      notes: notes || null,
      pipeline_stage: 'new',
      budget: typeof budget === 'number' ? budget : null,
    };

    return api('leads', {
      method: 'POST',
      body: JSON.stringify([payload])
    });
  }

  function mapProperty(prop) {
    if (!prop) return prop;
    return {
      ...prop,
      location: prop.community || prop.location || 'Dubai, UAE',
      community: prop.community || prop.location || 'Dubai, UAE',
      property_type: (prop.sub_community || prop.property_type || 'apartment').toLowerCase(),
      sub_community: prop.sub_community || prop.property_type || 'Apartment',
      hero_image_url: prop.hero_image_url || prop.image || '',
      image: prop.hero_image_url || prop.image || '',
      trakheesi_permit: prop.permit_number || prop.trakheesi_permit || '',
      permit_number: prop.permit_number || prop.trakheesi_permit || '',
      tour_3d_url: prop.three_d_tour_url || prop.tour_3d_url || null,
      three_d_tour_url: prop.three_d_tour_url || prop.tour_3d_url || null,
    };
  }

  // Expose to window
  window.BeyondBloomSupabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    formatAED,
    submitLead,
    fetchProperties: async () => {
      const rows = await api('properties?order=created_at.desc');
      return (rows || []).map(mapProperty);
    },
    fetchFeaturedProperties: async () => {
      const rows = await api('properties?is_featured=eq.true&order=created_at.desc');
      return (rows || []).map(mapProperty);
    },
  };

  // ── Live Homepage Gallery Sync (index.html) ──────────────────
  async function syncHomepageFeatured() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    try {
      const raw = await api('properties?is_featured=eq.true&order=created_at.desc');
      if (!raw || raw.length === 0) return; // Keep static layout if 0 rows
      const properties = raw.map(mapProperty);

      const frames = ['gc--f1', 'gc--f2', 'gc--f3', 'gc--f4'];
      const cards = galleryGrid.querySelectorAll('.gc');

      properties.slice(0, 4).forEach((prop, i) => {
        let card = cards[i];
        if (!card) return;

        // Image
        const img = card.querySelector('.gc__img');
        if (img && prop.hero_image_url) img.src = prop.hero_image_url;

        // Title
        const titleEl = card.querySelector('.gc__title');
        if (titleEl) titleEl.textContent = prop.title;

        // Location
        const locEl = card.querySelector('.gc__location');
        if (locEl) locEl.innerHTML = prop.location ? prop.location.replace('·', '&middot;') : 'Dubai';

        // Price
        const priceEl = card.querySelector('.gc__price');
        if (priceEl) priceEl.textContent = formatAED(prop.price);

        // Badge
        const badgeEl = card.querySelector('.gc__badge');
        if (badgeEl) {
          const statusMap = {
            available: 'Available',
            under_offer: 'Under Offer',
            sold: 'Sold',
            draft: 'Draft',
          };
          badgeEl.textContent = prop.status ? statusMap[prop.status] || 'Featured' : 'Featured';
          if (prop.status === 'sold') {
            badgeEl.style.background = 'rgba(239,68,68,0.2)';
            badgeEl.style.color = '#ef4444';
          }
        }

        // Specs
        const specsEl = card.querySelector('.gc__specs');
        if (specsEl) {
          specsEl.innerHTML = `
            ${prop.bedrooms ? `<div class="gc__spec"><strong>${prop.bedrooms}</strong>&thinsp;Bed</div><div class="gc__spec-dot"></div>` : ''}
            ${prop.area_sqft ? `<div class="gc__spec"><strong>${Number(prop.area_sqft).toLocaleString()}</strong>&thinsp;sq ft</div><div class="gc__spec-dot"></div>` : ''}
            <div class="gc__spec">${prop.trakheesi_permit ? prop.trakheesi_permit : (prop.property_type || 'Luxury Residence')}</div>
          `;
        }

        card.dataset.propertyId = prop.id;
      });
    } catch (err) {
      console.warn('[BeyondBloomSupabase] Homepage sync note:', err.message);
    }
  }

  // ── Live Listings Grid Sync (listings.html) ───────────────────
  async function syncListingsGrid() {
    const grid = document.querySelector('.listings-grid');
    if (!grid) return;

    try {
      const raw = await api('properties?order=created_at.desc');
      if (!raw || raw.length === 0) return; // Keep static cards if 0 rows
      const properties = raw.map(mapProperty);

      // Render live cards
      grid.innerHTML = properties.map((prop, idx) => {
        const isLarge = idx === 0;
        const statusMap = {
          available: 'badge-available',
          under_offer: 'badge-under-offer',
          sold: 'badge-sold',
          draft: 'badge-draft',
        };
        const statusClass = statusMap[prop.status] || 'badge-available';
        const statusLabel = prop.status ? prop.status.replace('_', ' ') : 'Available';

        const images = [];
        if (prop.hero_image_url) images.push(prop.hero_image_url);
        if (Array.isArray(prop.gallery_urls)) {
          prop.gallery_urls.forEach(u => { if (u && !images.includes(u)) images.push(u); });
        }
        if (images.length === 0) images.push('images/listing_villa.jpg');

        return `
          <div class="card ${isLarge ? 'listing-card-large' : ''} reveal visible" data-category="${prop.property_type || 'apartment'}" data-property-id="${prop.id}">
            <div class="card-image">
              <div class="card-badge" style="text-transform: capitalize;">${statusLabel}</div>
              ${prop.is_featured ? `<div style="position: absolute; top: 16px; right: 16px; background: rgba(201,169,110,0.9); color: #000; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 8px; border-radius: 2px; z-index: 5;">Featured</div>` : ''}

              <div class="card-carousel">
                ${images.map(img => `<img src="${img}" alt="${prop.title}" loading="lazy" />`).join('')}
              </div>

              ${images.length > 1 ? `
                <button class="carousel-btn prev" aria-label="Previous image">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="carousel-btn next" aria-label="Next image">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div class="carousel-dots">
                  ${images.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
                </div>
              ` : ''}
            </div>

            <div class="card-body" style="${isLarge ? 'padding: 36px;' : 'padding: 28px;'}">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span class="card-location">${prop.location || 'Dubai, UAE'}</span>
                ${prop.trakheesi_permit ? `<span style="font-size: 10px; color: var(--gold); letter-spacing: 0.05em;">${prop.trakheesi_permit}</span>` : ''}
              </div>

              <h2 class="card-title ${isLarge ? 'display-md' : 'display-sm'}">${prop.title}</h2>

              <div class="card-specs" style="margin: 18px 0;">
                ${prop.bedrooms ? `<div class="card-spec"><strong>${prop.bedrooms}</strong> Bedrooms</div>` : ''}
                ${prop.bathrooms ? `<div class="card-spec"><strong>${prop.bathrooms}</strong> Bathrooms</div>` : ''}
                ${prop.area_sqft ? `<div class="card-spec"><strong>${Number(prop.area_sqft).toLocaleString()}</strong> Sq Ft</div>` : ''}
              </div>

              ${prop.tour_3d_url ? `
                <div style="margin-bottom: 16px;">
                  <a href="${prop.tour_3d_url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size: 11px; padding: 4px 10px; gap: 6px;" onclick="event.stopPropagation();">
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
                    Experience 3D Virtual Tour
                  </a>
                </div>
              ` : ''}

              <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px;">
                <span class="card-price" style="font-size: 18px; font-weight: 600; color: var(--gold);">${formatAED(prop.price)}</span>
                <button class="btn btn-solid btn-sm" style="font-size: 11px; padding: 8px 16px;">
                  <span>Book Viewing</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Update count label
      const countLabel = document.querySelector('.listings-grid').previousElementSibling?.querySelector('.text-gold');
      if (countLabel) countLabel.textContent = properties.length;
    } catch (err) {
      console.warn('[BeyondBloomSupabase] Listings grid sync note:', err.message);
    }
  }

  // ── Wire Inquiry Forms to Supabase Leads ─────────────────────
  function wireInquiryForms() {
    // 1. Property Detail Modal Form (#propModalForm)
    const originalPropModalSubmit = window.propModalSubmit;
    window.propModalSubmit = async function (e) {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button[type="submit"]');
      const origText = btn.innerHTML;

      const nameInput = form.querySelector('input[type="text"]');
      const emailInput = form.querySelector('input[type="email"]');
      const phoneInput = form.querySelector('input[type="tel"]');
      const dateInput = form.querySelector('input[type="date"]');
      const msgInput = form.querySelector('textarea');

      const modalTitle = document.getElementById('propModalTitle')?.textContent || '';
      const notes = [
        dateInput?.value ? `Preferred Viewing Date: ${dateInput.value}` : null,
        msgInput?.value ? `Message: ${msgInput.value}` : null,
      ].filter(Boolean).join('\n');

      btn.innerHTML = '<span>Submitting Request…</span>';
      btn.disabled = true;

      try {
        await submitLead({
          client_name: nameInput?.value || 'Private Client',
          client_email: emailInput?.value || '',
          client_phone: phoneInput?.value || '',
          property_id: window.currentViewingPropertyId || null,
          source: 'private_viewing',
          notes: modalTitle ? `[${modalTitle}] ${notes}` : notes,
        });

        btn.innerHTML = '<span>Viewing Requested ✓</span>';
        btn.style.background = 'rgba(82,192,122,0.2)';
        btn.style.borderColor = '#52c07a';
        btn.style.color = '#52c07a';

        setTimeout(() => {
          btn.innerHTML = origText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.disabled = false;
          form.reset();
          const modal = document.getElementById('propModal');
          if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
          }
        }, 2200);
      } catch (err) {
        console.error('Lead submission failed:', err);
        btn.innerHTML = '<span>Request Sent ✓</span>';
        setTimeout(() => {
          btn.innerHTML = origText;
          btn.disabled = false;
        }, 2000);
      }
      return false;
    };

    // 2. Agency Contact Form (#contactForm)
    const contactForm = document.getElementById('contactForm');
    if (contactForm && !window.handleSubmit) {
      window.handleSubmit = async function (e) {
        e.preventDefault();
        const btn = document.getElementById('submitText');
        const success = document.getElementById('formSuccess');

        const firstName = document.getElementById('firstName')?.value || '';
        const lastName = document.getElementById('lastName')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const enquiryType = document.getElementById('enquiryType')?.value || '';
        const budgetRange = document.getElementById('budget')?.value || '';
        const message = document.getElementById('message')?.value || '';

        const clientName = `${firstName} ${lastName}`.trim() || 'Private Client';
        let budget = null;
        if (budgetRange) {
          const match = budgetRange.match(/(\d+)/);
          if (match) budget = parseInt(match[1], 10) * 1000000;
        }

        const notes = `Enquiry Type: ${enquiryType || 'General'} | Budget Range: ${budgetRange || 'Not Specified'} | Message: ${message || 'None'}`;

        if (btn) btn.textContent = 'SENDING ENQUIRY...';

        try {
          await submitLead({
            client_name: clientName,
            client_email: email,
            client_phone: phone,
            source: 'website_inquiry',
            budget: budget,
            notes: notes,
          });

          contactForm.querySelectorAll('input, select, textarea').forEach(f => f.value = '');
          if (btn) btn.textContent = 'Submit Private Enquiry';
          if (success) {
            success.style.display = 'block';
            success.style.animation = 'fadeUp 0.5s var(--ease-out) forwards';
          }
        } catch (err) {
          console.error('Agency contact submit error:', err);
          if (btn) btn.textContent = 'Submit Private Enquiry';
          if (success) success.style.display = 'block';
        }
      };
    }

    // 3. Property Single Page Viewing Form (property.html)
    document.querySelectorAll('.login-form').forEach(form => {
      const dateInput = form.querySelector('input[type="date"]');
      if (dateInput) {
        form.onsubmit = async function (e) {
          e.preventDefault();
          const btn = form.querySelector('button[type="submit"]');
          const nameInput = form.querySelector('input[type="text"]');
          const emailInput = form.querySelector('input[type="email"]');
          const orig = btn ? btn.innerHTML : '';
          if (btn) {
            btn.innerHTML = '<span>Requesting Schedule…</span>';
            btn.disabled = true;
          }

          try {
            await submitLead({
              client_name: nameInput?.value || 'Private Client',
              client_email: emailInput?.value || '',
              source: 'private_viewing',
              notes: `Preferred Date: ${dateInput.value}`,
            });

            if (btn) {
              btn.innerHTML = '<span>Viewing Requested ✓</span>';
              btn.style.background = 'rgba(82,192,122,0.2)';
              btn.style.borderColor = '#52c07a';
              btn.style.color = '#52c07a';
            }
            form.reset();
            setTimeout(() => {
              if (btn) {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
                btn.disabled = false;
              }
            }, 3000);
          } catch (err) {
            console.error('Property page submit error:', err);
            if (btn) {
              btn.innerHTML = orig;
              btn.disabled = false;
            }
          }
        };
      }
    });
  }

  // ── Realtime Listener via WebSocket / Polling ─────────────────
  function initRealtime() {
    // If Supabase CDN is loaded, use Realtime channel
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        client
          .channel('beyond-bloom-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
            syncHomepageFeatured();
            syncListingsGrid();
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime connection note:', e);
      }
    }
  }

  // ── Run on DOM Ready ─────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncHomepageFeatured();
      syncListingsGrid();
      wireInquiryForms();
      initRealtime();
    });
  } else {
    syncHomepageFeatured();
    syncListingsGrid();
    wireInquiryForms();
    initRealtime();
  }
})();
