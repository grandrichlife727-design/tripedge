export const DEALS_FALLBACK = [
  { id: 1, route_type: 'flight', origin: 'NYC', destination: 'Lisbon', current_price: 287, avg_price: 485, savings_pct: 41, carrier: 'TAP Portugal', urgency: 'hot', trend: 'dropping', last_updated: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=640&h=400&fit=crop', travel_dates: 'Apr 12–19' },
  { id: 2, route_type: 'flight', origin: 'NYC', destination: 'Tokyo', current_price: 512, avg_price: 890, savings_pct: 42, carrier: 'ANA', urgency: 'warm', trend: 'stable', last_updated: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&h=400&fit=crop', travel_dates: 'May 3–14' },
  { id: 3, route_type: 'hotel', origin: '', destination: 'Barcelona', current_price: 89, avg_price: 165, savings_pct: 46, carrier: 'Hotel Arts', urgency: 'hot', trend: 'dropping', last_updated: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=640&h=400&fit=crop', travel_dates: 'Apr 20–25 / night' },
  { id: 4, route_type: 'flight', origin: 'MCO', destination: 'London', current_price: 446, avg_price: 702, savings_pct: 36, carrier: 'Virgin Atlantic', urgency: 'warm', trend: 'dropping', last_updated: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=640&h=400&fit=crop', travel_dates: 'May 8–15' },
  { id: 5, route_type: 'flight', origin: 'MCO', destination: 'San Juan', current_price: 167, avg_price: 278, savings_pct: 40, carrier: 'JetBlue', urgency: 'hot', trend: 'stable', last_updated: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=640&h=400&fit=crop', travel_dates: 'Apr 18–22' },
  { id: 6, route_type: 'flight', origin: 'MCO', destination: 'Vancouver', current_price: 294, avg_price: 478, savings_pct: 38, carrier: 'Air Canada', urgency: 'warm', trend: 'rising', last_updated: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=400&fit=crop', travel_dates: 'Jun 3–9' },
];

export const TRENDING = [
  { city: 'Lisbon', country: 'Portugal', tag: 'Trending', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=500&fit=crop', description: '40% below seasonal avg' },
  { city: 'Kyoto', country: 'Japan', tag: 'Hidden Gem', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop', description: 'Cherry blossom season deals' },
  { city: 'Medellín', country: 'Colombia', tag: 'Underpriced', image: 'https://images.unsplash.com/photo-1599070978682-e2671a82bed2?w=800&h=500&fit=crop', description: '52% below typical fares' },
];

export const ALERTS_FALLBACK = [
  { msg: 'NYC → Lisbon dropped 18% in 2 hours', time: '12m ago', type: 'drop' },
  { msg: 'Tokyo flights just hit a 6-month low', time: '1h ago', type: 'low' },
  { msg: 'Bali hotels 56% below average', time: '3h ago', type: 'deal' },
];

export function urgencyBadgeType(value) {
  if (value === 'hot') return 'hot';
  if (value === 'warm') return 'warm';
  return 'watch';
}

export function formatDealTitle(deal) {
  return deal.route_type === 'hotel' ? deal.carrier || deal.destination : `${deal.origin} → ${deal.destination}`;
}

export function getDealId(deal) {
  return String(deal.route_id || deal.id || deal.destination || 'deal');
}

export function buildPlannerQueryFromDeal(deal) {
  const destination = deal.destination || 'this destination';
  const dates = deal.travel_dates ? ` around ${deal.travel_dates}` : '';
  if (deal.route_type === 'hotel') {
    return `3 days in ${destination}${dates}, boutique stay, local food, walkable neighborhoods, balanced budget`;
  }
  const origin = deal.origin ? ` from ${deal.origin}` : '';
  return `Plan a ${deal.route_type === 'flight' ? 'trip' : 'stay'} to ${destination}${origin}${dates} with local food, hidden gems, and a realistic budget`;
}

export function getDealOriginOptions(deals = DEALS_FALLBACK) {
  const origins = Array.from(new Set((deals || []).map((deal) => deal.origin).filter(Boolean))).sort();
  return ['all', ...origins];
}
