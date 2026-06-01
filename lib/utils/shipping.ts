import { delhiveryApi } from './delivery-partner';
import { getActiveWebsiteSettings } from '@/lib/database/actions/website.settings.actions';

// Shipping calculation utilities

export function getStateFromPincode(pincode: string): string {
  if (!pincode || pincode.length < 2) return "Default";
  const prefix2 = pincode.substring(0, 2);
  const prefix3 = pincode.substring(0, 3);
  
  if (prefix2 === "11") return "Delhi";
  if (prefix2 === "12" || prefix2 === "13") return "Haryana";
  if (prefix2 === "14" || prefix2 === "15") return "Punjab";
  if (prefix2 === "16") return "Chandigarh";
  if (prefix2 === "17") return "Himachal Pradesh";
  if (prefix2 === "18" || prefix2 === "19") return "Jammu and Kashmir";
  if (["20", "21", "22", "23", "24", "25", "26", "27", "28"].includes(prefix2)) {
    if (prefix3.startsWith("246") || prefix3.startsWith("247") || prefix3.startsWith("248") || prefix3.startsWith("249") || prefix3.startsWith("262") || prefix3.startsWith("263")) {
      return "Uttarakhand";
    }
    return "Uttar Pradesh";
  }
  if (["30", "31", "32", "33", "34"].includes(prefix2)) return "Rajasthan";
  if (["36", "37", "38", "39"].includes(prefix2)) {
    if (prefix3 === "396") return "Dadra and Nagar Haveli and Daman and Diu";
    return "Gujarat";
  }
  if (["40", "41", "42", "43", "44"].includes(prefix2)) {
    if (prefix3 === "403") return "Goa";
    return "Maharashtra";
  }
  if (["45", "46", "47", "48"].includes(prefix2)) return "Madhya Pradesh";
  if (prefix2 === "49") return "Chhattisgarh";
  if (["50", "51", "52", "53"].includes(prefix2)) return "Andhra Pradesh"; // can also be Telangana
  if (["56", "57", "58", "59"].includes(prefix2)) return "Karnataka";
  if (["60", "61", "62", "63", "64"].includes(prefix2)) {
    if (prefix3 === "605") return "Puducherry";
    return "Tamil Nadu";
  }
  if (["67", "68", "69"].includes(prefix2)) {
    if (prefix3 === "682") return "Lakshadweep";
    return "Kerala";
  }
  if (["70", "71", "72", "73", "74"].includes(prefix2)) {
    if (prefix3 === "744") return "Andaman and Nicobar Islands";
    if (prefix3 === "737") return "Sikkim";
    return "West Bengal";
  }
  if (["75", "76", "77"].includes(prefix2)) return "Odisha";
  if (prefix2 === "78") return "Assam";
  if (prefix3 === "790" || prefix3 === "791" || prefix3 === "792") return "Arunachal Pradesh";
  if (prefix3 === "793" || prefix3 === "794") return "Meghalaya";
  if (prefix3 === "795") return "Manipur";
  if (prefix3 === "796") return "Mizoram";
  if (prefix3 === "797" || prefix3 === "798") return "Nagaland";
  if (prefix3 === "799") return "Tripura";
  if (["80", "81", "82", "83", "84", "85"].includes(prefix2)) {
    const prefix3Num = parseInt(prefix3);
    if (prefix3Num === 814 || prefix3Num === 815 || (prefix3Num >= 825 && prefix3Num <= 835)) {
      return "Jharkhand";
    }
    return "Bihar";
  }
  
  return "Default";
}

