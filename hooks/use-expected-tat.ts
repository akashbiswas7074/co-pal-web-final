import { useState, useEffect } from 'react';

interface ExpectedTatData {
  expected_tat: string;
  expected_delivery_date: string;
  pickup_date: string;
  fallback?: boolean;
  error?: string;
  raw_response?: any;
}

interface ExpectedTatResponse {
  success: boolean;
  data?: ExpectedTatData;
  error?: string;
}

interface UseExpectedTatParams {
  origin_pin?: string;
  destination_pin?: string;
  mot?: 'S' | 'E'; // Surface or Express
  pdt?: 'B2C' | 'B2B';
  expected_pickup_date?: string;
  enabled?: boolean; // Whether to auto-fetch
}

// Helper function to get default pickup date (1 day from now)
const getDefaultPickupDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export const useExpectedTat = ({
  origin_pin = process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || '700001',
  destination_pin,
  mot = 'S',
  pdt = 'B2C', // Always B2C for e-commerce
  expected_pickup_date,
  enabled = true
}: UseExpectedTatParams) => {
  const [data, setData] = useState<ExpectedTatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpectedTat = async () => {
    if (!destination_pin) {
      setError('Destination pin code is required');
      return;
    }

    if (!origin_pin) {
      setError('Origin pin code is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        origin_pin,
        destination_pin,
        mot,
        pdt,
        expected_pickup_date: expected_pickup_date || getDefaultPickupDate()
      });

      const url = `/api/delivery/expected-tat?${params}`;
      console.log('[useExpectedTat] Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[useExpectedTat] Response status:', response.status);

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 405) {
          throw new Error('API endpoint does not support the requested method');
        }
        if (response.status === 404) {
          throw new Error('Expected TAT API endpoint not found');
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Invalid request parameters');
        }
        if (response.status >= 500) {
          throw new Error('Server error occurred while fetching delivery time');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ExpectedTatResponse = await response.json();
      console.log('[useExpectedTat] API response:', result);

      if (result.success && result.data) {
        setData(result.data);
        
        // Only set error if it's not a fallback response
        if (result.data.fallback && result.data.error) {
          setError(`Using fallback data: ${result.data.error}`);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch expected delivery time');
      }
    } catch (err: any) {
      console.error('[useExpectedTat] Error:', err);
      setError(err.message || 'Failed to fetch expected delivery time');
      
      // Always set fallback data on error to ensure UI still works
      setData({
        expected_tat: "3-7 business days",
        expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pickup_date: expected_pickup_date || getDefaultPickupDate(),
        fallback: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && origin_pin && destination_pin) {
      fetchExpectedTat();
    }
  }, [origin_pin, destination_pin, mot, pdt, expected_pickup_date, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchExpectedTat
  };
};

// Helper function to format expected TAT for display
export const formatExpectedTat = (expectedTat: any): string => {
  if (!expectedTat) return 'Standard delivery';
  
  // Convert to string if not already
  const tatString = String(expectedTat);
  
  // If it's already formatted, return as is
  if (tatString.includes('business days') || tatString.includes('days')) {
    return tatString;
  }
  
  // Try to parse if it's a number
  const days = parseInt(tatString);
  if (!isNaN(days)) {
    return `${days} business day${days > 1 ? 's' : ''}`;
  }
  
  return tatString;
};

// Helper function to format delivery date
export const formatDeliveryDate = (deliveryDate: any): string => {
  if (!deliveryDate) return '';
  
  try {
    const date = new Date(deliveryDate);
    if (isNaN(date.getTime())) return String(deliveryDate);
    
    // Format as "Monday, Dec 25" for better readability
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return String(deliveryDate);
  }
};

// Helper function to get a more user-friendly delivery message
export const getDeliveryMessage = (tatData: any): string => {
  if (!tatData) return '';
  
  const { expected_tat, expected_delivery_date } = tatData;
  
  if (expected_delivery_date) {
    const formattedDate = formatDeliveryDate(expected_delivery_date);
    if (formattedDate) {
      return `Expected delivery by ${formattedDate}`;
    }
  }
  
  // Fallback to TAT if no specific date
  return `Expected delivery: ${formatExpectedTat(expected_tat)}`;
};

// Helper function to check if delivery is express
export const isExpressDelivery = (mot: string): boolean => {
  return mot === 'E';
};

// Helper function to get delivery type display text
export const getDeliveryTypeText = (mot: string): string => {
  return mot === 'E' ? 'Express Delivery' : 'Standard Delivery';
};

// Helper function to calculate estimated delivery date from TAT
export const calculateEstimatedDeliveryDate = (tat: string, pickupDate?: string): string => {
  try {
    const days = parseInt(tat);
    if (isNaN(days)) return '';
    
    const startDate = pickupDate ? new Date(pickupDate) : new Date();
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(startDate.getDate() + days);
    
    return deliveryDate.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};
