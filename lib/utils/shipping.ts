import { delhiveryApi } from './delivery-partner';
import { getActiveWebsiteSettings } from '@/lib/database/actions/website.settings.actions';

// Shipping calculation utilities

export const SHIPPING_CONFIG = {
  DEFAULT_SHIPPING_CHARGE: 48, // ₹48 default shipping charge (fallback)
  WAREHOUSE_PINCODE: process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || '700001', // Default warehouse pincode
  DEFAULT_WEIGHT_GRAMS: 500, // Default weight in grams
  DEFAULT_DIMENSIONS: {
    length_cm: 20,
    width_cm: 15,
    height_cm: 10,
    box_count: 1
  }
} as const;

/**
 * Calculate shipping charge using Delhivery API (Server-side only)
 * @param destinationPincode - Destination pincode
 * @param totalWeight - Total weight in grams (optional)
 * @param totalValue - Total order value (optional)
 * @param paymentMode - Payment mode ('prepaid' or 'cod')
 * @returns Promise<{cost: number, error?: string}> - shipping charge and error if any
 */
export async function calculateDelhiveryShippingServer(
  destinationPincode: string,
  totalWeight?: number,
  totalValue?: number,
  paymentMode: 'prepaid' | 'cod' = 'prepaid'
): Promise<{cost: number, error?: string}> {
  try {
    const params = {
      dimensions: [SHIPPING_CONFIG.DEFAULT_DIMENSIONS],
      weight_g: totalWeight || SHIPPING_CONFIG.DEFAULT_WEIGHT_GRAMS,
      source_pin: SHIPPING_CONFIG.WAREHOUSE_PINCODE,
      consignee_pin: destinationPincode,
      payment_mode: paymentMode,
      inv_amount: totalValue || 1000
    };

    // Determine if this should be a B2B or B2C shipment based on weight
    const isB2B = params.weight_g >= 20000; // 20kg threshold

    let result;
    if (isB2B) {
      const b2bParams = {
        ...params,
        freight_mode: 'surface' as const,
        cheque_payment: false,
        rov_insurance: false
      };
      result = await delhiveryApi.getB2BFreightEstimate(b2bParams);
    } else {
      result = await delhiveryApi.getB2CFreightEstimate(params);
    }

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.total || result.total <= 0) {
      throw new Error('Invalid shipping cost received from Delhivery API');
    }

    return { cost: result.total };
  } catch (error) {
    console.error('Error calculating Delhivery shipping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping cost';
    throw new Error(`Unable to calculate shipping cost: ${errorMessage}`);
  }
}

/**
 * Calculate shipping charge using Delhivery Kinko API (Client-side version)
 * @param destinationPincode - Destination pincode
 * @param totalWeight - Total weight in grams (optional)
 * @param paymentMode - Payment mode ('Pre-paid' or 'COD')
 * @returns Promise<{cost: number, error?: string}> - shipping charge and error if any
 */
export async function calculateDelhiveryShipping(
  destinationPincode: string,
  totalWeight?: number,
  paymentMode: 'Pre-paid' | 'COD' = 'Pre-paid',
  totalValue?: number
): Promise<{cost: number, error?: string}> {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    try {
      const params = {
        destinationPincode,
        originPincode: SHIPPING_CONFIG.WAREHOUSE_PINCODE,
        weight: totalWeight || SHIPPING_CONFIG.DEFAULT_WEIGHT_GRAMS,
        paymentMode,
        totalValue,
        shippingService: 'E' // Express service
      };

      const response = await fetch('/api/delivery/shipping-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate shipping cost');
      }

      if (data.cost === 0 && data.isFreeShipping) {
        return { cost: 0 };
      }

      if (!data.cost || data.cost <= 0) {
        throw new Error('Invalid shipping cost received from API');
      }

      return { cost: data.cost };
    } catch (error) {
      console.error('Error calculating Delhivery shipping:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping cost';
      return { cost: 0, error: errorMessage };
    }
  } else {
    // Server-side: convert payment mode and call server function
    const serverPaymentMode = paymentMode === 'Pre-paid' ? 'prepaid' : 'cod';
    return calculateDelhiveryShippingServer(destinationPincode, totalWeight, totalValue, serverPaymentMode);
  }
}

/**
 * Calculate shipping charge based on order value (legacy function - now returns 0 until API call)
 * @param itemsPrice - Total price of items in the cart
 * @returns shipping charge amount
 */
export function calculateShippingCharge(itemsPrice: number): number {
  // Return 0 - actual shipping will be calculated via API
  return 0;
}

/**
 * Check if order qualifies for free shipping based on active website settings
 * @param itemsPrice - Total price of items in the cart
 * @returns Promise<boolean> indicating if shipping is free
 */
