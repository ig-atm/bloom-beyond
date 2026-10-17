// ================================================================
//  BEYOND BLOOM — Real-Time Data Hooks & Supabase Schema Mappers
//  useProperties() and useLeads() subscribe to Supabase Realtime
//  so any INSERT/UPDATE/DELETE in /admin instantly mutates state.
// ================================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// ── Schema Helpers & Mappers ──────────────────────────────────────

// Parse clean number from string or number (stripping 'AED', commas, 'sq.ft', etc.)
export function parseCleanNumber(val, defaultVal = 0) {
  if (val == null) return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const str = String(val).replace(/AED|sq\.?ft|,|\s/gi, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
}

// Auto-generate unique slug from title
export function generateSlug(title) {
  const base = (title || 'property')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base || 'prop'}-${suffix}`;
}

// Strict mapper function ensuring payloads ONLY send valid public.properties columns:
// title, slug, listing_type, status, is_featured, price, currency, bedrooms,
// bathrooms, area_sqft, community, sub_community, permit_number, description,
// hero_image_url, gallery_urls (NEVER sends 'location' as a column)
export function toSupabaseProperty(item, { isEdit = false } = {}) {
  if (!item) return {};

  const title = (item.title || 'Untitled Property').trim();

  // Auto-generate URL-safe slug from title + '-' + Math.random().toString(36).substring(2, 6)
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'property';
  const slug = (isEdit && item.slug)
    ? item.slug
    : `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  // listing_type: strictly 'sale', 'rent', or 'off_plan' (default 'sale')
  let listing_type = (item.listing_type || 'sale').toLowerCase().trim();
  if (!['sale', 'rent', 'off_plan'].includes(listing_type)) {
    listing_type = 'sale';
  }

  // status: strictly lowercase 'draft', 'available', 'under_offer', or 'sold' (default 'available')
  let status = (item.status || 'available').toLowerCase().trim();
  if (!['draft', 'available', 'under_offer', 'sold'].includes(status)) {
    status = 'available';
  }

  // is_featured: boolean
  const is_featured = Boolean(item.is_featured ?? item.featured ?? true);

  // price: clean numeric value (strip 'AED', commas, and spaces)
  let price = 0;
  if (item.price != null) {
    const cleanStr = String(item.price).replace(/AED|,|\s/gi, '').trim();
    price = parseFloat(cleanStr) || 0;
  }

  const currency = 'AED';
  const bedrooms = parseInt(item.bedrooms ?? item.beds, 10) || 0;
  const bathrooms = parseInt(item.bathrooms ?? item.baths, 10) || 0;
  const area_sqft = Number(String(item.area_sqft ?? item.sqft ?? item.area ?? 0).replace(/[^0-9.]/g, '')) || 0;

  // community: map from item.location || item.community || 'Dubai' (NEVER send 'location' as column)
  const community = (item.location || item.community || 'Dubai').trim();

  // sub_community: map from item.type || item.property_type || item.sub_community || 'Penthouse'
  const sub_community = (item.type || item.property_type || item.sub_community || 'Penthouse').trim();

  const permit_number = item.permit_number || item.trakheesi_permit || null;
  const description = item.description || '';

  // hero_image_url: map from item.hero_image_url || item.image || item.imageUrl
  let hero_image_url = item.hero_image_url || item.image || item.imageUrl || '';
  if (hero_image_url && !hero_image_url.startsWith('http') && !hero_image_url.startsWith('/')) {
    hero_image_url = `/${hero_image_url}`;
  }
  if (!hero_image_url) {
    hero_image_url = '/images/prop_dubai_penthouse.jpg';
  }

  // gallery_urls: array of image URLs
  const gallery_urls = Array.isArray(item.gallery_urls)
    ? item.gallery_urls.filter(Boolean).map(u => (u && !u.startsWith('http') && !u.startsWith('/') ? `/${u}` : u))
    : [];

  return {
    title,
    slug,
    listing_type,
    status,
    is_featured,
    price,
    currency,
    bedrooms,
    bathrooms,
    area_sqft,
    community,
    sub_community,
    permit_number,
    description,
    hero_image_url,
    gallery_urls,
  };
}

