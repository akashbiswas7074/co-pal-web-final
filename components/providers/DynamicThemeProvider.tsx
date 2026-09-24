"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  customCSS: string;
  darkMode: boolean;
}

interface ThemeContextType {
  theme: ThemeSettings | null;
  loading: boolean;
  error: string | null;
  refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  loading: true,
  error: null,
  refreshTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface DynamicThemeProviderProps {
  children: ReactNode;
}

let cachedTheme: ThemeSettings | null = null;
let activeThemePromise: Promise<ThemeSettings | null> | null = null;

export default function DynamicThemeProvider({ children }: DynamicThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeSettings | null>(() => cachedTheme);
  const [loading, setLoading] = useState(!cachedTheme);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = async () => {
    if (cachedTheme) {
      setTheme(cachedTheme);
      applyThemeToDOM(cachedTheme);
      setLoading(false);
      return;
    }

    if (!activeThemePromise) {
      activeThemePromise = (async () => {
        try {
          const response = await fetch('/api/website/theme');
          const data = await response.json();
          if (data.success && data.theme) {
            cachedTheme = data.theme;
            return data.theme;
          }
        } catch (err) {
          console.error('Error fetching theme:', err);
        }
        return null;
      })();
    }

    try {
      setError(null);
      const res = await activeThemePromise;
      if (res) {
        setTheme(res);
        applyThemeToDOM(res);
      } else {
        setError('Failed to load theme settings');
      }
    } catch (err) {
      setError('Error loading theme');
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToDOM = (themeSettings: ThemeSettings) => {
    // Apply CSS custom properties to the root element
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--secondary-color', themeSettings.secondaryColor);
    root.style.setProperty('--accent-color', themeSettings.accentColor);
    root.style.setProperty('--background-color', themeSettings.backgroundColor);
    root.style.setProperty('--text-color', themeSettings.textColor);
    root.style.setProperty('--border-radius', themeSettings.borderRadius);
    
    // Apply font family
    root.style.setProperty('--font-family', themeSettings.fontFamily);
    
    // Apply dark mode class - default to light mode if not specified
    const shouldUseDarkMode = themeSettings.darkMode !== undefined ? themeSettings.darkMode : false;
    if (shouldUseDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply custom CSS if provided
    if (themeSettings.customCSS) {
      let customStyleElement = document.getElementById('dynamic-custom-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'dynamic-custom-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = themeSettings.customCSS;
    }

    // Update meta theme-color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = themeSettings.primaryColor;
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const refreshTheme = () => {
    setLoading(true);
    fetchTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, error, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}