export function calculateWeightBasedShippingCharge(
  weightGrams: number,
  state: string,
  stateShippingCharges?: { stateName: string; maxWeightGrams: number; charge: number; }[]
): number {
  const normState = (state || "Default").trim().toLowerCase();
  const chargesList = stateShippingCharges || [];

  // Filter rules for this specific state
  const stateRules = chargesList.filter(r => r.stateName.toLowerCase() === normState);
  
  // Sort state rules by max weight limit ascending
  stateRules.sort((a, b) => a.maxWeightGrams - b.maxWeightGrams);
  
  // Find matching rule
  let matchedRule = stateRules.find(r => r.maxWeightGrams >= weightGrams);
  
  if (matchedRule) {
    return matchedRule.charge;
  }
  
  // If weight exceeds all custom rules for this state
  if (stateRules.length > 0) {
    const highestRule = stateRules[stateRules.length - 1];
    const extraWeight = weightGrams - highestRule.maxWeightGrams;
    const extraMultiplier = Math.ceil(extraWeight / highestRule.maxWeightGrams);
    return highestRule.charge + (highestRule.charge * extraMultiplier);
  }
  
  // If no rules for the state, try Default rules
  const defaultRules = chargesList.filter(r => r.stateName.toLowerCase() === "default");
  defaultRules.sort((a, b) => a.maxWeightGrams - b.maxWeightGrams);
  
  let matchedDefaultRule = defaultRules.find(r => r.maxWeightGrams >= weightGrams);
  if (matchedDefaultRule) {
    return matchedDefaultRule.charge;
  }
  
  if (defaultRules.length > 0) {
    const highestRule = defaultRules[defaultRules.length - 1];
    const extraWeight = weightGrams - highestRule.maxWeightGrams;
    const extraMultiplier = Math.ceil(extraWeight / highestRule.maxWeightGrams);
    return highestRule.charge + (highestRule.charge * extraMultiplier);
  }
  
  // Hardcoded default fallbacks: WB 70 rs, outside WB 100 rs per 500g category
  const multiplier = Math.ceil(weightGrams / 500);
  const isWB = normState === "west bengal" || normState === "wb";
  const baseRate = isWB ? 70 : 100;
  return baseRate * multiplier;
}


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
  paymentMode: 'prepaid' | 'cod' = 'prepaid',
  stateName?: string
): Promise<{cost: number, error?: string}> {
  try {
    const { success, settings } = await getActiveWebsiteSettings();
    if (success && settings && settings.useWeightBasedShipping) {
      const state = stateName || getStateFromPincode(destinationPincode);
      const weightInGrams = totalWeight || SHIPPING_CONFIG.DEFAULT_WEIGHT_GRAMS;
      const customCost = calculateWeightBasedShippingCharge(weightInGrams, state, settings.stateShippingCharges);
      console.log(`[calculateDelhiveryShippingServer] Custom weight-based shipping for ${state} (weight: ${weightInGrams}g): ₹${customCost}`);
      return { cost: customCost };
    }
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
  totalValue?: number,
  stateName?: string
): Promise<{cost: number, originPincode?: string, error?: string}> {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    try {
      const params = {
        destinationPincode,
        // originPincode intentionally omitted — server fetches it from DB
        weight: totalWeight || SHIPPING_CONFIG.DEFAULT_WEIGHT_GRAMS,
        paymentMode,
        totalValue,
        stateName,
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
        return { cost: 0, originPincode: data.origin };
      }

      if (!data.cost || data.cost <= 0) {
        throw new Error('Invalid shipping cost received from API');
      }

      return {
        cost: data.cost,
        originPincode: data.origin
      };
    } catch (error) {
      console.error('Error calculating Delhivery shipping:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping cost';
      return { cost: 0, error: errorMessage };
    }
  } else {
    // Server-side: convert payment mode and call server function
    const serverPaymentMode = paymentMode === 'Pre-paid' ? 'prepaid' : 'cod';
    return calculateDelhiveryShippingServer(destinationPincode, totalWeight, totalValue, serverPaymentMode, stateName);
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
    
    // Check for weight-based shipping settings
    const { success, settings } = await getActiveWebsiteSettings();
    if (success && settings && settings.useWeightBasedShipping) {
      const state = getStateFromPincode(destinationPincode);
      const customCharge = calculateWeightBasedShippingCharge(estimatedWeight, state, settings.stateShippingCharges);
      console.log(`[calculateShippingForOrder] Using custom weight-based shipping for ${state} (weight: ${estimatedWeight}g): ₹${customCharge}`);
      return customCharge;
    }

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