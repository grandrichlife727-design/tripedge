const PREVIEW_COOKIE = 'tripedge_preview_tier';
const ALLOWED_TIERS = new Set(['free', 'pro', 'premium']);

const PREVIEW_ITINERARY = {
  destination: 'Lisbon, Portugal',
  tagline: 'Golden-hour viewpoints, tiled streets, and long lunches by the water.',
  estimated_daily_budget: '$140',
  insider_tip: 'Take Tram 28 early, then walk back downhill through Alfama before the midday crowds arrive.',
  days: [
    { day: 1, title: 'Historic core and sunset overlooks', items: [
      { time: '9:00 AM', activity: 'Coffee at Hello, Kristof', description: 'Start with a strong espresso and pastry before the city fills in.', cost: '$12', type: 'food' },
      { time: '11:00 AM', activity: 'Wander Alfama backstreets', description: 'Explore tiled alleys, laundry-lined balconies, and small family taverns.', cost: 'Free', type: 'culture' },
      { time: '1:30 PM', activity: 'Lunch at Taberna Sal Grosso', description: 'A compact local favorite with excellent seafood plates and a casual feel.', cost: '$28', type: 'food' },
      { time: '6:30 PM', activity: 'Miradouro da Senhora do Monte', description: 'End the day with the best broad sunset view over the city and river.', cost: 'Free', type: 'relax' },
    ]},
    { day: 2, title: 'Belém and riverfront reset', items: [
      { time: '9:30 AM', activity: 'Pastéis de Belém', description: 'Go early for the iconic custard tarts before the line becomes a commitment.', cost: '$10', type: 'food' },
      { time: '11:00 AM', activity: 'Jerónimos Monastery', description: 'See the city’s most ornate Manueline architecture while the light is still soft.', cost: '$18', type: 'culture' },
      { time: '2:00 PM', activity: 'MAAT river walk', description: 'Take the waterfront route for a slower afternoon with cleaner air and open space.', cost: '$8', type: 'culture' },
      { time: '7:00 PM', activity: 'Dinner in Santos', description: 'Settle into a neighborhood dinner instead of returning to the most tourist-heavy blocks.', cost: '$35', type: 'gem' },
    ]},
    { day: 3, title: 'Creative neighborhoods and final splurge', items: [
      { time: '10:00 AM', activity: 'LX Factory browse', description: 'Independent shops, bookstores, and design spaces make this a good slow start.', cost: 'Free', type: 'gem' },
      { time: '1:00 PM', activity: 'Long lunch in Príncipe Real', description: 'Use the afternoon for one polished meal in a calmer neighborhood.', cost: '$36', type: 'food' },
      { time: '4:30 PM', activity: 'Jardim do Príncipe Real', description: 'Rest in the shade and reset before your final evening.', cost: 'Free', type: 'relax' },
      { time: '8:00 PM', activity: 'Fado dinner in Bairro Alto fringe', description: 'Choose a smaller venue just outside the busiest strips for a better experience.', cost: '$42', type: 'culture' },
    ]},
  ],
};

const PREVIEW_GROUP_TRIPS = [
  { id: 'preview-group-lisbon', creator_id: 'preview-premium', name: 'Portugal Summer Escape', invite_code: 'PREVIEW7', destination_options: ['Lisbon', 'Porto', 'Algarve'], date_options: ['Jun 12-16', 'Jun 19-23', 'Jul 10-14'], ai_recommendation: 'Lisbon on Jun 19-23 has the strongest overlap across votes and budget comfort.', group_members: [
    { id: 'gm1', user_id: 'preview-premium', role: 'creator', destination_vote: 'Lisbon', date_vote: 'Jun 19-23', budget: 1800, has_voted: true, profiles: { full_name: 'Premium Preview', email: 'preview+premium@tripedge.ai', avatar_url: null } },
    { id: 'gm2', user_id: 'friend-1', role: 'member', destination_vote: 'Lisbon', date_vote: 'Jun 19-23', budget: 1500, has_voted: true, profiles: { full_name: 'Maya Chen', email: 'maya@example.com', avatar_url: null } },
    { id: 'gm3', user_id: 'friend-2', role: 'member', destination_vote: 'Porto', date_vote: 'Jul 10-14', budget: 1300, has_voted: true, profiles: { full_name: 'Jordan Reed', email: 'jordan@example.com', avatar_url: null } },
  ]},
  { id: 'preview-group-tokyo', creator_id: 'preview-pro', name: 'Tokyo Food Run', invite_code: 'RAMEN88', destination_options: ['Tokyo', 'Osaka'], date_options: ['Sep 4-9', 'Sep 18-23'], ai_recommendation: 'Tokyo on Sep 4-9 keeps the flight window cheaper while preserving the group’s food-first priorities.', group_members: [
    { id: 'gm4', user_id: 'preview-pro', role: 'creator', destination_vote: 'Tokyo', date_vote: 'Sep 4-9', budget: 2600, has_voted: true, profiles: { full_name: 'Pro Preview', email: 'preview+pro@tripedge.ai', avatar_url: null } },
    { id: 'gm5', user_id: 'friend-3', role: 'member', destination_vote: 'Tokyo', date_vote: 'Sep 18-23', budget: 2400, has_voted: true, profiles: { full_name: 'Nina Park', email: 'nina@example.com', avatar_url: null } },
  ]},
];

