// ================================================================
//  BEYOND BLOOM — Admin Dashboard (overview)
// ================================================================
import { useProperties, useLeads } from '../../hooks/useBeyondBloomData';
import { Building2, Users2, TrendingUp, DollarSign, Loader } from 'lucide-react';

function StatCard({ label, value, change, icon: Icon, color = 'var(--gold)' }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="stat-label">{label}</span>
        <div style={{ color, opacity: 0.7 }}><Icon size={18} /></div>
      </div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
}

function fmtAED(n) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n}`;
}

export default function AdminDashboard() {
  const { properties, loading: pLoading } = useProperties();
  const { leads,      loading: lLoading } = useLeads();

  const totalValue  = properties.reduce((s, p) => s + (p.price || 0), 0);
  const available   = properties.filter(p => p.status === 'available').length;
  const featured    = properties.filter(p => p.is_featured).length;
  const newLeads    = leads.filter(l => l.stage === 'new').length;
  const closedLeads = leads.filter(l => l.stage === 'closed_won').length;

  if (pLoading || lLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Loader size={24} style={{ animation: 'spin 0.7s linear infinite' }} color="var(--gold)" />
      </div>
    );
  }

  return (
    <div>
      <div className="section-hd" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-sub">Live overview — all numbers update in real time</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Properties"   value={properties.length}  icon={Building2}  change={`${available} available`} />
        <StatCard label="Portfolio Value"    value={fmtAED(totalValue)} icon={DollarSign} color="#52c07a" />
        <StatCard label="Featured Listings"  value={featured}           icon={TrendingUp}  change="On homepage slider" />
        <StatCard label="Active Leads"       value={leads.length}       icon={Users2}     change={`${newLeads} new · ${closedLeads} won`} />
      </div>

      {/* Recent leads */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 16 }}>
          Recent Leads
        </h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 6).map(lead => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600 }}>{lead.client_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{lead.client_email}</td>
                  <td style={{ color: 'var(--muted)' }}>{lead.client_phone || '—'}</td>
                  <td><span className="badge badge-draft">{lead.source}</span></td>
                  <td><StageBadge stage={lead.stage} /></td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                    No leads yet. Inquiries submitted on the website will appear here in real time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property status breakdown */}
      <div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 16 }}>
          Listings by Status
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Available',   count: available,                                      cls: 'badge-available' },
            { label: 'Under Offer', count: properties.filter(p=>p.status==='under_offer').length, cls: 'badge-under-offer' },
            { label: 'Sold',        count: properties.filter(p=>p.status==='sold').length, cls: 'badge-sold' },
            { label: 'Draft',       count: properties.filter(p=>p.status==='draft').length,cls: 'badge-draft' },
          ].map(({ label, count, cls }) => (
            <div key={label} className="stat-card" style={{ minWidth: 140, flex: '1 1 140px', textAlign: 'center' }}>
              <div className={`badge ${cls}`} style={{ margin: '0 auto 8px' }}>{label}</div>
              <div className="stat-value" style={{ fontSize: 28 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }) {
  const map = {
    new:            'badge-new',
    contacted:      'badge-draft',
    viewing_booked: 'badge-featured',
    negotiation:    'badge-under-offer',
    closed_won:     'badge-available',
    lost:           'badge-sold',
  };
  const label = stage?.replace('_', ' ') || 'new';
  return <span className={`badge ${map[stage] || 'badge-draft'}`}>{label}</span>;
}
