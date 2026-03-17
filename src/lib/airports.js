export const AIRPORT_DIRECTORY = [
  { code: 'ATL', city: 'Atlanta', country: 'United States', name: 'Hartsfield-Jackson Atlanta International' },
  { code: 'AUS', city: 'Austin', country: 'United States', name: 'Austin-Bergstrom International' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi' },
  { code: 'BOS', city: 'Boston', country: 'United States', name: 'Logan International' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', name: 'Cape Town International' },
  { code: 'DEN', city: 'Denver', country: 'United States', name: 'Denver International' },
  { code: 'DFW', city: 'Dallas', country: 'United States', name: 'Dallas Fort Worth International' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International' },
  { code: 'EWR', city: 'Newark', country: 'United States', name: 'Newark Liberty International' },
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci–Fiumicino' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'GRU', city: 'Sao Paulo', country: 'Brazil', name: 'Sao Paulo/Guarulhos International' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda' },
  { code: 'IAD', city: 'Washington', country: 'United States', name: 'Dulles International' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy International' },
  { code: 'LAS', city: 'Las Vegas', country: 'United States', name: 'Harry Reid International' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International' },
  { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', name: 'Humberto Delgado' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Adolfo Suarez Madrid-Barajas' },
  { code: 'MCO', city: 'Orlando', country: 'United States', name: 'Orlando International' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Benito Juarez International' },
  { code: 'MIA', city: 'Miami', country: 'United States', name: 'Miami International' },
  { code: 'MSP', city: 'Minneapolis', country: 'United States', name: 'Minneapolis-Saint Paul International' },
  { code: 'ORD', city: 'Chicago', country: 'United States', name: "O'Hare International" },
  { code: 'PHX', city: 'Phoenix', country: 'United States', name: 'Phoenix Sky Harbor International' },
  { code: 'SAN', city: 'San Diego', country: 'United States', name: 'San Diego International' },
  { code: 'SEA', city: 'Seattle', country: 'United States', name: 'Seattle-Tacoma International' },
  { code: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montreal-Trudeau International' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
];

export function findAirportMatches(query, limit = 8) {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) return [];

  return AIRPORT_DIRECTORY
    .filter((airport) => {
      return (
        airport.code.toLowerCase().includes(normalized) ||
        airport.city.toLowerCase().includes(normalized) ||
        airport.name.toLowerCase().includes(normalized) ||
        airport.country.toLowerCase().includes(normalized)
      );
    })
    .slice(0, limit);
}

export function getAirportByCode(code) {
  const normalized = String(code || '').trim().toUpperCase();
  return AIRPORT_DIRECTORY.find((airport) => airport.code === normalized) || null;
}
