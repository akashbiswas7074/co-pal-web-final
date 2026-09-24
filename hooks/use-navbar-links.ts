import { useEffect, useState } from 'react';

interface NavbarLink {
  _id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
}

// Global in-memory cache to prevent redundant fetches
let cachedLinks: NavbarLink[] | null = null;
let activeFetchPromise: Promise<NavbarLink[] | null> | null = null;

export function useNavbarLinks() {
  const [links, setLinks] = useState<NavbarLink[]>(() => cachedLinks || []);
  const [loading, setLoading] = useState(!cachedLinks);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedLinks) {
      setLinks(cachedLinks);
      setLoading(false);
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = (async () => {
        try {
          const response = await fetch('/api/navbar-links');
          const data = await response.json();
          if (data.success && data.navbarLinks) {
            const sortedLinks = data.navbarLinks.sort((a: NavbarLink, b: NavbarLink) => a.order - b.order);
            const activeLinks = sortedLinks.filter((link: NavbarLink) => link.isActive);
            cachedLinks = activeLinks;
            return activeLinks;
          }
        } catch (err) {
          console.error('Error fetching navbar links:', err);
        }
        return null;
      })();
    }

    activeFetchPromise.then((result) => {
      if (result) {
        setLinks(result);
      }
      setLoading(false);
    }).catch((err) => {
      setError(err?.message || 'Failed to load navigation links');
      setLoading(false);
    });
  }, []);

  return { links, loading, error };
}