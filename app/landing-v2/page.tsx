'use client';

import LandingPageV2 from '@/components/LandingPageV2';

export default function LandingV2Preview() {
  return (
    <LandingPageV2
      onImport={() => alert('Import flow would open here')}
      onLoadSample={() => alert('Sample library would load here')}
    />
  );
}
