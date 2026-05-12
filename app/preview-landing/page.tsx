'use client';

import { useRouter } from 'next/navigation';
import LandingPageV2 from '@/components/LandingPageV2';

export default function LandingRoute() {
  const router = useRouter();
  const goToApp = () => router.push('/');

  return <LandingPageV2 onImport={goToApp} onLoadSample={goToApp} />;
}
