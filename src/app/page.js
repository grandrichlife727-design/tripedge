import { Nav } from '@/components/layout/Nav';
import { LandingPage } from '@/components/marketing/LandingPage';

export default function HomePage() {
  return (
    <>
      <Nav mode="marketing" />
      <LandingPage />
    </>
  );
}
