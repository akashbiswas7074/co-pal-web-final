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

const defaultFooterSettings: FooterSettingsData = {
  backgroundType: 'mesh',
  backgroundColorValue: '#111827',
  backgroundGradientValue: 'linear-gradient(to right, #111827, #1f2937)',
  blurOpacity: 40,
  textColor: '#ffffff',
};

// Global in-memory cache to prevent redundant fetches across all footer subcomponents
let cachedSettings: FooterSettingsData | null = null;
let activeFetchPromise: Promise<FooterSettingsData | null> | null = null;

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettingsData>(() => cachedSettings || defaultFooterSettings);
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
          const response = await fetch('/api/footer-settings');
          const data = await response.json();
          if (data.success && data.settings) {
            cachedSettings = data.settings;
            return data.settings;
          }
        } catch (err: any) {
          console.error("Error fetching footer settings in hook:", err);
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
      setError(err?.message || "Failed to load footer settings");
      setLoading(false);
    });
  }, []);

  return { settings, loading, error };
}