// When fetching from public.properties, map community -> location, sub_community -> type, hero_image_url -> image
export function fromSupabaseProperty(row) {
  if (!row) return row;
  let hero = row.hero_image_url || row.image || '';
  if (hero && !hero.startsWith('http') && !hero.startsWith('/')) {
    hero = `/${hero}`;
  }
  if (!hero) hero = '/images/prop_dubai_penthouse.jpg';

  const gallery = Array.isArray(row.gallery_urls)
    ? row.gallery_urls.map(u => (u && !u.startsWith('http') && !u.startsWith('/') ? `/${u}` : u))
    : [];

  return {
    ...row,
    // community -> location
    location: row.community || 'Dubai',
    community: row.community || 'Dubai',
    // sub_community -> type & property_type
    type: row.sub_community || 'Penthouse',
    property_type: (row.sub_community || 'Penthouse').toLowerCase(),
    sub_community: row.sub_community || 'Penthouse',
    // hero_image_url -> image
    image: hero,
    hero_image_url: hero,
    gallery_urls: gallery,
    permit_number: row.permit_number || '',
    trakheesi_permit: row.permit_number || '',
    tour_3d_url: row.three_d_tour_url || null,
  };
}

// ── Static fallback data (shown when DB has 0 rows) ──────────────
export const STATIC_PROPERTIES = [
  {
    id: 'static-1',
    title: 'Burj View Penthouse',
    location: 'DIFC · Dubai',
    community: 'DIFC · Dubai',
    price: 32000000,
    bedrooms: 5,
    bathrooms: 7,
    area_sqft: 8400,
    property_type: 'penthouse',
    sub_community: 'Penthouse',
    listing_type: 'sale',
    status: 'available',
    is_featured: true,
    hero_image_url: '/images/prop_dubai_penthouse.jpg',
    gallery_urls: ['/images/prop_dubai_penthouse.jpg', '/images/listing_penthouse.jpg'],
    description: 'A landmark penthouse commanding sweeping views of the Burj Khalifa and Dubai skyline. Private terraces, 5 bedrooms, and bespoke finishes throughout.',
    permit_number: 'RERA-2024-001',
    trakheesi_permit: 'RERA-2024-001',
    three_d_tour_url: null,
    tour_3d_url: null,
  },
  {
    id: 'static-2',
    title: 'Palm Shoreline Villa',
    location: 'Palm Jumeirah · Dubai',
    community: 'Palm Jumeirah · Dubai',
    price: 55000000,
    bedrooms: 7,
    bathrooms: 9,
    area_sqft: 14200,
    property_type: 'villa',
    sub_community: 'Villa',
    listing_type: 'sale',
    status: 'available',
    is_featured: true,
    hero_image_url: '/images/prop_palm_villa.jpg',
    gallery_urls: ['/images/prop_palm_villa.jpg'],
    description: 'A magnificent beachfront villa on the frond of Palm Jumeirah, with direct beach access, private pool, and unobstructed sea views.',
    permit_number: 'RERA-2024-002',
    trakheesi_permit: 'RERA-2024-002',
    three_d_tour_url: null,
    tour_3d_url: null,
  },
  {
    id: 'static-3',
    title: 'The Obsidian Residence',
    location: 'Downtown · Dubai',
    community: 'Downtown · Dubai',
    price: 18500000,
    bedrooms: 3,
    bathrooms: 4,
    area_sqft: 4800,
    property_type: 'apartment',
    sub_community: 'Apartment',
    listing_type: 'sale',
    status: 'available',
    is_featured: false,
    hero_image_url: '/images/prop_downtown_apt.jpg',
    gallery_urls: ['/images/prop_downtown_apt.jpg'],
    description: 'An ultra-refined residence in the heart of Downtown Dubai, with Burj Khalifa views and luxury amenities.',
    permit_number: 'RERA-2024-003',
    trakheesi_permit: 'RERA-2024-003',
    three_d_tour_url: null,
    tour_3d_url: null,
  },
  {
    id: 'static-4',
    title: 'Grand Estate, Emirates Hills',
    location: 'Emirates Hills · Dubai',
    community: 'Emirates Hills · Dubai',
    price: 120000000,
    bedrooms: 9,
    bathrooms: 12,
    area_sqft: 28000,
    property_type: 'villa',
    sub_community: 'Villa',
    listing_type: 'sale',
    status: 'available',
    is_featured: true,
    hero_image_url: '/images/prop_emirates_mansion.jpg',
    gallery_urls: ['/images/prop_emirates_mansion.jpg'],
    description: 'One of the most significant residential offerings in Emirates Hills — a palatial estate overlooking the Montgomerie Golf Course.',
    permit_number: 'RERA-2024-004',
    trakheesi_permit: 'RERA-2024-004',
    three_d_tour_url: null,
    tour_3d_url: null,
  },
];