export async function qualifiesForFreeShipping(itemsPrice: number): Promise<boolean> {
  try {
    const { success, settings } = await getActiveWebsiteSettings();
    if (success && settings && settings.freeShippingThreshold > 0) {
      return itemsPrice >= settings.freeShippingThreshold;
    }
    return false;
  } catch (error) {
    console.error("Error checking free shipping qualification:", error);
    return false;
  }
}

/**
 * Get shipping display text
 * @param shippingCost - Calculated shipping cost
 * @returns formatted shipping display text
 */
export function getShippingDisplayText(shippingCost: number): string {
  return `₹${shippingCost.toFixed(2)} Shipping`;
}

/**
 * Calculate how much more is needed for free shipping based on active settings
 * @param itemsPrice - Total price of items in the cart
 * @returns Promise<number> amount needed for free shipping (0 if already free)
 */
export async function getAmountNeededForFreeShipping(itemsPrice: number): Promise<number> {
  try {
    const { success, settings } = await getActiveWebsiteSettings();
    if (success && settings && settings.freeShippingThreshold > 0) {
      const remaining = settings.freeShippingThreshold - itemsPrice;
      return Math.max(0, remaining);
    }
    return 0;
  } catch (error) {
    console.error("Error calculating amount for free shipping:", error);
    return 0;
  }
}

/**
 * Calculate shipping charge for order processing based on payment method (Server-side)
 * @param itemsPrice - Total price of items in the cart
 * @param destinationPincode - Destination pincode
 * @param paymentMethod - Payment method (cod or razorpay)
 * @returns Promise<number> - shipping charge amount
 */
export async function calculateShippingForOrder(
  itemsPrice: number,
  destinationPincode: string,
  paymentMethod: 'cod' | 'razorpay'
): Promise<number> {
  try {
    // Check for free shipping threshold first
    const isFreeShipping = await qualifiesForFreeShipping(itemsPrice);
    if (isFreeShipping) {
      console.log(`[calculateShippingForOrder] Order qualified for Free Shipping (itemsPrice: ₹${itemsPrice})`);
      return 0;
    }

    // Calculate weight based on items price
    const estimatedWeight = Math.max(500, itemsPrice * 0.1); 
    
    // Use the correct payment mode for Delhivery API
    const apiPaymentMode = paymentMethod === 'cod' ? 'COD' : 'Pre-paid';
    
    console.log(`[calculateShippingForOrder] Calculating shipping: price=₹${itemsPrice}, weight=${estimatedWeight}g, payment=${apiPaymentMode}, pincode=${destinationPincode}`);
    
    // Direct Delhivery API call for server-side usage
    const authToken = process.env.DELHIVERY_AUTH_TOKEN;
    if (!authToken) {
      throw new Error('DELHIVERY_AUTH_TOKEN not configured');
    }

    // Construct API URL
    // Always use production URL
    const baseUrl = 'https://track.delhivery.com';
    
    const params = new URLSearchParams({
      md: 'E', // Express service
      ss: 'Delivered',
      d_pin: destinationPincode,
      o_pin: SHIPPING_CONFIG.WAREHOUSE_PINCODE,
      cgm: estimatedWeight.toString(),
      pt: apiPaymentMode
    });

    const apiUrl = `${baseUrl}/api/kinko/v1/invoice/charges/.json?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
    });

    if (!response.ok) {
      // If staging fails, try production
      if (baseUrl.includes('staging')) {
        const prodUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?${params.toString()}`;
        
        const prodResponse = await fetch(prodUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
          },
        });

        if (!prodResponse.ok) {
          throw new Error(`Delhivery API error: ${prodResponse.status}`);
        }

        const prodData = await prodResponse.json();
        const cost = prodData[0]?.total_amount || 0;
        
        if (!cost || cost <= 0) {
          throw new Error('Invalid shipping cost received from API');
        }

        console.log(`[calculateShippingForOrder] Production API returned: ₹${cost}`);
        return parseFloat(cost);
      }
      
      throw new Error(`Delhivery API error: ${response.status}`);
    }

    const data = await response.json();
    const cost = data[0]?.total_amount || 0;
    
    if (!cost || cost <= 0) {
      throw new Error('Invalid shipping cost received from API');
    }

    console.log(`[calculateShippingForOrder] API returned: ₹${cost}`);
    return parseFloat(cost);
    
  } catch (error) {
    console.error('Error calculating shipping for order:', error);
    // Return fallback shipping charge
    const fallbackCost = paymentMethod === 'cod' ? 70 : 50; // COD typically costs more
    console.log(`[calculateShippingForOrder] Using fallback: ₹${fallbackCost}`);
    return fallbackCost;
  }
}