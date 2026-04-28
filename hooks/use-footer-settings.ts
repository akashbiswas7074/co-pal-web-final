"use client";

import { useState, useEffect } from 'react';

export interface FooterSettingsData {
  _id?: string;
  backgroundType: 'solid' | 'gradient' | 'mesh' | 'blur';
  backgroundColorValue: string;
  backgroundGradientValue: string;
  blurOpacity: number;
  textColor: string;
}

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettingsData>({
    backgroundType: 'mesh',
    backgroundColorValue: '#111827',
    backgroundGradientValue: 'linear-gradient(to right, #111827, #1f2937)',
    blurOpacity: 40,
    textColor: '#ffffff',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/footer-settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching footer settings in hook:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
