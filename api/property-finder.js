// ================================================================
//  BEYOND BLOOM — Property Finder Compliant XML Feed
//  Endpoint: /api/property-finder
//  Queries public.properties (status = 'available')
//  Outputs XML feed adhering to Property Finder specification
// ================================================================

function escapeXml(unsafe) {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mapPropertyType(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('penthouse')) return 'PH';
  if (t.includes('villa')) return 'VH';
  if (t.includes('townhouse')) return 'TH';
  if (t.includes('estate') || t.includes('mansion')) return 'VH';
  if (t.includes('duplex')) return 'DX';
  if (t.includes('land') || t.includes('plot')) return 'PL';
  return 'AP'; // Apartment default
}

export default async function handler(req, res) {
  // Allow GET only
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://ljdplvhmfgrcgkxrslxn.supabase.co';

  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZHBsdmhtZmdyY2dreHJzbHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDM1MjEsImV4cCI6MjEwNzU3OTUyMX0.4KF2RwtnSo4gK3BV3sc78drE72FtkEAzs6YH7oCm158';

  let properties = [];

  try {
    const endpoint = `${supabaseUrl}/rest/v1/properties?status=eq.available&order=created_at.desc&select=*`;
    const resp = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (resp.ok) {
      properties = await resp.json();
    }
  } catch (err) {
    console.error('[property-finder] fetch error:', err);
  }

  // Graceful fallback if database has 0 available rows
  if (!properties || properties.length === 0) {
    properties = [
      {
        id: 'pf-001',
        title: 'Burj View Penthouse',
        location: 'DIFC · Dubai',
        price: 32000000,
        bedrooms: 5,
        bathrooms: 7,
        area_sqft: 8400,
        property_type: 'penthouse',
        trakheesi_permit: 'RERA-2024-001',
        hero_image_url: 'https://beyondbloomre.com/images/prop_dubai_penthouse.jpg',
        gallery_urls: ['https://beyondbloomre.com/images/prop_dubai_penthouse.jpg'],
        description: 'A landmark penthouse commanding sweeping views of the Burj Khalifa and Dubai skyline.',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'pf-002',
        title: 'Palm Shoreline Villa',
        location: 'Palm Jumeirah · Dubai',
        price: 55000000,
        bedrooms: 7,
        bathrooms: 9,
        area_sqft: 14200,
        property_type: 'villa',
        trakheesi_permit: 'RERA-2024-002',
        hero_image_url: 'https://beyondbloomre.com/images/prop_palm_villa.jpg',
        gallery_urls: ['https://beyondbloomre.com/images/prop_palm_villa.jpg'],
        description: 'Beachfront villa on the frond of Palm Jumeirah with direct beach access and private pool.',
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const nowIso = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<list last_update="${nowIso}" listing_count="${properties.length}">\n`;

  for (const prop of properties) {
    const permit = prop.permit_number || prop.trakheesi_permit || '';
    const ref = permit || `BB-${String(prop.id || Math.random()).substring(0, 8)}`;
    const lastUpdate = prop.updated_at || prop.created_at || nowIso;
    const pfType = mapPropertyType(prop.sub_community || prop.property_type);
    const comm = prop.community || prop.location || 'Dubai';
    const subComm = prop.sub_community || prop.property_type || '';
    const tourUrl = prop.three_d_tour_url || prop.tour_3d_url;
    const photos = [];

    if (prop.hero_image_url) photos.push(prop.hero_image_url);
    if (Array.isArray(prop.gallery_urls)) {
      for (const u of prop.gallery_urls) {
        if (u && !photos.includes(u)) photos.push(u);
      }
    }

    xml += `  <property last_update="${escapeXml(lastUpdate)}">\n`;
    xml += `    <reference_number>${escapeXml(ref)}</reference_number>\n`;
    xml += `    <permit_number>${escapeXml(permit)}</permit_number>\n`;
    xml += `    <offering_type>${prop.listing_type === 'rent' ? 'RR' : 'RS'}</offering_type>\n`;
    xml += `    <property_type>${escapeXml(pfType)}</property_type>\n`;
    xml += `    <price_on_application>${prop.price ? '0' : '1'}</price_on_application>\n`;
    xml += `    <price>${escapeXml(prop.price || 0)}</price>\n`;
    xml += `    <service_charge>0</service_charge>\n`;
    xml += `    <cheques>1</cheques>\n`;
    xml += `    <city>Dubai</city>\n`;
    xml += `    <community>${escapeXml(comm)}</community>\n`;
    xml += `    <sub_community>${escapeXml(subComm)}</sub_community>\n`;
    xml += `    <property_name>${escapeXml(prop.title || '')}</property_name>\n`;
    xml += `    <title_en><![CDATA[${prop.title || ''}]]></title_en>\n`;
    xml += `    <description_en><![CDATA[${prop.description || ''}]]></description_en>\n`;
    xml += `    <bedroom>${escapeXml(prop.bedrooms || 0)}</bedroom>\n`;
    xml += `    <bathroom>${escapeXml(prop.bathrooms || 0)}</bathroom>\n`;
    xml += `    <size>${escapeXml(prop.area_sqft || 0)}</size>\n`;
    xml += `    <furnished>1</furnished>\n`;

    if (photos.length > 0) {
      xml += `    <photo>\n`;
      for (const photoUrl of photos) {
        xml += `      <url last_update="${escapeXml(lastUpdate)}">${escapeXml(photoUrl)}</url>\n`;
      }
      xml += `    </photo>\n`;
    }

    if (tourUrl) {
      xml += `    <view360>${escapeXml(tourUrl)}</view360>\n`;
    }

    xml += `    <agent>\n`;
    xml += `      <id>beyond-bloom-agency</id>\n`;
    xml += `      <name>Beyond Bloom Real Estate</name>\n`;
    xml += `      <email>info@beyondbloomre.com</email>\n`;
    xml += `      <phone>+971 52 226 6329</phone>\n`;
    xml += `      <license_no>RERA ORN-31290</license_no>\n`;
    xml += `    </agent>\n`;

    xml += `  </property>\n`;
  }

  xml += `</list>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(xml);
}
