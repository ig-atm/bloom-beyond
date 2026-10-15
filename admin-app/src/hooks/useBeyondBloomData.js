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

// Convert any property object to strictly conform to public.properties schema:
// id (uuid), title, slug, listing_type, status, is_featured, price, currency,
// bedrooms, bathrooms, area_sqft, community, sub_community, permit_number,
// description, hero_image_url, gallery_urls, three_d_tour_url
export function toSupabaseProperty(data, { isEdit = false } = {}) {
  if (!data) return {};

  const title = (data.title || 'Untitled Property').trim();

  // Location -> community (required, never null/empty)
  const community = (data.community || data.location || 'Dubai, UAE').trim();

  // Type -> sub_community (store property type like 'Penthouse', 'Apartment', 'Villa')
  const subCommunity = (data.sub_community || data.property_type || data.type || 'Apartment').trim();

  // Listing type: strictly 'sale', 'rent', or 'off_plan'
  let listingType = (data.listing_type || 'sale').toLowerCase().trim();
  if (!['sale', 'rent', 'off_plan'].includes(listingType)) {
    listingType = 'sale';
  }

  // Status: strictly 'draft', 'available', 'under_offer', 'sold'
  let status = (data.status || 'draft').toLowerCase().trim();
  if (!['draft', 'available', 'under_offer', 'sold'].includes(status)) {
    status = 'draft';
  }

  // Numeric parsers
  const price = parseCleanNumber(data.price, 0);
  const bedrooms = Math.round(parseCleanNumber(data.bedrooms, 0));
  const bathrooms = Math.round(parseCleanNumber(data.bathrooms, 0));
  const areaSqft = parseCleanNumber(data.area_sqft || data.area, 0);

  // Images: image / local image URLs -> hero_image_url
  const heroImageUrl = data.hero_image_url || data.image || data.imageUrl || null;
  const galleryUrls = Array.isArray(data.gallery_urls)
    ? data.gallery_urls.filter(Boolean)
    : [];

  // Permit & 3D Tour
  const permitNumber = data.permit_number || data.trakheesi_permit || null;
  const threeDTourUrl = data.three_d_tour_url || data.tour_3d_url || null;

  // Slug: preserve on edit if already present, otherwise generate unique
  const slug = (isEdit && data.slug) ? data.slug : generateSlug(title);

  // Return strictly only the columns present in public.properties schema
  const payload = {
    title,
    slug,
    listing_type: listingType,
    status,
    is_featured: Boolean(data.is_featured),
    price,
    currency: data.currency || 'AED',
    bedrooms,
    bathrooms,
    area_sqft: areaSqft,
    community,
    sub_community: subCommunity,
    permit_number: permitNumber,
    description: data.description || '',
    hero_image_url: heroImageUrl,
    gallery_urls: galleryUrls,
    three_d_tour_url: threeDTourUrl,
  };

  return payload;
}

// Convert Supabase row to UI-friendly property with backwards-compatible keys
export function fromSupabaseProperty(row) {
  if (!row) return row;
  return {
    ...row,
    // Community mapped to location for UI components
    location: row.community || row.location || '',
    community: row.community || '',

    // Sub-community mapped to type & property_type
    type: row.sub_community || row.property_type || '',
    property_type: (row.sub_community || row.property_type || 'apartment').toLowerCase(),
    sub_community: row.sub_community || '',

    // Image mapped to hero_image_url & image
    image: row.hero_image_url || '',
    hero_image_url: row.hero_image_url || '',

    // Permit & Tour URL mapped
    trakheesi_permit: row.permit_number || row.trakheesi_permit || '',
    permit_number: row.permit_number || '',
    tour_3d_url: row.three_d_tour_url || row.tour_3d_url || null,
    three_d_tour_url: row.three_d_tour_url || null,
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
              case 'INSERT':
                return [payload.new, ...prev];
              case 'UPDATE':
                return prev.map((l) => (l.id === payload.new.id ? { ...l, ...payload.new } : l));
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
export async function submitLead({ client_name, client_email, client_phone, property_id, source, notes }) {
  if (!isSupabaseConfigured) {
    return { error: new Error('Backend not configured') };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([{
      client_name,
      client_email,
      client_phone,
      property_id: property_id || null,
      source: source || 'website',
      notes: notes || null,
      stage: 'new',
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
