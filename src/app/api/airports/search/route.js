import { findAirportMatches } from '@/lib/airports';
import { hasAmadeusCredentials, searchAmadeusAirports } from '@/lib/amadeus';

function dedupeAirports(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const code = String(row?.code || '').toUpperCase();
    if (!code || seen.has(code)) return false;
    seen.add(code);
    return true;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get('q') || '').trim();
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 8), 1), 10);

  if (query.length < 2) {
    return Response.json({ matches: [], source: 'none' });
  }

  const localMatches = findAirportMatches(query, limit);

  if (!hasAmadeusCredentials()) {
    return Response.json({
      matches: localMatches,
      source: 'fallback',
    });
  }

  try {
    const remoteMatches = await searchAmadeusAirports(query, limit);
    return Response.json({
      matches: dedupeAirports([...remoteMatches, ...localMatches]).slice(0, limit),
      source: 'amadeus',
    });
  } catch {
    return Response.json({
      matches: localMatches,
      source: 'fallback',
    });
  }
}
