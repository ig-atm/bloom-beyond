// ================================================================
//  BEYOND BLOOM — Supabase Client Setup
//  Uses import.meta.env with safe fallback strings so production
//  builds and deployments on Vercel never fail even if env vars are delayed.
// ================================================================
import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://ljdplvhmfgrcgkxrslxn.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZHBsdmhtZmdyY2dreHJzbHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDM1MjEsImV4cCI6MjEwNzU3OTUyMX0.4KF2RwtnSo4gK3BV3sc78drE72FtkEAzs6YH7oCm158';

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  FALLBACK_URL;

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  FALLBACK_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
});

export const isSupabaseConfigured = true;
