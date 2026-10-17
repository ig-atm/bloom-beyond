// ================================================================
//  BEYOND BLOOM — Admin Layout (sidebar + topbar shell)
// ================================================================
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, Building2, Users2, KanbanSquare,
  LogOut, Menu, X, Zap
} from 'lucide-react';

const NAV = [
  { to: '/',         label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/listings', label: 'Listings',   icon: Building2 },
  { to: '/leads',    label: 'Lead CRM',   icon: KanbanSquare },
  { to: '/agents',   label: 'Agents',     icon: Users2 },
];

export default function AdminLayout({ children, user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="overlay"
          style={{ zIndex: 45 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <a href="/" title="Beyond Bloom Homepage" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <img
              src="/images/logo_crest.png?v=3"
              alt="Beyond Bloom Crest"
              style={{
                height: 44,
                width: 'auto',
                display: 'block',
                marginBottom: 12,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(201,169,110,0.3))'
              }}
            />
          </a>
          <div className="sidebar-logo-text">Beyond <span>Bloom</span></div>
          <div className="sidebar-tagline">CRM Admin Portal</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginBottom: 8,
            background: 'rgba(82,192,122,0.06)',
            border: '1px solid rgba(82,192,122,0.15)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11, color: '#52c07a'
          }}>
            <Zap size={12} />
            Realtime Connected
          </div>

          {user && (
            <div style={{
              padding: '8px 12px', marginBottom: 8,
              fontSize: 11, color: 'var(--muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {user.email}
            </div>
          )}

          <button
            type="button"
            className="btn-signout bg-white/5 hover:bg-white/10 text-white border border-white/15"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm, 4px)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.10)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="btn btn-icon"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(v => !v)}
            id="sidebar-toggle"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button
            className="btn btn-icon"
            style={{ marginRight: 'auto' }}
            onClick={() => setSidebarOpen(v => !v)}
          >
            <Menu size={18} />
          </button>

          <a href="/" target="_blank" rel="noopener" className="btn btn-sm" style={{ gap: 6 }}>
            <Zap size={12} />
            View Live Site
          </a>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
