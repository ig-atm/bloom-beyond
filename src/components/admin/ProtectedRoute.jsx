// ================================================================
//  BEYOND BLOOM — Protected Route Guard
//  Verifies active Supabase session before granting access to /admin
// ================================================================
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import { Loader } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured) {
        // Fallback for development/testing if keys are being configured
        setSession({ user: { email: 'admin@beyondbloomdubai.com' } });
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      } catch (err) {
        console.error('[ProtectedRoute] session error:', err);
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--charcoal)',
        color: 'var(--gold)',
        gap: 16
      }}>
        <Loader size={32} style={{ animation: 'spin 0.7s linear infinite' }} />
        <span style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Verifying Credentials…
        </span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AdminLayout user={session.user}>
      {children}
    </AdminLayout>
  );
}
