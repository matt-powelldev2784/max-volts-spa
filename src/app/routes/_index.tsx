import Homepage from '@/components/homepage/homepage';
import { useEffect } from 'react';

export default function HomePage() {
  // Set body background to black for homepage only
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const previousThemeColor = meta?.getAttribute('content') ?? '';
    const previousBodyBackground = document.body.style.backgroundColor;

    if (meta) meta.setAttribute('content', '#212121');
    document.body.style.backgroundColor = '#212121';

    return () => {
      if (meta) meta.setAttribute('content', previousThemeColor);
      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, []);

  return <Homepage />;
}