// ── useProperties ─────────────────────────────────────────────────
export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProperties(STATIC_PROPERTIES);
      setIsUsingFallback(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setProperties(STATIC_PROPERTIES);
        setIsUsingFallback(true);
      } else {
        setProperties(data.map(fromSupabaseProperty));
        setIsUsingFallback(false);
      }
    } catch (err) {
      console.error('[useProperties] fetch error:', err);
      setError(err);
      setProperties(STATIC_PROPERTIES);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();

    if (!isSupabaseConfigured) return;

    // Real-time subscription
    const channel = supabase
      .channel('beyond-bloom-live-properties')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        (payload) => {
          setProperties((prev) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [fromSupabaseProperty(payload.new), ...prev];
              case 'UPDATE':
                return prev.map((p) => (p.id === payload.new.id ? fromSupabaseProperty(payload.new) : p));
              case 'DELETE':
                return prev.filter((p) => p.id !== payload.old.id);
              default:
                return prev;
            }
          });
          setIsUsingFallback(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProperties]);

  return { properties, loading, error, isUsingFallback, refetch: fetchProperties };
}

// ── useLeads ──────────────────────────────────────────────────────
export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*, properties(title, community)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formatted = (data || []).map(lead => ({
        ...lead,
        stage: lead.pipeline_stage || lead.stage || 'new',
        pipeline_stage: lead.pipeline_stage || lead.stage || 'new',
        properties: lead.properties ? {
          ...lead.properties,
          location: lead.properties.community || ''
        } : null
      }));

      setLeads(formatted);
    } catch (err) {
      console.error('[useLeads] fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();

    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('beyond-bloom-live-leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          setLeads((prev) => {
            switch (payload.eventType) {
              case 'INSERT': {
                const newLead = {
                  ...payload.new,
                  stage: payload.new.pipeline_stage || payload.new.stage || 'new',
                  pipeline_stage: payload.new.pipeline_stage || payload.new.stage || 'new',
                };
                return [newLead, ...prev];
              }
              case 'UPDATE': {
                const updated = {
                  ...payload.new,
                  stage: payload.new.pipeline_stage || payload.new.stage || 'new',
                  pipeline_stage: payload.new.pipeline_stage || payload.new.stage || 'new',
                };
                return prev.map((l) => (l.id === payload.new.id ? { ...l, ...updated } : l));
              }
              case 'DELETE':
                return prev.filter((l) => l.id !== payload.old.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  return { leads, loading, error, refetch: fetchLeads };
}

// ── useAgents ─────────────────────────────────────────────────────
export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.from('agents').select('*').order('name').then(({ data, error }) => {
      if (!error) setAgents(data || []);
      setLoading(false);
    });
  }, []);

  return { agents, loading };
}

// ── submitLead — public inquiry form helper ───────────────────────
export async function submitLead({ client_name, client_email, client_phone, property_id, source, notes, budget }) {
  if (!isSupabaseConfigured) {
    return { error: new Error('Backend not configured') };
  }

  const validSource = source === 'private_viewing' ? 'private_viewing' : 'website_inquiry';
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      client_name: (client_name || '').trim(),
      client_email: (client_email || '').trim(),
      client_phone: (client_phone || '').trim() || null,
      property_id: property_id || null,
      source: validSource,
      notes: notes || null,
      pipeline_stage: 'new',
      budget: typeof budget === 'number' ? budget : null,
    }])
    .select()
    .single();

  return { data, error };
}

// ── Seed helper — populates Supabase from static data with schema mapping ─
export async function seedPropertiesToSupabase() {
  // Map every static property through toSupabaseProperty to strictly match public.properties schema
  const rows = STATIC_PROPERTIES.map(item => toSupabaseProperty(item, { isEdit: false }));

  const { data, error } = await supabase
    .from('properties')
    .insert(rows)
    .select();

  return { data, error };
}
