// ================================================================
//  BEYOND BLOOM — Listings Manager
//  Table + Slide-Over Drawer, image upload to Supabase Storage,
//  instant featured/status toggles, seed-from-static button.
// ================================================================
import { useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useProperties, seedPropertiesToSupabase, toSupabaseProperty } from '../../hooks/useBeyondBloomData';
import {
  Plus, Edit2, Trash2, X,
  Loader, ImagePlus, Database, CheckCircle, AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = ['draft', 'available', 'under_offer', 'sold'];
const TYPE_OPTIONS   = ['penthouse', 'villa', 'apartment', 'estate', 'townhouse', 'mansion'];
const LISTING_TYPE_OPTIONS = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'off_plan', label: 'Off-Plan' }
];

const EMPTY_FORM = {
  title: '', location: '', price: '', bedrooms: '', bathrooms: '',
  area_sqft: '', property_type: 'apartment', listing_type: 'sale', status: 'draft',
  is_featured: false, description: '', trakheesi_permit: '',
  tour_3d_url: '', hero_image_url: '', gallery_urls: [], notes: '',
};

function statusBadge(status) {
  const map = {
    available:   'badge-available',
    under_offer: 'badge-under-offer',
    sold:        'badge-sold',
    draft:       'badge-draft',
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status?.replace('_', ' ') || 'draft'}</span>;
}

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`toast toast-${type}`} onClick={onClose} style={{ cursor: 'pointer' }}>
      {type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

function ImageUploadZone({ urls, onUpload, onRemove, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    for (const file of files) {
      await onUpload(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles([...e.dataTransfer.files].filter(f => f.type.startsWith('image/')));
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading
          ? <Loader size={24} color="var(--gold)" style={{ animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
          : <ImagePlus size={24} color="var(--muted)" style={{ margin: '0 auto' }} />
        }
        <div className="upload-zone-label">
          {uploading ? 'Uploading…' : 'Drag & drop images or click to browse'}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
          JPEG · PNG · WebP · Max 10MB each
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles([...e.target.files])}
        />
      </div>

      {urls.length > 0 && (
        <div className="thumb-grid">
          {urls.map((url, i) => (
            <div key={url + i} className="thumb-item">
              <img src={url} alt="" />
              <button className="thumb-remove" onClick={e => { e.stopPropagation(); onRemove(i); }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyDrawer({ prop, onClose, onSaved }) {
  const isEdit = !!prop?.id && !String(prop.id).startsWith('static-');
  const [form, setForm] = useState(isEdit ? { ...prop } : EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]       = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const uploadImage = async (file) => {
    if (!isSupabaseConfigured) { setToast({ msg: 'Supabase not configured', type: 'error' }); return; }
    setUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('property-media').upload(path, file, { upsert: true });
    if (error) { setToast({ msg: error.message, type: 'error' }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('property-media').getPublicUrl(path);
    // First image becomes hero, rest go to gallery
    if (!form.hero_image_url) {
      set('hero_image_url', publicUrl);
    } else {
      set('gallery_urls', [...(form.gallery_urls || []), publicUrl]);
    }
    setUploading(false);
  };

  const allUrls = [form.hero_image_url, ...(form.gallery_urls || [])].filter(Boolean);
  const removeImage = (idx) => {
    const arr = allUrls.filter((_, i) => i !== idx);
    set('hero_image_url', arr[0] || '');
    set('gallery_urls', arr.slice(1));
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured) { setToast({ msg: 'Supabase not configured', type: 'error' }); return; }
    setSaving(true);

    const payload = toSupabaseProperty(form, { isEdit });

    const { error } = isEdit
      ? await supabase.from('properties').update(payload).eq('id', form.id)
      : await supabase.from('properties').insert([payload]);

    setSaving(false);
    if (error) {
      setToast({ msg: error.message, type: 'error' });
    } else {
      setToast({ msg: isEdit ? 'Listing updated successfully' : 'Listing created successfully', type: 'success' });
      onSaved?.();
      setTimeout(onClose, 800);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="overlay" onClick={onClose} style={{ zIndex: 150 }} />

      <div className="drawer" style={{ zIndex: 200 }}>
        <div className="drawer-header">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>
            {isEdit ? 'Edit Listing' : 'New Listing'}
          </h2>
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="drawer-body">
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

          {/* Images */}
          <div className="form-group">
            <label className="form-label">Photos</label>
            <ImageUploadZone
              urls={allUrls}
              onUpload={uploadImage}
              onRemove={removeImage}
              uploading={uploading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Property name" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Location</label>
              <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder="DIFC · Dubai" />
            </div>
            <div className="form-group">
              <label className="form-label">Price (AED)</label>
              <input className="form-control" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="32000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input className="form-control" type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bathrooms</label>
              <input className="form-control" type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Area (sq ft)</label>
              <input className="form-control" type="number" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Listing Type</label>
              <select className="form-control" value={form.listing_type || 'sale'} onChange={e => set('listing_type', e.target.value)}>
                {LISTING_TYPE_OPTIONS.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Trakheesi Permit</label>
              <input className="form-control" value={form.trakheesi_permit} onChange={e => set('trakheesi_permit', e.target.value)} placeholder="RERA-2024-001" />
            </div>
            <div className="form-group">
              <label className="form-label">3D Tour URL</label>
              <input className="form-control" value={form.tour_3d_url} onChange={e => set('tour_3d_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Internal Notes</label>
              <textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label" style={{ marginBottom: 10 }}>Featured on Homepage Slider</label>
              <label className="toggle">
                <input type="checkbox" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
            {saving ? 'Saving…' : 'Save Listing'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminListings() {
  const { properties, loading, isUsingFallback, refetch } = useProperties();
  const [drawerProp, setDrawerProp]   = useState(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [seeding, setSeeding]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [deleting, setDeleting]       = useState(null);

  const openNew  = ()    => { setDrawerProp(EMPTY_FORM); setDrawerOpen(true); };
  const openEdit = (p)   => { setDrawerProp(p);          setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerProp(null); };

  const toggleFeatured = async (prop) => {
    if (!isSupabaseConfigured || String(prop.id).startsWith('static-')) return;
    await supabase.from('properties').update({ is_featured: !prop.is_featured }).eq('id', prop.id);
  };

  const cycleStatus = async (prop) => {
    if (!isSupabaseConfigured || String(prop.id).startsWith('static-')) return;
    const next = { draft: 'available', available: 'under_offer', under_offer: 'sold', sold: 'draft' };
    await supabase.from('properties').update({ status: next[prop.status] || 'draft' }).eq('id', prop.id);
  };

  const deleteProp = async (id) => {
    if (!confirm('Delete this listing?')) return;
    setDeleting(id);
    await supabase.from('properties').delete().eq('id', id);
    setDeleting(null);
  };

  const handleSeed = async () => {
    setSeeding(true);
    const { error } = await seedPropertiesToSupabase();
    setSeeding(false);
    if (error) setToast({ msg: error.message, type: 'error' });
    else       { setToast({ msg: '4 properties seeded to Supabase!', type: 'success' }); refetch(); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader size={24} style={{ animation: 'spin 0.7s linear infinite' }} color="var(--gold)" />
    </div>
  );

  return (
    <div>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />

      <div className="section-hd">
        <div>
          <h1 className="section-title">Listings Manager</h1>
          <p className="section-sub">{properties.length} properties · changes sync live to the website</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isUsingFallback && isSupabaseConfigured && (
            <button className="btn" onClick={handleSeed} disabled={seeding}>
              {seeding ? <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Database size={14} />}
              Seed Website Properties to Supabase
            </button>
          )}
          <button className="btn btn-gold" onClick={openNew}>
            <Plus size={14} /> New Listing
          </button>
        </div>
      </div>

      {isUsingFallback && (
        <div style={{
          background: 'rgba(201,169,82,0.08)', border: '1px solid rgba(201,169,82,0.25)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20,
          fontSize: 12, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <AlertCircle size={14} />
          Showing static website data — Supabase has 0 rows in public.properties.
          Click "Seed Website Properties" to populate the cloud database.
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Title</th>
              <th>Location</th>
              <th>Price</th>
              <th>Type</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(prop => (
              <tr key={prop.id}>
                <td style={{ width: 56 }}>
                  <img
                    src={prop.hero_image_url || '/images/prop_dubai_penthouse.jpg'}
                    alt={prop.title || 'Listing'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/prop_dubai_penthouse.jpg';
                    }}
                    style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--glass-border)' }}
                  />
                </td>
                <td style={{ fontWeight: 600 }}>{prop.title}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{prop.location}</td>
                <td style={{ fontFamily: 'var(--serif)', color: 'var(--champagne)' }}>
                  {prop.price ? `AED ${Number(prop.price).toLocaleString()}` : '—'}
                </td>
                <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{prop.property_type}</td>
                <td>
                  <button
                    onClick={() => cycleStatus(prop)}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                    title="Click to cycle status"
                  >
                    {statusBadge(prop.status)}
                  </button>
                </td>
                <td>
                  <label className="toggle">
                    <input
                      type="checkbox" checked={!!prop.is_featured}
                      onChange={() => toggleFeatured(prop)}
                      disabled={String(prop.id).startsWith('static-')}
                    />
                    <span className="toggle-slider" />
                  </label>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-icon btn-sm" onClick={() => openEdit(prop)} title="Edit">
                      <Edit2 size={13} />
                    </button>
                    {!String(prop.id).startsWith('static-') && (
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        onClick={() => deleteProp(prop.id)}
                        disabled={deleting === prop.id}
                        title="Delete"
                      >
                        {deleting === prop.id
                          ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                          : <Trash2 size={13} />
                        }
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <PropertyDrawer
          prop={drawerProp}
          onClose={closeDrawer}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
