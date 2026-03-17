let cachedToken = null;
let cachedTokenExpiresAt = 0;

function getAmadeusCredentials() {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export function hasAmadeusCredentials() {
  return Boolean(getAmadeusCredentials());
}

export async function getAmadeusToken() {
  const credentials = getAmadeusCredentials();
  if (!credentials) {
    throw new Error('Amadeus credentials are not configured.');
  }

  const now = Date.now();
  if (cachedToken && cachedTokenExpiresAt - now > 60_000) {
    return cachedToken;
  }

  const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
    cache: 'no-store',
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(payload?.error_description || payload?.error || 'Failed to authenticate with Amadeus.');
  }

  cachedToken = payload.access_token;
  cachedTokenExpiresAt = now + Number(payload.expires_in || 0) * 1000;
  return cachedToken;
}

export async function searchAmadeusAirports(query, limit = 8) {
  const token = await getAmadeusToken();
  const params = new URLSearchParams({
    subType: 'AIRPORT',
    keyword: query,
    view: 'LIGHT',
    sort: 'analytics.travelers.score',
    'page[limit]': String(limit),
  });

  const response = await fetch(`https://api.amadeus.com/v1/reference-data/locations?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.errors?.[0]?.detail || 'Failed to search airports.');
  }

  return (payload.data || []).map((item) => ({
    code: String(item.iataCode || '').toUpperCase(),
    city: item.address?.cityName || item.name || '',
    country: item.address?.countryName || item.address?.countryCode || '',
    name: item.name || item.detailedName || item.address?.cityName || '',
    subType: item.subType || 'AIRPORT',
  })).filter((item) => item.code);
}
