'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

const THEME_CLASSES = ['theme-90s', 'theme-80s', 'theme-future', 'theme-light', 'theme-dino', 'theme-weird', 'theme-ultra', 'theme-void', 'theme-cozy', 'theme-minimal', 'theme-tropical', 'theme-campfire', 'theme-poster'];

export default function ThemeClass() {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    const cls = `theme-${theme}`;
    if (THEME_CLASSES.includes(cls)) {
      document.body.classList.add(cls);
    }
    return () => {
      THEME_CLASSES.forEach((c) => document.body.classList.remove(c));
    };
  }, [theme]);

  return null;
}
