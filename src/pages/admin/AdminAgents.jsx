// ================================================================
//  BEYOND BLOOM — Agents Roster Management
//  Add, Edit, View, and Delete brokerage agents (public.agents)
//  Upload avatar/headshot to Supabase Storage 'property-media'
//  Assign to listings and leads.
// ================================================================
import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  User, Plus, Edit2, Trash2, Mail, Phone,
  Upload, CheckCircle, AlertCircle, Loader, ShieldCheck
} from 'lucide-react';

const STATIC_AGENTS_SEED = [
  {
    name: 'Akbar Bloom',
    email: 'akbar@beyondbloomdubai.com',
    phone: '+971 52 226 6329',
    role: 'Managing Partner & Principal',
    license_no: 'RERA BRN-48921',
    bio: 'Specialising in landmark off-market estates and bespoke advisory across Palm Jumeirah, Emirates Hills, and DIFC.',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elena Rostova',
    email: 'elena@beyondbloomdubai.com',
    phone: '+971 50 843 1920',
    role: 'Senior Private Client Advisor',
    license_no: 'RERA BRN-51203',
    bio: 'Advising European ultra-high-net-worth individuals and family offices on prime residential acquisitions.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tariq Mansoor',
    email: 'tariq@beyondbloomdubai.com',
    phone: '+971 55 912 4477',
    role: 'Head of Waterfront Portfolios',
    license_no: 'RERA BRN-39810',
    bio: 'Over 12 years directing waterfront trophy asset transactions and off-plan penthouse launches across the UAE.',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  }
];

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`toast toast-${type}`} onClick={onClose} style={{ cursor: 'pointer' }}>
      {type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'Luxury Property Advisor',
    license_no: '', bio: '', photo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAgents = async () => {
    if (!isSupabaseConfigured) {
      setAgents(STATIC_AGENTS_SEED);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');
      if (error) throw error;
      setAgents(data || []);
    } catch (e) {
      console.warn('Error fetching agents, using fallback seed:', e);
      setAgents(STATIC_AGENTS_SEED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const openCreate = () => {
    setEditingAgent(null);
    setForm({
      name: '', email: '', phone: '', role: 'Luxury Property Advisor',
      license_no: '', bio: '', photo_url: ''
    });
    setModalOpen(true);
  };

  const openEdit = (agent) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      role: agent.role || 'Luxury Property Advisor',
      license_no: agent.license_no || '',
      bio: agent.bio || '',
      photo_url: agent.photo_url || ''
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      // Local preview fallback
      const url = URL.createObjectURL(file);
      setForm(f => ({ ...f, photo_url: url }));
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `agents/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('property-media').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('property-media').getPublicUrl(path);
      setForm(f => ({ ...f, photo_url: data.publicUrl }));
      showToast('Agent photo uploaded');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role.trim() || null,
      license_no: form.license_no.trim() || null,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url || null,
    };

    try {
      if (editingAgent?.id && !String(editingAgent.id).startsWith('seed-')) {
        const { error } = await supabase
          .from('agents')
          .update(payload)
          .eq('id', editingAgent.id);
        if (error) throw error;
        showToast('Agent details updated');
      } else {
        const { error } = await supabase
          .from('agents')
          .insert([payload]);
        if (error) throw error;
        showToast('Agent added to roster');
      }
      setModalOpen(false);
      fetchAgents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove agent "${name}" from the brokerage roster?`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('agents').delete().eq('id', id);
      if (error) throw error;
      showToast('Agent removed');
      fetchAgents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeedAgents = async () => {
    setSeeding(true);
    try {
      const { error } = await supabase.from('agents').insert(STATIC_AGENTS_SEED);
      if (error) throw error;
      showToast('Seeded brokerage agents to Supabase');
      fetchAgents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="agents-page">
      <Toast {...toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="section-hd" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Brokerage Agents Roster</h1>
          <p className="section-sub">
            Manage licensed advisors & assign them to prime listings & leads
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {agents.length === 0 && (
            <button
              className="btn btn-outline"
              onClick={handleSeedAgents}
              disabled={seeding}
            >
              {seeding ? <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <ShieldCheck size={14} />}
              Seed Roster
            </button>
          )}
          <button className="btn btn-gold" onClick={openCreate}>
            <Plus size={15} />
            Add Agent
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Loader size={24} style={{ animation: 'spin 0.7s linear infinite' }} color="var(--gold)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {agents.map((agent, i) => (
            <div
              key={agent.id || i}
              className="card"
              style={{
                background: 'var(--charcoal-2)',
                border: '1px solid rgba(201,169,110,0.15)',
                borderRadius: 'var(--radius)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* Top Row: Photo + Name + Role */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: '2px solid var(--gold)',
                  background: 'var(--charcoal-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {agent.photo_url ? (
                    <img
                      src={agent.photo_url}
                      alt={agent.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={28} color="var(--gold)" />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>
                    {agent.role || 'Luxury Property Advisor'}
                  </div>
                  {agent.license_no && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {agent.license_no}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {agent.bio && (
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                  {agent.bio}
                </p>
              )}

              {/* Contact Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text)' }}
                  >
                    <Mail size={13} color="var(--gold)" />
                    {agent.email}
                  </a>
                )}
                {agent.phone && (
                  <a
                    href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text)' }}
                  >
                    <Phone size={13} color="#25D366" />
                    {agent.phone}
                  </a>
                )}
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                <button
                  className="btn btn-sm btn-outline"
                  style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                  onClick={() => openEdit(agent)}
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                {agent.id && (
                  <button
                    className="btn btn-sm btn-danger btn-icon"
                    onClick={() => handleDelete(agent.id, agent.name)}
                    disabled={deletingId === agent.id}
                    title="Remove Agent"
                  >
                    {deletingId === agent.id
                      ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                      : <Trash2 size={13} />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Drawer for Add / Edit Agent */}
      {modalOpen && (
        <div className="overlay" style={{ zIndex: 60 }} onClick={() => setModalOpen(false)}>
          <div
            className="drawer"
            style={{ width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="drawer-title">
                {editingAgent ? 'Edit Agent Details' : 'Add New Brokerage Agent'}
              </div>
              <button className="btn btn-icon btn-sm" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="drawer-body">
              {/* Photo Upload Zone */}
              <div className="form-group" style={{ textAlign: 'center' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  margin: '0 auto 12px', overflow: 'hidden',
                  border: '2px dashed var(--gold)',
                  position: 'relative', background: 'var(--charcoal-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={36} color="var(--muted)" />
                  )}
                  {uploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Loader size={18} style={{ animation: 'spin 0.7s linear infinite' }} color="var(--gold)" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={12} />
                  {uploading ? 'Uploading…' : 'Upload Headshot'}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Akbar Bloom"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="agent@beyondbloomdubai.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+971 50 000 0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role / Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior Private Client Advisor"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">RERA License / BRN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. RERA BRN-48921"
                    value={form.license_no}
                    onChange={e => setForm(f => ({ ...f, license_no: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Agent Biography</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Brief background, specialties, communities covered..."
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {editingAgent ? 'Save Changes' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
