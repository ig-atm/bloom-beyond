// ================================================================
//  BEYOND BLOOM — Supabase Client
//  Safe fallback so `vite build` never crashes when env vars are
//  missing (e.g. in CI lint steps or preview deployments).
// ================================================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';

// Guard: in CI / linting environments where env vars may not be present,
// we create a dummy stub so imports don't blow up at module evaluation time.
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : {
      // Minimal stub so the app renders without crashing in CI
      from: () => ({ select: () => ({ data: null, error: new Error('Supabase not configured') }) }),
      auth: {
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => {},
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      removeChannel: () => {},
    };

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
