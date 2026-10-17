// ================================================================
//  BEYOND BLOOM — App Router
//  Uses HashRouter so /admin CRM sub-routes deploy cleanly on
//  Vercel and static hosting without server rewrite dependencies.
// ================================================================
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Code-split pages with React.lazy
const AdminLogin     = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminListings  = lazy(() => import('./pages/admin/AdminListings'));
const AdminLeads     = lazy(() => import('./pages/admin/AdminLeads'));
const AdminAgents    = lazy(() => import('./pages/admin/AdminAgents'));
const PublicListings = lazy(() => import('./pages/PublicListings'));

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: 16,
      color: 'var(--gold)',
      background: 'var(--charcoal)'
    }}>
      <Loader size={32} style={{ animation: 'spin 0.7s linear infinite' }} />
      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
        Loading Beyond Bloom…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Login */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Protected Admin CRM Portal */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/listings" element={
            <ProtectedRoute>
              <AdminListings />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <AdminLeads />
            </ProtectedRoute>
          } />
          <Route path="/agents" element={
            <ProtectedRoute>
              <AdminAgents />
            </ProtectedRoute>
          } />

          {/* Legacy /admin aliases — cleanly redirect to base paths without duplicate /admin */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/admin/listings" element={<Navigate to="/listings" replace />} />
          <Route path="/admin/leads" element={<Navigate to="/leads" replace />} />
          <Route path="/admin/agents" element={<Navigate to="/agents" replace />} />

          {/* Public Live Showcase */}
          <Route path="/public" element={<PublicListings />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
