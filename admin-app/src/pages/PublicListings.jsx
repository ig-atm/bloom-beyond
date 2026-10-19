// ================================================================
//  BEYOND BLOOM — Public Live Listings & Featured Showcase (React)
//  Connects to useProperties() & useLeads()
//  Renders live status badges (Available, Under Offer, Sold),
//  formatted AED prices, Trakheesi permits, 3D tour links,
//  and wires "Book a Private Viewing" inquiry modal directly
//  to public.leads with loading state and success feedback.
// ================================================================
import { useState } from 'react';
import { useProperties, submitLead } from '../hooks/useBeyondBloomData';
import {
  Compass, CheckCircle, AlertCircle, Loader,
  Sparkles, Shield, MapPin, Bed, Bath,
  Maximize2, Send, X, Camera
} from 'lucide-react';

function fmtAED(n) {
  if (!n) return 'Price on Application';
  return `AED ${Number(n).toLocaleString()}`;
}

export default function PublicListings() {
  const { properties, loading, isUsingFallback } = useProperties();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const filtered = properties.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'featured') return p.is_featured;
    return p.property_type === activeFilter;
  });

  const handleBookViewing = (prop) => {
    setSelectedProperty(prop);
    setSubmitSuccess(false);
    setSubmitError('');
    setForm({ name: '', email: '', phone: '', notes: '' });
    setInquiryModalOpen(true);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await submitLead({
        client_name: form.name,
        client_email: form.email,
        client_phone: form.phone,
        property_id: selectedProperty?.id || null,
        source: 'react_viewing_modal',
        notes: form.notes ? `Viewing request for ${selectedProperty?.title || 'property'}: ${form.notes}` : `Viewing request for ${selectedProperty?.title || 'property'}`,
      });

      if (error) throw error;
      setSubmitSuccess(true);
      setTimeout(() => {
        setInquiryModalOpen(false);
        setSubmitSuccess(false);
      }, 2500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--charcoal)', color: 'var(--text)' }}>
      {/* ── Public Top Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,15,17,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,169,110,0.12)',
        padding: '16px var(--gutter)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '0.05em', color: '#fff' }}>
            Beyond <span style={{ color: 'var(--gold)' }}>Bloom</span>
          </span>
          <span style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
            background: 'rgba(201,169,110,0.12)', color: 'var(--gold)',
            padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(201,169,110,0.25)'
          }}>
            Live Portfolio
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/agency.html" className="btn btn-sm btn-outline">
            About Agency
          </a>
          <a href="/admin" className="btn btn-sm btn-gold">
            Admin CRM
          </a>
        </div>
      </header>

      {/* ── Hero / Intro ── */}
      <section style={{ padding: '60px var(--gutter) 40px', maxWidth: 1280, margin: '0 auto' }}>
        {isUsingFallback && (
          <div style={{
            background: 'rgba(201,169,110,0.08)',
            border: '1px solid rgba(201,169,110,0.2)',
            borderRadius: 'var(--radius)',
            padding: '12px 18px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 13, color: 'var(--gold)'
          }}>
            <span>✨ Showing curated portfolio properties (DB is ready for cloud seeding via Admin)</span>
            <a href="/admin/listings" className="btn btn-sm btn-gold" style={{ fontSize: 11 }}>
              Seed Database in Admin
            </a>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="label" style={{ marginBottom: 12, color: 'var(--gold)' }}>Exclusive UAE Properties</p>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
              Curated Residences &<br />
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Trophy Estates</em>
            </h1>
          </div>
          <p style={{ maxWidth: 420, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
            Every residence connected to live Supabase backend with instant status verification, RERA Trakheesi registration, and direct advisory.
          </p>
        </div>

        {/* ── Filter Pills ── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 36, overflowX: 'auto', paddingBottom: 8 }}>
          {[
            { id: 'all',       label: 'All Residences' },
            { id: 'featured',  label: 'Featured Only' },
            { id: 'penthouse', label: 'Penthouses' },
            { id: 'villa',     label: 'Villas' },
            { id: 'apartment', label: 'Apartments' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                background: activeFilter === f.id ? 'var(--gold)' : 'var(--charcoal-2)',
                color: activeFilter === f.id ? '#0f0f11' : 'var(--text)',
                border: activeFilter === f.id ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: activeFilter === f.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Properties Grid ── */}
      <section style={{ padding: '0 var(--gutter) 80px', maxWidth: 1280, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Loader size={32} style={{ animation: 'spin 0.7s linear infinite' }} color="var(--gold)" />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 28
          }}>
            {filtered.map(prop => {
              const statusClass = {
                available: 'badge-available',
                under_offer: 'badge-under-offer',
                sold: 'badge-sold',
                draft: 'badge-draft',
              }[prop.status] || 'badge-available';

              return (
                <div
                  key={prop.id}
                  className="card"
                  style={{
                    background: 'var(--charcoal-2)',
                    border: '1px solid rgba(201,169,110,0.15)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, border-color 0.3s ease'
                  }}
                >
                  {/* Image container */}
                  <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                    <img
                      src={prop.hero_image_url || '/images/prop_dubai_penthouse.jpg'}
                      alt={prop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(15,15,17,0.85) 0%, transparent 60%)'
                    }} />

                    {/* Status Badge */}
                    <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
                      <span className={`badge ${statusClass}`} style={{ textTransform: 'capitalize' }}>
                        {prop.status?.replace('_', ' ') || 'Available'}
                      </span>
                      {prop.is_featured && (
                        <span className="badge badge-featured">
                          <Sparkles size={11} style={{ marginRight: 4 }} /> Featured
                        </span>
                      )}
                    </div>

                    {/* 3D Tour Link if available */}
                    {prop.tour_3d_url && (
                      <a
                        href={prop.tour_3d_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          position: 'absolute', top: 14, right: 14,
                          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff', fontSize: 11, padding: '4px 10px',
                          borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <Compass size={12} color="var(--gold)" />
                        3D Tour
                      </a>
                    )}

                    {/* Location overlay */}
                    <div style={{ position: 'absolute', bottom: 12, left: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                      <MapPin size={13} color="var(--gold)" />
                      {prop.location}
                    </div>

                    {/* Photos Count Badge */}
                    {(() => {
                      const count = Array.isArray(prop.gallery_urls) && prop.gallery_urls.length
                        ? prop.gallery_urls.length
                        : (Array.isArray(prop.images) && prop.images.length
                          ? prop.images.length
                          : (prop.hero_image_url ? 1 : 0));
                      if (count <= 1) return null;
                      return (
                        <div style={{
                          position: 'absolute', bottom: 12, right: 14,
                          background: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(8px)',
                          color: '#fff', fontSize: 11, fontWeight: 500, padding: '3px 8px',
                          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4,
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}>
                          <Camera size={11} color="var(--gold)" /> {count} Photos
                        </div>
                      );
                    })()}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)' }}>
                        {prop.property_type || 'Residence'}
                      </span>
                      {prop.trakheesi_permit && (
                        <span style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Shield size={10} /> {prop.trakheesi_permit}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, margin: '0 0 12px', color: '#fff' }}>
                      {prop.title}
                    </h3>

                    {/* Price */}
                    <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--gold)', marginBottom: 16 }}>
                      {fmtAED(prop.price)}
                    </div>

                    {/* Specs Row */}
                    <div style={{
                      display: 'flex', gap: 16, padding: '12px 0',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      marginBottom: 18, fontSize: 12, color: 'var(--muted)'
                    }}>
                      {prop.bedrooms && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Bed size={14} color="var(--gold)" />
                          <span><strong>{prop.bedrooms}</strong> Beds</span>
                        </div>
                      )}
                      {prop.bathrooms && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Bath size={14} color="var(--gold)" />
                          <span><strong>{prop.bathrooms}</strong> Baths</span>
                        </div>
                      )}
                      {prop.area_sqft && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Maximize2 size={14} color="var(--gold)" />
                          <span><strong>{Number(prop.area_sqft).toLocaleString()}</strong> sq ft</span>
                        </div>
                      )}
                    </div>

                    {/* Description preview */}
                    {prop.description && (
                      <p style={{
                        fontSize: 13, color: 'var(--muted)', lineHeight: 1.5,
                        margin: '0 0 20px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {prop.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                      <button
                        className="btn btn-gold"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => handleBookViewing(prop)}
                      >
                        Book a Private Viewing
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Book Private Viewing Inquiry Modal ── */}
      {inquiryModalOpen && (
        <div className="overlay" style={{ zIndex: 60 }} onClick={() => setInquiryModalOpen(false)}>
          <div
            className="drawer"
            style={{ width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <div className="drawer-title">Book a Private Viewing</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 4 }}>
                  {selectedProperty?.title} ({selectedProperty?.location})
                </div>
              </div>
              <button className="btn btn-icon btn-sm" onClick={() => setInquiryModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="drawer-body">
              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <CheckCircle size={48} color="var(--gold)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8, color: '#fff' }}>
                    Viewing Requested
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Our senior private client advisor has received your enquiry and will contact you via WhatsApp / telephone within 2 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit}>
                  {submitError && (
                    <div className="toast toast-error" style={{ position: 'static', marginBottom: 16 }}>
                      <AlertCircle size={14} />
                      {submitError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Lord Alexander Wright"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="client@investment.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+971 50 123 4567"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Date / Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Specify your preferred viewing date, time, or bespoke requirements..."
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-gold"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 12 }}
                    disabled={submitting}
                  >
                    {submitting ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={15} />}
                    {submitting ? 'Submitting Enquiry…' : 'Confirm Viewing Request'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>
                    Strict client privacy observed · Direct integration with Beyond Bloom CRM
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
