// ================================================================
//  BEYOND BLOOM — App Router
//  Uses React.lazy() to code-split /admin and /admin/login
//  so public bundle size stays fast and lightweight.
// ================================================================
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Live Showcase */}
          <Route path="/" element={<PublicListings />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

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
          <Route path="/admin/leads" element={
            <ProtectedRoute>
              <AdminLeads />
            </ProtectedRoute>
          } />
          <Route path="/admin/agents" element={
            <ProtectedRoute>
              <AdminAgents />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
