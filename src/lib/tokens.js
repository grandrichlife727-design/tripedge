// ============================================
// TripEdge AI — Design Tokens
// Single source of truth for all styling
// ============================================

export const colors = {
  // Backgrounds
  pageBg: '#FDFBF7',
  surfaceAlt: '#F7F3EC',
  surface: '#F0EBE1',
  border: '#EDE8DD',
  borderLight: '#F0EBE1',
  muted: '#D4C9B5',

  // Text
  textPrimary: '#2C2418',
  textSecondary: '#8C7E6A',
  textMuted: '#A89E8C',
  textFeature: '#5C5142',

  // Accents
  teal: '#2A9D8F',
  tealLight: '#E8F5EE',
  tealBorder: '#C5E8D4',

  ocean: '#1A6DAD',
  oceanLight: '#E6F2FA',
  oceanBorder: '#C0DDF2',

  success: '#1B7340',
  successLight: '#E8F5EE',

  warning: '#D4600E',
  warningLight: '#FEF0E7',
  warningBorder: '#FADCC8',

  gold: '#8B6914',
  goldMuted: '#A67C00',
  goldLight: '#FFF8E6',
  goldBorder: '#FFF0BF',

  // Status
  statusHot: '#D4600E',
  statusWarm: '#A67C00',
  statusWatch: '#6B7C85',
};

export const fonts = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Outfit', 'Avenir Next', system-ui, sans-serif",
};

export const radii = {
  card: 16,
  button: 12,
  badge: 20,
  section: 28,
  input: 12,
  nav: 10,
};

export const shadows = {
  card: '0 8px 32px rgba(44, 36, 24, 0.08)',
  cardHover: '0 12px 32px rgba(44, 36, 24, 0.10)',
  cardElevated: '0 16px 40px rgba(44, 36, 24, 0.10)',
  button: '0 4px 16px rgba(42, 157, 143, 0.25)',
  buttonHover: '0 8px 28px rgba(42, 157, 143, 0.35)',
  navPill: '0 1px 4px rgba(44, 36, 24, 0.08)',
  popular: '0 12px 40px rgba(42, 157, 143, 0.12)',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #2A9D8F, #1A6DAD)',
  hero: 'linear-gradient(135deg, #FDFBF7 0%, #E8F5EE 40%, #E6F2FA 70%, #FDFBF7 100%)',
  cta: 'linear-gradient(135deg, #E8F5EE, #E6F2FA)',
  progress: 'linear-gradient(90deg, #2A9D8F, #1A6DAD)',
};

// Urgency / badge styles
export const badgeStyles = {
  hot: { bg: '#FEF0E7', color: '#D4600E', border: '#FADCC8' },
  warm: { bg: '#FFF8E6', color: '#A67C00', border: '#FFF0BF' },
  watch: { bg: '#F0F4F5', color: '#6B7C85', border: '#DDE4E8' },
  drop: { bg: '#E8F5EE', color: '#1B7340', border: '#C5E8D4' },
  low: { bg: '#E6F2FA', color: '#1A6DAD', border: '#C0DDF2' },
  deal: { bg: '#FEF0E7', color: '#D4600E', border: '#FADCC8' },
};

// Itinerary type icons and colors
export const typeConfig = {
  gem: { emoji: '✦', color: '#8B6914' },
  food: { emoji: '🍜', color: '#D4600E' },
  culture: { emoji: '🏛', color: '#1A6DAD' },
  adventure: { emoji: '⛰', color: '#1B7340' },
  relax: { emoji: '☀', color: '#A67C00' },
};
