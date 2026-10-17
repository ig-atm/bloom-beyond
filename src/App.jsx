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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin CRM Portal */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/listings" element={
            <ProtectedRoute>
              <AdminListings />
            </ProtectedRoute>
          } />
          <Route path="/listings" element={
            <ProtectedRoute>
              <AdminListings />
            </ProtectedRoute>
          } />
          <Route path="/admin/leads" element={
            <ProtectedRoute>
              <AdminLeads />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <AdminLeads />
            </ProtectedRoute>
          } />
          <Route path="/admin/agents" element={
            <ProtectedRoute>
              <AdminAgents />
            </ProtectedRoute>
          } />
          <Route path="/agents" element={
            <ProtectedRoute>
              <AdminAgents />
            </ProtectedRoute>
          } />

          {/* Public Live Showcase */}
          <Route path="/public" element={<PublicListings />} />

          {/* Root hash redirects to /admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
