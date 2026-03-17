import './globals.css';

export const metadata = {
  title: 'TripEdge AI — Travel Smarter, Not Cheaper',
  description: 'AI-powered travel deals, hidden-gem itineraries, and group trip coordination. Find mispriced flights and hotels before anyone else.',
  openGraph: {
    title: 'TripEdge AI',
    description: 'AI-powered travel deals, itineraries, and group trip coordination.',
    siteName: 'TripEdge AI',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,400;1,500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-cream-50 font-body text-earth-900">
        {children}
      </body>
    </html>
  );
}
