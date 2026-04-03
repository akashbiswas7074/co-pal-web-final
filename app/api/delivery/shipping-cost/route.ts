import { NextRequest, NextResponse } from 'next/server';
import { qualifiesForFreeShipping } from '@/lib/utils/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      destinationPincode, 
      originPincode, 
      weight, 
      paymentMode,
      totalValue,
      shippingService = 'E' // E for Express, S for Surface
    } = body;

    // Check for free shipping first if totalValue is provided
    if (totalValue !== undefined) {
      const isFree = await qualifiesForFreeShipping(Number(totalValue));
      if (isFree) {
        return NextResponse.json({
          success: true,
          cost: 0,
          service: shippingService,
          paymentMode,
          isFreeShipping: true,
          message: 'Order qualifies for Free Shipping'
        });
      }
    }

    // Validate required fields
    if (!destinationPincode || !originPincode) {
      return NextResponse.json(
        { error: 'Destination and origin pincode are required' },
        { status: 400 }
      );
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(destinationPincode) || !/^\d{6}$/.test(originPincode)) {
      return NextResponse.json(
        { error: 'Please enter valid 6-digit pincodes' },
        { status: 400 }
      );
    }

    // Get auth token
    const authToken = process.env.DELHIVERY_AUTH_TOKEN;
    if (!authToken) {
      console.error('DELHIVERY_AUTH_TOKEN not configured');
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        const baseRate = paymentMode === 'Pre-paid' ? 50 : 70; // COD charges extra
        const weightMultiplier = Math.ceil((weight || 500) / 500); // ₹50 per 500g
        const mockCost = baseRate * weightMultiplier;
        
        return NextResponse.json({
          success: true,
          cost: mockCost,
          service: shippingService,
          paymentMode,
          dev_mode: true,
          message: 'Using mock shipping cost (Dev Mode)'
        });
      }

      return NextResponse.json(
        { error: 'Shipping service configuration error' },
        { status: 500 }
      );
    }

    // Construct API URL - using kinko API for accurate shipping charges
    // Always use production URL
    const baseUrl = 'https://track.delhivery.com';
    
    const apiUrl = `${baseUrl}/api/kinko/v1/invoice/charges/.json`;
    
    // Calculate weight in grams (default 500g if not provided)
    let weightInGrams = Number(weight) || 500;

    // SERVER-SIDE SAFETY:
    // If weight is massive (e.g. > 100kg), it's almost certainly an error in B2C context.
    // We'll normalize weights between 50g and 50000g (50kg).
    if (weightInGrams > 100000) {
      console.warn(`[ShippingAPI] Massive weight detected: ${weightInGrams}g. Normalizing for estimation...`);
      // If it looks like grams entered as mg or something else, we cap it.
      // For now, let's just cap at 70kg which is a standard max for many express couriers.
      weightInGrams = 70000; 
    } else if (weightInGrams > 5000 && weightInGrams % 100 === 0) {
      // Heuristic: If weight is e.g. 500, 1000, 5000 and it's large, 
      // but entered in a kg field correctly it should be 0.5, 1, 5.
      // No change needed here if the client already normalized.
    }

    
    // Build query parameters
    const params = new URLSearchParams({
      md: shippingService, // E for Express, S for Surface
      ss: 'Delivered', // Status for cost calculation
      d_pin: destinationPincode,
      o_pin: originPincode,
      cgm: weightInGrams.toString(),
      pt: paymentMode || 'Pre-paid'
    });

    const fullUrl = `${apiUrl}?${params.toString()}`;
    
    console.log('Making shipping cost request to:', fullUrl);
    console.log('Payment mode:', paymentMode);
    console.log('Weight:', weightInGrams, 'grams');
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
    });

    console.log('Delhivery API response status:', response.status);

    if (!response.ok) {
      // If staging fails, try production
      if (baseUrl.includes('staging')) {
        console.log('Staging failed, trying production...');
        const prodUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?${params.toString()}`;
        
        const prodResponse = await fetch(prodUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
          },
        });

        console.log('Production API response status:', prodResponse.status);
        
        if (!prodResponse.ok) {
          throw new Error(`Delhivery API error: ${prodResponse.status}`);
        }

        const prodData = await prodResponse.json();
        console.log('Production API response:', prodData);
        
        const cost = prodData[0]?.total_amount || 0;
        
        return NextResponse.json({
          success: true,
          cost: parseFloat(cost),
          service: shippingService,
          paymentMode,
          raw_response: prodData[0]
        });
      }

      // Handle auth errors with fallback
      if (response.status === 401) {
        console.error('Authentication failed with Delhivery API');
        
        // Return fallback cost calculation
        const baseRate = paymentMode === 'Pre-paid' ? 50 : 70;
        const weightMultiplier = Math.ceil(weightInGrams / 500);
        const fallbackCost = baseRate * weightMultiplier;
        
        return NextResponse.json({
          success: true,
          cost: fallbackCost,
          service: shippingService,
          paymentMode,
          fallback_mode: true,
          message: 'Using fallback shipping cost due to API authentication issue'
        });
      }
      
      throw new Error(`Delhivery API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Delhivery API response:', data);
    
    // Extract cost from response
    const cost = data[0]?.total_amount || 0;
    
    if (!cost || cost <= 0) {
      throw new Error('Invalid shipping cost received from API');
    }

    return NextResponse.json({
      success: true,
      cost: parseFloat(cost),
      service: shippingService,
      paymentMode,
      raw_response: data[0]
    });

  } catch (error: any) {
    console.error('Error calculating shipping cost:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Unable to calculate shipping cost',
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