const PREVIEW_ALERTS = [{ id: 'alert-1', route_id: 'route-lisbon', target_price: 540, alert_on_any_drop: false, is_active: true, created_at: '2026-03-15T12:00:00Z', routes: { id: 'route-lisbon', origin: 'NYC', destination: 'LIS', route_type: 'flight' } }];

const PREVIEW_SPOTS = [
  { id: 'spot-1', name: 'O Velho Eurico', city: 'Lisbon', country: 'Portugal', source_platform: 'instagram', source_url: 'https://example.com/ovelhoeurico', source_note: 'Saved from a chef recommendation roundup.', category: 'food', thumbnail_url: null, metadata: { collection: 'Lisbon eats' }, created_at: '2026-03-15T14:00:00Z' },
  { id: 'spot-2', name: 'Miradouro de Santa Luzia', city: 'Lisbon', country: 'Portugal', source_platform: 'tiktok', source_url: 'https://example.com/santaluzia', source_note: 'Sunrise viewpoint idea.', category: 'gem', thumbnail_url: null, metadata: { collection: 'Scenic stops' }, created_at: '2026-03-14T11:30:00Z' },
];

const PREVIEW_EXPENSES = [
  { id: 'expense-1', group_trip_id: 'preview-group-lisbon', paid_by_user_id: 'preview-premium', description: 'Airbnb deposit', amount: 420, currency: 'USD', category: 'lodging', split_type: 'equal', split_details: null, expense_date: '2026-03-14' },
  { id: 'expense-2', group_trip_id: 'preview-group-lisbon', paid_by_user_id: 'friend-1', description: 'Dinner reservation hold', amount: 90, currency: 'USD', category: 'food', split_type: 'equal', split_details: null, expense_date: '2026-03-15' },
];

const PREVIEW_PRICE_HISTORY = {
  route: { id: 'route-lisbon', origin: 'NYC', destination: 'LIS', route_type: 'flight' },
  history: [
    { month: '2025-10-01', avg_price: 782, min_price: 710, max_price: 865, sample_count: 48, updated_at: '2026-03-01T00:00:00Z' },
    { month: '2025-11-01', avg_price: 744, min_price: 690, max_price: 812, sample_count: 44, updated_at: '2026-03-01T00:00:00Z' },
    { month: '2025-12-01', avg_price: 801, min_price: 735, max_price: 920, sample_count: 51, updated_at: '2026-03-01T00:00:00Z' },
    { month: '2026-01-01', avg_price: 698, min_price: 640, max_price: 780, sample_count: 57, updated_at: '2026-03-01T00:00:00Z' },
    { month: '2026-02-01', avg_price: 662, min_price: 618, max_price: 725, sample_count: 63, updated_at: '2026-03-01T00:00:00Z' },
    { month: '2026-03-01', avg_price: 641, min_price: 589, max_price: 700, sample_count: 39, updated_at: '2026-03-01T00:00:00Z' },
  ],
};

export function getPreviewTierFromCookieStore(cookieStore) {
  const raw = cookieStore.get(PREVIEW_COOKIE)?.value;
  if (!raw) return null;
  const tier = String(raw).toLowerCase();
  return ALLOWED_TIERS.has(tier) ? tier : null;
}

export function getPreviewProfile(tier = 'free') {
  const normalizedTier = ALLOWED_TIERS.has(String(tier).toLowerCase()) ? String(tier).toLowerCase() : 'free';
  return {
    id: `preview-${normalizedTier}`,
    email: `preview+${normalizedTier}@tripedge.ai`,
    tier: normalizedTier,
    full_name: `${normalizedTier[0].toUpperCase()}${normalizedTier.slice(1)} Preview`,
    home_airport: normalizedTier === 'premium' ? 'MCO' : 'NYC',
    isPreview: true,
  };
}

export function isPreviewCookie(name) {
  return name === PREVIEW_COOKIE;
}

export function getPreviewItinerary(query = '') {
  return { ...PREVIEW_ITINERARY, tagline: query ? `Preview itinerary for ${String(query).trim()} with local-first pacing and hidden-gem emphasis.` : PREVIEW_ITINERARY.tagline };
}

export function getPreviewGroups(tier = 'free') {
  return tier === 'free' ? [PREVIEW_GROUP_TRIPS[0]] : PREVIEW_GROUP_TRIPS;
}

export function getPreviewGroupById(id) {
  return PREVIEW_GROUP_TRIPS.find((trip) => trip.id === id) || PREVIEW_GROUP_TRIPS[0];
}

export function getPreviewAlerts() {
  return PREVIEW_ALERTS;
}

export function getPreviewSavedSpots() {
  return PREVIEW_SPOTS;
}

export function getPreviewExpenses(groupTripId) {
  return PREVIEW_EXPENSES.filter((expense) => !groupTripId || expense.group_trip_id === groupTripId);
}

export function getPreviewPriceHistory() {
  return PREVIEW_PRICE_HISTORY;
}

export { PREVIEW_COOKIE, ALLOWED_TIERS };
