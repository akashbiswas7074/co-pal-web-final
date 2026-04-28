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

export function useNavbarSettings() {
  const [settings, setSettings] = useState<NavbarSettingsData>({
    backgroundType: 'blur',
    backgroundColorValue: '#1a0a2c',
    backgroundGradientValue: 'linear-gradient(to right, #1a0a2c, #4a192c)',
    blurOpacity: 40,
    desktopLayout: 'inline',
    textColor: '#ffffff',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/navbar-settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
          setSettings(data.settings);
        } else {
          setError(data.message || 'Failed to load navbar settings');
        }
      } catch (err) {
        console.error('Error fetching navbar settings:', err);
        setError('An unexpected error occurred while fetching navbar settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
