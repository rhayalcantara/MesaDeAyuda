'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface SystemTheme {
  colorPrimario: string;
  colorSecundario: string;
  nombreSistema: string;
  logoUrl: string;
}

interface SystemThemeContextType {
  systemTheme: SystemTheme;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

const defaultTheme: SystemTheme = {
  colorPrimario: '#2563eb',
  colorSecundario: '#64748b',
  nombreSistema: 'MDAyuda',
  logoUrl: '',
};

const SystemThemeContext = createContext<SystemThemeContextType | undefined>(undefined);

// Helper to generate color shades
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function applyThemeColors(theme: SystemTheme) {
  const root = document.documentElement;

  // Apply primary color and generate shades
  const primary = hexToHSL(theme.colorPrimario);
  root.style.setProperty('--color-primary', theme.colorPrimario);
  root.style.setProperty('--color-primary-50', `hsl(${primary.h}, ${primary.s}%, 95%)`);
  root.style.setProperty('--color-primary-100', `hsl(${primary.h}, ${primary.s}%, 90%)`);
  root.style.setProperty('--color-primary-200', `hsl(${primary.h}, ${primary.s}%, 80%)`);
  root.style.setProperty('--color-primary-300', `hsl(${primary.h}, ${primary.s}%, 70%)`);
  root.style.setProperty('--color-primary-400', `hsl(${primary.h}, ${primary.s}%, 60%)`);
  root.style.setProperty('--color-primary-500', theme.colorPrimario);
  root.style.setProperty('--color-primary-600', `hsl(${primary.h}, ${primary.s}%, 40%)`);
  root.style.setProperty('--color-primary-700', `hsl(${primary.h}, ${primary.s}%, 30%)`);
  root.style.setProperty('--color-primary-800', `hsl(${primary.h}, ${primary.s}%, 20%)`);
  root.style.setProperty('--color-primary-900', `hsl(${primary.h}, ${primary.s}%, 10%)`);

  // Apply secondary color
  const secondary = hexToHSL(theme.colorSecundario);
  root.style.setProperty('--color-secondary', theme.colorSecundario);
  root.style.setProperty('--color-secondary-50', `hsl(${secondary.h}, ${secondary.s}%, 95%)`);
  root.style.setProperty('--color-secondary-100', `hsl(${secondary.h}, ${secondary.s}%, 90%)`);
  root.style.setProperty('--color-secondary-500', theme.colorSecundario);
  root.style.setProperty('--color-secondary-600', `hsl(${secondary.h}, ${secondary.s}%, 40%)`);
  root.style.setProperty('--color-secondary-700', `hsl(${secondary.h}, ${secondary.s}%, 30%)`);
}

export function SystemThemeProvider({ children }: { children: ReactNode }) {
  const [systemTheme, setSystemTheme] = useState<SystemTheme>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchTheme = async () => {
    try {
      const response = await api.get('/configuracion/tema');
      setSystemTheme(response.data);
      if (mounted) {
        applyThemeColors(response.data);
      }
    } catch (error) {
      console.error('Error fetching system theme:', error);
      // Use defaults on error
      if (mounted) {
        applyThemeColors(defaultTheme);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTheme();
  }, []);

  useEffect(() => {
    if (mounted && systemTheme) {
      applyThemeColors(systemTheme);
    }
  }, [mounted, systemTheme]);

  const refreshTheme = async () => {
    await fetchTheme();
  };

  if (!mounted) {
    return null;
  }

  return (
    <SystemThemeContext.Provider value={{ systemTheme, loading, refreshTheme }}>
      {children}
    </SystemThemeContext.Provider>
  );
}

export function useSystemTheme() {
  const context = useContext(SystemThemeContext);
  if (context === undefined) {
    throw new Error('useSystemTheme must be used within a SystemThemeProvider');
  }
  return context;
}
