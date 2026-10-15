// ================================================================
//  BEYOND BLOOM — Live Lead Pipeline (Kanban)
//  Real-time columns: new, contacted, viewing_booked, negotiation,
//  closed_won, lost.
//  Updates public.leads in Supabase in real-time.
//  Includes direct WhatsApp click-to-chat, editable notes,
//  agent assignment, and lead creation.
// ================================================================
import { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLeads, useProperties, useAgents } from '../../hooks/useBeyondBloomData';
import {
  MessageCircle, Phone, Mail, Plus, Trash2, Edit3,
  CheckCircle, AlertCircle, Loader, Search,
  Building2, User, ChevronRight, ChevronLeft
} from 'lucide-react';

const COLUMNS = [
  { id: 'new',            label: 'New Leads',        color: '#d4af37' },
  { id: 'contacted',      label: 'Contacted',        color: '#60a5fa' },
  { id: 'viewing_booked', label: 'Viewing Booked',   color: '#a78bfa' },
  { id: 'negotiation',    label: 'Negotiation',      color: '#fbbf24' },
  { id: 'closed_won',     label: 'Closed / Won',     color: '#34d399' },
  { id: 'lost',           label: 'Lost / Inactive',  color: '#94a3b8' },
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

function LeadModal({ lead, properties, agents, onClose, onSaved }) {
  const isEdit = !!lead?.id;
  const [form, setForm] = useState({
    client_name: lead?.client_name || '',
    client_email: lead?.client_email || '',
    client_phone: lead?.client_phone || '',
    stage: lead?.stage || 'new',
    property_id: lead?.property_id || '',
    assigned_agent_id: lead?.assigned_agent_id || '',
    source: lead?.source || 'website',
    notes: lead?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');

    const payload = {
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim(),
      client_phone: form.client_phone.trim(),
      stage: form.stage,
      property_id: form.property_id || null,
      assigned_agent_id: form.assigned_agent_id || null,
      source: form.source || 'crm_manual',
      notes: form.notes || null,
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', lead.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([payload]);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" style={{ zIndex: 60 }} onClick={onClose}>
      <div
        className="drawer"
        style={{ width: '100%', maxWidth: 520 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-title">{isEdit ? 'Edit Lead' : 'Create New Lead'}</div>
          <button className="btn btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-body">
          {err && (
            <div className="toast toast-error" style={{ position: 'static', marginBottom: 16 }}>
              {err}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="client@domain.com"
                value={form.client_email}
                onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone / WhatsApp</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+971 50 000 0000"
                value={form.client_phone}
                onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pipeline Stage</label>
              <select
                className="form-control"
                value={form.stage}
                onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
              >
                {COLUMNS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lead Source</label>
              <select
                className="form-control"
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              >
                <option value="website">Website Form</option>
                <option value="viewing_modal">Viewing Modal</option>
                <option value="property_finder">Property Finder</option>
                <option value="whatsapp">WhatsApp Direct</option>
                <option value="referral">Referral / Private</option>
                <option value="crm_manual">Manual Entry</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interested Property</label>
            <select
              className="form-control"
              value={form.property_id}
              onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
            >
              <option value="">-- No specific property --</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {agents?.length > 0 && (
            <div className="form-group">
              <label className="form-label">Assign Agent</label>
              <select
                className="form-control"
                value={form.assigned_agent_id}
                onChange={e => setForm(f => ({ ...f, assigned_agent_id: e.target.value }))}
              >
                <option value="">-- Unassigned --</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role || 'Agent'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Internal Agent Notes</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Requirements, budget, specific viewing availability, notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? <Loader size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const { leads, loading, refetch } = useLeads();
  const { properties } = useProperties();
  const { agents } = useAgents();

  const [search, setSearch] = useState('');
  const [filterProp, setFilterProp] = useState('all');
  const [toast, setToast] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [movingLeadId, setMovingLeadId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Move lead stage
  const handleStageChange = async (leadId, newStage) => {
    setMovingLeadId(leadId);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      showToast(`Lead moved to ${newStage.replace('_', ' ')}`);
      refetch();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setMovingLeadId(null);
    }
  };

  // Save quick note on card
  const handleSaveNote = async (leadId) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: noteText, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      if (error) throw error;
      showToast('Note updated');
      setEditingNoteId(null);
      refetch();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId, name) => {
    if (!window.confirm(`Delete lead "${name}" permanently?`)) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
      showToast('Lead deleted');
      refetch();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        lead.client_name?.toLowerCase().includes(q) ||
        lead.client_email?.toLowerCase().includes(q) ||
        lead.client_phone?.toLowerCase().includes(q) ||
        lead.notes?.toLowerCase().includes(q);

      const matchProp =
        filterProp === 'all' ||
        lead.property_id === filterProp;

      return matchSearch && matchProp;
    });
  }, [leads, search, filterProp]);

  // Clean phone number for WhatsApp link
  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="leads-page">
      <Toast {...toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="section-hd" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Lead Pipeline</h1>
          <p className="section-sub">
            Real-time Kanban CRM · {leads.length} total leads tracked
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-gold"
            onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
          >
            <Plus size={15} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, phone, notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>

          {/* Property Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={14} color="var(--muted)" />
            <select
              className="form-control"
              value={filterProp}
              onChange={e => setFilterProp(e.target.value)}
              style={{ fontSize: 13, minWidth: 200 }}
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {search || filterProp !== 'all' ? (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => { setSearch(''); setFilterProp('all'); }}
            >
              Reset Filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
          <Loader size={24} style={{ animation: 'spin 0.7s linear infinite' }} color="var(--gold)" />
        </div>
      ) : (
        /* Kanban Columns */
        <div className="kanban-board">
          {COLUMNS.map((col, colIdx) => {
            const columnLeads = filteredLeads.filter(l => (l.stage || 'new') === col.id);

            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: col.color, display: 'inline-block'
                      }}
                    />
                    <span className="kanban-column-title">{col.label}</span>
                  </div>
                  <span className="kanban-badge">{columnLeads.length}</span>
                </div>

                <div className="kanban-card-list">
                  {columnLeads.length === 0 ? (
                    <div className="kanban-empty">No leads in this stage</div>
                  ) : (
                    columnLeads.map(lead => {
                      const waLink = getWhatsAppLink(lead.client_phone);
                      const propInfo = lead.properties || properties.find(p => p.id === lead.property_id);
                      const agentInfo = agents.find(a => a.id === lead.assigned_agent_id);
                      const isMoving = movingLeadId === lead.id;

                      return (
                        <div key={lead.id} className="lead-card">
                          {/* Card Top: Name & Actions */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <div className="lead-name">{lead.client_name}</div>
                              <span className="lead-source-tag">{lead.source || 'website'}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                className="btn btn-icon btn-sm"
                                onClick={() => { setEditingLead(lead); setIsModalOpen(true); }}
                                title="Edit Lead Details"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                className="btn btn-icon btn-sm btn-danger"
                                onClick={() => handleDeleteLead(lead.id, lead.client_name)}
                                title="Delete Lead"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Contact Channels */}
                          <div className="lead-contact-actions" style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                            {lead.client_phone && (
                              <>
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lead-btn-wa"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageCircle size={13} />
                                    WhatsApp
                                  </a>
                                )}
                                <a
                                  href={`tel:${lead.client_phone}`}
                                  className="lead-btn-tel"
                                  title="Call Phone"
                                >
                                  <Phone size={12} />
                                  Call
                                </a>
                              </>
                            )}
                            {lead.client_email && (
                              <a
                                href={`mailto:${lead.client_email}?subject=Beyond%20Bloom%20Inquiry`}
                                className="lead-btn-email"
                                title="Send Email"
                              >
                                <Mail size={12} />
                                Email
                              </a>
                            )}
                          </div>

                          {/* Property Reference */}
                          {propInfo && (
                            <div className="lead-property-ref" style={{ marginBottom: 8 }}>
                              <Building2 size={12} color="var(--gold)" />
                              <span className="lead-property-title">
                                {propInfo.title}
                              </span>
                            </div>
                          )}

                          {/* Agent Reference */}
                          {agentInfo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                              <User size={11} />
                              <span>Assigned: {agentInfo.name}</span>
                            </div>
                          )}

                          {/* Editable Notes Section */}
                          <div className="lead-notes-box" style={{ marginBottom: 12 }}>
                            {editingNoteId === lead.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <textarea
                                  className="form-control"
                                  rows={2}
                                  value={noteText}
                                  onChange={e => setNoteText(e.target.value)}
                                  placeholder="Add agent notes…"
                                  autoFocus
                                  style={{ fontSize: 12, padding: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => setEditingNoteId(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="btn btn-sm btn-gold"
                                    onClick={() => handleSaveNote(lead.id)}
                                  >
                                    Save Note
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => { setEditingNoteId(lead.id); setNoteText(lead.notes || ''); }}
                                style={{
                                  fontSize: 12,
                                  color: lead.notes ? 'var(--text)' : 'var(--muted)',
                                  fontStyle: lead.notes ? 'normal' : 'italic',
                                  cursor: 'pointer',
                                  padding: '4px 6px',
                                  borderRadius: 4,
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px dashed rgba(255,255,255,0.08)'
                                }}
                                title="Click to edit notes"
                              >
                                {lead.notes ? lead.notes : '+ Click to add notes…'}
                              </div>
                            )}
                          </div>

                          {/* Stage Transition Control */}
                          <div className="lead-stage-control" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                              Stage
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {colIdx > 0 && (
                                <button
                                  className="btn btn-icon btn-sm"
                                  onClick={() => handleStageChange(lead.id, COLUMNS[colIdx - 1].id)}
                                  disabled={isMoving}
                                  title={`Move back to ${COLUMNS[colIdx - 1].label}`}
                                >
                                  <ChevronLeft size={13} />
                                </button>
                              )}

                              <select
                                className="form-control"
                                value={col.id}
                                onChange={e => handleStageChange(lead.id, e.target.value)}
                                disabled={isMoving}
                                style={{ fontSize: 11, padding: '2px 8px', height: 26, width: 110 }}
                              >
                                {COLUMNS.map(c => (
                                  <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                              </select>

                              {colIdx < COLUMNS.length - 1 && (
                                <button
                                  className="btn btn-icon btn-sm"
                                  onClick={() => handleStageChange(lead.id, COLUMNS[colIdx + 1].id)}
                                  disabled={isMoving}
                                  title={`Move to ${COLUMNS[colIdx + 1].label}`}
                                >
                                  <ChevronRight size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Create / Edit Modal */}
      {isModalOpen && (
        <LeadModal
          lead={editingLead}
          properties={properties}
          agents={agents}
          onClose={() => { setIsModalOpen(false); setEditingLead(null); }}
          onSaved={() => {
            showToast(editingLead ? 'Lead updated' : 'Lead created');
            refetch();
          }}
        />
      )}
    </div>
  );
}
