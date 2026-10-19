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
  Loader, ImagePlus, Database, CheckCircle, AlertCircle,
  UploadCloud, Link, ArrowLeft, ArrowRight, Star, Camera
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

function BulkGalleryUploader({ urls, onAddPhotos, onSetCover, onRemove, onReorder, setToast }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ active: false, current: 0, total: 0, status: '' });
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const inputRef = useRef();
  const dragItem = useRef(null);

  const handleUploadFiles = async (fileList) => {
    const rawFiles = Array.from(fileList || []);
    const files = rawFiles.filter(f =>
      f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name)
    );

    if (!files.length) {
      if (rawFiles.length > 0) {
        setToast({ msg: 'Please select valid image files (JPG, PNG, WebP, AVIF)', type: 'error' });
      }
      return;
    }

    if (!isSupabaseConfigured) {
      setToast({ msg: 'Supabase storage is not configured', type: 'error' });
      return;
    }

    setUploading(true);
    const total = files.length;
    let completed = 0;
    setUploadProgress({
      active: true,
      current: 0,
      total,
      status: `Uploading 0 of ${total} photos...`
    });

    try {
      const uploadPromises = files.map(async (file) => {
        const ext = file.name.split('.').pop() || 'webp';
        const cleanName = (file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24)) || 'photo';
        const uniquePath = `properties/${Date.now()}-${cleanName}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('property-media')
          .upload(uniquePath, file, {
            upsert: true,
            contentType: file.type || 'image/jpeg'
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-media')
          .getPublicUrl(uniquePath);

        completed += 1;
        setUploadProgress({
          active: true,
          current: completed,
          total,
          status: `Uploading ${completed} of ${total} photos...`
        });

        return publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      onAddPhotos(newUrls);
      setToast({ msg: `Successfully uploaded ${newUrls.length} photos in parallel!`, type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Error during photo upload', type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress({ active: false, current: 0, total: 0, status: '' });
      }, 1000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddPastedUrls = () => {
    if (!pasteText.trim()) return;
    const items = pasteText
      .split(/[\r\n,]+/)
      .map(s => s.trim())
      .filter(s => s && (s.startsWith('http') || s.startsWith('/')));

    if (!items.length) {
      setToast({ msg: 'No valid URLs found. Make sure URLs start with http://, https:// or /', type: 'error' });
      return;
    }

    onAddPhotos(items);
    setPasteText('');
    setShowPaste(false);
    setToast({ msg: `Added ${items.length} image URLs to gallery!`, type: 'success' });
  };

  const movePhoto = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= urls.length) return;
    const updated = [...urls];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onReorder(updated);
  };

  const handleDropReorder = (fromIdx, toIdx) => {
    if (fromIdx === null || fromIdx === undefined || fromIdx === toIdx) return;
    movePhoto(fromIdx, toIdx);
  };

  const handleClearAll = () => {
    if (urls.length === 0) return;
    if (confirm(`Remove all ${urls.length} photos from this gallery?`)) {
      onReorder([]);
    }
  };

  return (
    <div>
      {/* Luxury Drag-and-Drop Bulk Uploader */}
      <div
        className={`bulk-upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader size={30} color="var(--gold)" style={{ animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        ) : (
          <UploadCloud size={32} color="var(--gold)" style={{ margin: '0 auto', opacity: 0.9 }} />
        )}

        <div className="bulk-upload-title">
          {uploading ? 'Uploading to Supabase Storage…' : 'Drag & Drop Photos in Bulk or Click to Browse'}
        </div>
        <div className="bulk-upload-subtitle">
          Select 10 to 50+ images (JPG, PNG, WebP, AVIF) · Parallel fast upload
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.webp,.avif"
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files) handleUploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Live Progress Bar during upload */}
      {uploadProgress.active && (
        <div className="upload-progress-container">
          <div className="upload-progress-text">
            <span>{uploadProgress.status}</span>
            <span>
              {uploadProgress.total > 0
                ? `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`
                : ''}
            </span>
          </div>
          <div className="upload-progress-bar">
            <div
              className="upload-progress-fill"
              style={{
                width: uploadProgress.total > 0
                  ? `${(uploadProgress.current / uploadProgress.total) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons: Paste URLs Toggle & Clear All */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setShowPaste(!showPaste)}
          style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Link size={12} color="var(--gold)" />
          {showPaste ? 'Hide Paste Box' : 'Paste Multiple Image URLs'}
        </button>

        {urls.length > 0 && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleClearAll}
            style={{ fontSize: 11, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            Clear All ({urls.length})
          </button>
        )}
      </div>

      {/* Paste URLs Textarea Box */}
      {showPaste && (
        <div className="paste-urls-box">
          <label className="form-label" style={{ marginBottom: 6 }}>
            Paste Image URLs (one per line or separated by commas)
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder={`https://images.unsplash.com/photo-1...\nhttps://.../interior.webp\n/images/prop_villa.jpg`}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            style={{ fontSize: 12, fontFamily: 'monospace' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => { setPasteText(''); setShowPaste(false); }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-gold"
              onClick={handleAddPastedUrls}
            >
              Add URLs to Gallery
            </button>
          </div>
        </div>
      )}

      {/* Thumbnail Grid & Cover Selector */}
      {urls.length > 0 && (
        <div>
          <div className="thumb-gallery-header">
            <div className="thumb-gallery-title">
              <Camera size={13} color="var(--gold)" />
              Property Photos ({urls.length})
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              ★ Star = Cover Thumbnail · Drag or arrows to reorder
            </span>
          </div>

          <div className="thumb-gallery-grid">
            {urls.map((url, i) => {
              const isCover = i === 0;
              return (
                <div
                  key={url + '-' + i}
                  className={`thumb-card ${isCover ? 'is-cover' : ''}`}
                  draggable
                  onDragStart={() => { dragItem.current = i; }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDropReorder(dragItem.current, i)}
                  title={isCover ? 'Primary Cover Photo' : `Photo #${i + 1} (Drag to reorder)`}
                >
                  <img src={url} alt={`Photo ${i + 1}`} />

                  {isCover ? (
                    <div className="thumb-badge-cover">★ Cover</div>
                  ) : (
                    <div className="thumb-badge-order">#{i + 1}</div>
                  )}

                  <div className="thumb-overlay-actions">
                    <div className="thumb-actions-top">
                      <button
                        type="button"
                        className="thumb-btn-del"
                        onClick={e => { e.stopPropagation(); onRemove(i); }}
                        title="Delete photo"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="thumb-actions-bottom">
                      {!isCover ? (
                        <button
                          type="button"
                          className="thumb-btn-cover"
                          onClick={e => { e.stopPropagation(); onSetCover(i); }}
                          title="Make this the primary cover photo"
                        >
                          <Star size={10} style={{ marginRight: 2, fill: 'currentColor' }} />
                          Cover
                        </button>
                      ) : (
                        <span style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 600 }}>Cover</span>
                      )}

                      <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
                        <button
                          type="button"
                          className="thumb-btn-nav"
                          disabled={i === 0}
                          onClick={e => { e.stopPropagation(); movePhoto(i, i - 1); }}
                          title="Move left"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="thumb-btn-nav"
                          disabled={i === urls.length - 1}
                          onClick={e => { e.stopPropagation(); movePhoto(i, i + 1); }}
                          title="Move right"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyDrawer({ prop, onClose, onSaved }) {
  const isEdit = !!prop?.id && !String(prop.id).startsWith('static-');
  const [form, setForm] = useState(isEdit ? { ...prop } : EMPTY_FORM);

  // Initialize images list in order
  const initialImages = (() => {
    if (prop?.allImages && Array.isArray(prop.allImages) && prop.allImages.length) {
      return [...prop.allImages];
    }
    const list = [];
    const add = (u) => {
      if (u && typeof u === 'string' && !list.includes(u.trim())) list.push(u.trim());
    };
    if (prop?.hero_image_url) add(prop.hero_image_url);
    if (prop?.image) add(prop.image);
    if (Array.isArray(prop?.gallery_urls)) prop.gallery_urls.forEach(add);
    if (Array.isArray(prop?.images)) prop.images.forEach(add);
    return list;
  })();

  const [images, setImages] = useState(initialImages);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAddPhotos = (newUrls) => {
    setImages(prev => {
      const combined = [...prev];
      newUrls.forEach(u => {
        if (u && !combined.includes(u)) combined.push(u);
      });
      return combined;
    });
  };

  const handleSetCover = (index) => {
    setImages(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const updated = [...prev];
      const [chosen] = updated.splice(index, 1);
      return [chosen, ...updated];
    });
  };

  const handleRemovePhoto = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReorder = (newOrder) => {
    setImages(newOrder);
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured) { setToast({ msg: 'Supabase not configured', type: 'error' }); return; }
    setSaving(true);

    const cover = images[0] || form.hero_image_url || '';
    const payload = toSupabaseProperty({
      ...form,
      allImages: images,
      hero_image_url: cover,
      image: cover,
      gallery_urls: images,
      images: images,
    }, { isEdit });

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

      <div className="drawer" style={{ zIndex: 200, maxWidth: 640 }}>
        <div className="drawer-header">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>
            {isEdit ? 'Edit Listing' : 'New Listing'}
          </h2>
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="drawer-body">
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

          {/* Luxury Bulk Image Uploader & Interactive Photo Gallery */}
          <div className="form-group">
            <label className="form-label">Property Photos &amp; Visual Gallery</label>
            <BulkGalleryUploader
              urls={images}
              onAddPhotos={handleAddPhotos}
              onSetCover={handleSetCover}
              onRemove={handleRemovePhoto}
              onReorder={handleReorder}
              setToast={setToast}
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
            {properties.map(prop => {
              const photoCount = Array.isArray(prop.gallery_urls) && prop.gallery_urls.length
                ? prop.gallery_urls.length
                : (Array.isArray(prop.images) && prop.images.length
                  ? prop.images.length
                  : (prop.hero_image_url ? 1 : 0));

              return (
                <tr key={prop.id}>
                  <td style={{ width: 80, verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                      <img
                        src={prop.hero_image_url || '/images/prop_dubai_penthouse.jpg'}
                        alt={prop.title || 'Listing'}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/prop_dubai_penthouse.jpg';
                        }}
                        style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--glass-border)' }}
                      />
                      <span className="badge-photo-count" title={`${photoCount} photos in gallery`}>
                        <Camera size={10} /> {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </div>
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
            );
          })}
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
