import { useEffect, useState } from 'react';

export interface NavbarSettingsData {
  _id?: string;
  backgroundType: 'solid' | 'gradient' | 'blur';
  backgroundColorValue: string;
  backgroundGradientValue: string;
  blurOpacity: number;
  desktopLayout: 'inline' | 'menu';
  textColor: string;
}

const defaultNavbarSettings: NavbarSettingsData = {
  backgroundType: 'blur',
  backgroundColorValue: '#1a0a2c',
  backgroundGradientValue: 'linear-gradient(to right, #1a0a2c, #4a192c)',
  blurOpacity: 40,
  desktopLayout: 'inline',
  textColor: '#ffffff',
};

// Global in-memory cache to prevent redundant fetches across all navbar components
let cachedSettings: NavbarSettingsData | null = null;
let activeFetchPromise: Promise<NavbarSettingsData | null> | null = null;

export function useNavbarSettings() {
  const [settings, setSettings] = useState<NavbarSettingsData>(() => cachedSettings || defaultNavbarSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = (async () => {
        try {
          const response = await fetch('/api/navbar-settings');
          const data = await response.json();
          if (data.success && data.settings) {
            cachedSettings = data.settings;
            return data.settings;
          }
        } catch (err) {
          console.error('Error fetching navbar settings:', err);
        }
        return null;
      })();
    }

    activeFetchPromise.then((result) => {
      if (result) {
        setSettings(result);
      }
      setLoading(false);
    }).catch((err) => {
      setError(err?.message || 'Failed to load navbar settings');
      setLoading(false);
    });
  }, []);

  return { settings, loading, error };
}
