import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem('theme') as Theme;
  if (stored) {
    applyTheme(stored);
    return stored;
  }
  
  // Device or Browser in dark theme or no
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(isDark ? 'dark' : 'light');
  return isDark ? 'dark' : 'light';
};

// Apply theme to document root
const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  let effectiveTheme = theme;

  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const themeColors = {
    dark: {
      '--bg-dark': '#121212',
      '--sidebar-bg': '#1E1E1E',
      '--card-bg': '#2E2E2E',
      '--accent': '#3A3A3A',
      '--text-light': '#E0E0E0',
      '--border-color': '#444444',
    },
    light: {
      '--bg-dark': '#ffffff',
      '--sidebar-bg': '#f8f9fa',
      '--card-bg': '#ffffff',
      '--accent': '#e9ecef',
      '--text-light': '#212529',
      '--border-color': '#dee2e6',
    }
  };

  const colors = effectiveTheme === 'dark' ? themeColors.dark : themeColors.light;
  Object.entries(colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

const initialTheme = getInitialTheme();

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme(theme);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}