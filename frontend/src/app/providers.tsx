'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SystemThemeProvider } from '@/context/SystemThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <SystemThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </SystemThemeProvider>
    </ThemeProvider>
  );
}
