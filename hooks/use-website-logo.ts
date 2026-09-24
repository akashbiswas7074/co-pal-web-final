"use client";

import { useState, useEffect } from "react";
import { useSiteConfig } from "./use-site-config";

interface WebsiteLogo {
  _id?: string;
  name: string;
  logoUrl: string;
  altText: string;
  isActive: boolean;
  mobileLogoUrl?: string;
  authBackgroundUrl?: string;
}

interface UseWebsiteLogoResult {
  logo: WebsiteLogo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global in-memory cache to prevent redundant fetches
let cachedLogo: WebsiteLogo | null = null;
let activeFetchPromise: Promise<WebsiteLogo | null> | null = null;

export function useWebsiteLogo(): UseWebsiteLogoResult {
  const siteConfig = useSiteConfig();

  const [logo, setLogo] = useState<WebsiteLogo | null>(() => cachedLogo || ({
    name: siteConfig.name,
    logoUrl: siteConfig.logo.imagePath,
    altText: siteConfig.name,
    isActive: true,
  }));

  const [isLoading, setIsLoading] = useState<boolean>(!cachedLogo);
  const [error, setError] = useState<string | null>(null);

  const fetchLogo = async () => {
    if (cachedLogo) {
      setLogo(cachedLogo);
      setIsLoading(false);
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = (async () => {
        try {
          const response = await fetch("/api/website/logo");
          if (!response.ok) return null;
          const data = await response.json();
          if (data.success && data.logo) {
            cachedLogo = data.logo;
            return data.logo;
          } else if (data.defaultLogo) {
            cachedLogo = data.defaultLogo;
            return data.defaultLogo;
          }
        } catch (err: any) {
          console.error("Error fetching website logo:", err);
        }
        return null;
      })();
    }

    activeFetchPromise.then((result) => {
      if (result) {
        setLogo(result);
      }
      setIsLoading(false);
    }).catch((err) => {
      setError(`Error: ${err?.message}`);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  return { logo, isLoading, error, refetch: fetchLogo };
}

export default useWebsiteLogo;