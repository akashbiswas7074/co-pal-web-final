import { useState, useEffect } from 'react';

type OrderCountsResponse = {
  [productId: string]: number;
};

// Global in-memory cache to prevent redundant network fetches
let cachedCounts: Record<string, number> | null = null;
let activeFetchPromise: Promise<Record<string, number> | null> | null = null;

/**
 * Custom hook to fetch order counts for products
 * Uses the 'sold' field from product schema
 */
export function useProductOrderCounts() {
  const [counts, setCounts] = useState<Record<string, number>>(() => cachedCounts || {});
  const [loading, setLoading] = useState<boolean>(!cachedCounts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCounts) {
      setCounts(cachedCounts);
      setLoading(false);
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = (async () => {
        try {
          const response = await fetch('/api/products/order-counts');
          if (!response.ok) {
            throw new Error('Failed to fetch product order counts');
          }
          const data: OrderCountsResponse = await response.json();
          const filteredCounts = Object.entries(data).reduce((acc, [id, count]) => {
            if (count > 0) {
              acc[id] = count;
            }
            return acc;
          }, {} as Record<string, number>);
          cachedCounts = filteredCounts;
          return filteredCounts;
        } catch (err) {
          console.error('Error fetching product order counts:', err);
          return null;
        }
      })();
    }

    activeFetchPromise.then(res => {
      if (res) {
        setCounts(res);
      }
      setLoading(false);
    }).catch(err => {
      setError(err?.message || 'Unknown error');
      setLoading(false);
    });
  }, []);

  return { counts, loading, error };
}