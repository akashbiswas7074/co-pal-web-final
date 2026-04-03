import { NextRequest, NextResponse } from 'next/server';

/**
 * Expected TAT API - Delhivery Integration
 * This API provides the estimated TAT be              console.log('[Expected TAT API] Bad Request - checking parameters:', {
          origin_pin,
          destination_pin,
          mot,
          pdt,
          expected_pickup_date: pickupDateFormatted
        });le.log('[Expected TAT API] Bad Request - checking parameters:', {
          origin_pin,
          destination_pin,
          mot,
          pdt,
          expected_pickup_date: pickupDateFormatted
        });he origin and destination pin code
 */
export async function GET(request: NextRequest) {
  console.log('[Expected TAT API] GET request received');
  
  try {
    const { searchParams } = new URL(request.url);
    const origin_pin = searchParams.get('origin_pin');
    const destination_pin = searchParams.get('destination_pin');
    const mot = searchParams.get('mot') || 'S'; // Surface by default
    const pdt = searchParams.get('pdt') || 'B2C'; // B2C by default
    const expected_pickup_date = searchParams.get('expected_pickup_date');

    console.log('[Expected TAT API] Request params:', {
      origin_pin,
      destination_pin,
      mot,
      pdt,
      expected_pickup_date
    });

    // Validate required parameters
    if (!origin_pin || !destination_pin) {
      console.log('[Expected TAT API] Missing required parameters');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: origin_pin and destination_pin are required' 
        },
        { status: 400 }
      );
    }

    // Validate pin code formats (should be 6 digits)
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(origin_pin)) {
      console.log('[Expected TAT API] Invalid origin pin format');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid origin pin code format. Must be 6 digits.' 
        },
        { status: 400 }
      );
    }
    
    if (!pinRegex.test(destination_pin)) {
      console.log('[Expected TAT API] Invalid destination pin format');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid destination pin code format. Must be 6 digits.' 
        },
        { status: 400 }
      );
    }

    // Validate pin codes - same origin and destination
    if (origin_pin === destination_pin) {
      console.log('[Expected TAT API] Same origin and destination pin codes');
      return NextResponse.json({
        success: true,
        data: {
          expected_tat: "Same day delivery",
          expected_delivery_date: new Date().toISOString().split('T')[0],
          pickup_date: getDefaultPickupDate(),
          fallback: true,
          error: "Same origin and destination pin codes"
        }
      });
    }
    if (mot !== 'S' && mot !== 'E') {
      console.log('[Expected TAT API] Invalid MOT parameter');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid MOT parameter. Must be "S" for Surface or "E" for Express' 
        },
        { status: 400 }
      );
    }
    const token = process.env.DELHIVERY_AUTH_TOKEN;
    if (!token) {
      console.error('[Expected TAT API] Delhivery auth token not found in environment variables');
      
      // Return fallback response for missing token
      return NextResponse.json({
        success: true,
        data: {
          expected_tat: "3-7 business days",
          expected_delivery_date: calculateFallbackDate(5),
          pickup_date: getDefaultPickupDate(),
          fallback: true,
          error: "API token not configured"
        }
      });
    }

    // Production URL as per documentation
    const apiUrl = 'https://track.delhivery.com/api/dc/expected_tat';

    // Prepare request parameters
    const requestParams = new URLSearchParams({
      origin_pin,
      destination_pin,
      mot,
      pdt
    });

    // Set expected_pickup_date - format for Delhivery API as 'expected_pd'
    const pickupDateFormatted = expected_pickup_date 
      ? formatPickupDateForDelhivery(expected_pickup_date)
      : getDefaultPickupDateForDelhivery();
    
    console.log('[Expected TAT API] Using formatted pickup date:', pickupDateFormatted);
    
    // Use 'expected_pd' as parameter name (Delhivery requirement)
    requestParams.append('expected_pd', pickupDateFormatted);

    const fullUrl = `${apiUrl}?${requestParams.toString()}`;
    console.log('[Expected TAT API] Making request to Delhivery:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${token}`
      }
    });

    console.log('[Expected TAT API] Delhivery response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Expected TAT API] Delhivery API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Special handling for 400 errors - likely parameter issues
      if (response.status === 400) {
        console.error('[Expected TAT API] Bad Request - checking parameters:', {
          origin_pin,
          destination_pin,
          mot,
          pdt,
          expected_pickup_date: pickupDateFormatted
        });
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(errorText);
          console.error('[Expected TAT API] Delhivery error details:', errorData);
        } catch (parseError) {
          console.error('[Expected TAT API] Could not parse error response:', errorText);
        }
      }
      
      // Return fallback response for API errors
      return NextResponse.json({
        success: true,
        data: {
          expected_tat: "3-7 business days",
          expected_delivery_date: calculateFallbackDate(5),
          pickup_date: expected_pickup_date || getDefaultPickupDate(),
          fallback: true,
          error: `Delhivery API error: ${response.status} - ${errorText}`
        }
      });
    }

    const responseText = await response.text();
    console.log('[Expected TAT API] Delhivery raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Expected TAT API] Failed to parse Delhivery response:', parseError);
      
      return NextResponse.json({
        success: true,
        data: {
          expected_tat: "3-7 business days",
          expected_delivery_date: calculateFallbackDate(5),
          pickup_date: expected_pickup_date || getDefaultPickupDate(),
          fallback: true,
          error: "Failed to parse API response"
        }
      });
    }

    console.log('[Expected TAT API] Delhivery parsed response:', data);

    // Handle successful Delhivery response
    if (data.success !== false && data.data) {
      const tatData = data.data;
      
      // Calculate expected delivery date if not provided by Delhivery
      let calculatedDeliveryDate = tatData.expected_delivery_date || tatData.delivery_date;
      
      if (!calculatedDeliveryDate) {
        // Extract TAT days and calculate delivery date
        const tatDays = extractTatDays(tatData.expected_tat || tatData.tat);
        calculatedDeliveryDate = calculateDeliveryDate(pickupDateFormatted, tatDays);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          expected_tat: formatTatResponse(tatData.expected_tat || tatData.tat),
          expected_delivery_date: formatDateResponse(calculatedDeliveryDate),
          pickup_date: expected_pickup_date || getDefaultPickupDate(),
          raw_response: data,
          fallback: false
        }
      });
    } else {
      // Handle Delhivery API error response
      const errorMsg = data.msg || data.error || 'Unknown error from Delhivery API';
      console.log('[Expected TAT API] Delhivery returned error:', errorMsg);
      
      return NextResponse.json({
        success: true,
        data: {
          expected_tat: "3-7 business days",
          expected_delivery_date: calculateFallbackDate(5),
          pickup_date: expected_pickup_date || getDefaultPickupDate(),
          fallback: true,
          error: errorMsg
        }
      });
    }

  } catch (error: any) {
    console.error('[Expected TAT API] Unexpected error:', error);
    
    // Return fallback response for any unexpected errors
    return NextResponse.json({
      success: true,
      data: {
        expected_tat: "3-7 business days",
        expected_delivery_date: calculateFallbackDate(5),
        pickup_date: getDefaultPickupDate(),
        fallback: true,
        error: `Unexpected error: ${error.message}`
      }
    });
  }
}

/**
 * Helper function to get default pickup date (1 day from now)
 */
function getDefaultPickupDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Helper function to format pickup date for Delhivery API
 * Delhivery expects format: '%Y-%m-%d %H:%M'
 */
function formatPickupDateForDelhivery(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return getDefaultPickupDateForDelhivery();
    }
    
    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      console.log('[Expected TAT API] Pickup date is in the past, using tomorrow');
      return getDefaultPickupDateForDelhivery();
    }
    
    // Format as YYYY-MM-DD HH:MM (Delhivery format)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day} 10:00`; // Default to 10:00 AM
  } catch (error) {
    console.log('[Expected TAT API] Invalid date format, using default');
    return getDefaultPickupDateForDelhivery();
  }
}

/**
 * Helper function to get default pickup date for Delhivery (1 day from now with time)
 */
function getDefaultPickupDateForDelhivery(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day} 10:00`;
}

/**
 * Helper function to calculate fallback date
 */
function calculateFallbackDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to extract number of days from TAT string
 */
function extractTatDays(tatString: any): number {
  if (!tatString) return 3; // Default fallback
  
  const str = String(tatString).toLowerCase();
  
  // Look for patterns like "1 business day", "3-5 days", "2 days", etc.
  const patterns = [
    /(\d+)\s*(?:business\s*)?days?/,
    /(\d+)-(\d+)\s*(?:business\s*)?days?/,
    /(\d+)\s*(?:business\s*)?day/,
    /(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      if (match[2]) {
        // Range like "3-5 days" - use the higher number
        return parseInt(match[2]);
      } else {
        return parseInt(match[1]);
      }
    }
  }
  
  return 3; // Default fallback
}

/**
 * Helper function to calculate delivery date from pickup date and TAT days
 */
function calculateDeliveryDate(pickupDateStr: string, tatDays: number): string {
  try {
    // Parse pickup date (could be in format "YYYY-MM-DD HH:MM" or "YYYY-MM-DD")
    const pickupDate = new Date(pickupDateStr.split(' ')[0]); // Take only date part
    
    if (isNaN(pickupDate.getTime())) {
      // If pickup date is invalid, use tomorrow as base
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      pickupDate.setTime(tomorrow.getTime());
    }
    
    // Add business days (skip weekends)
    let businessDaysAdded = 0;
    const deliveryDate = new Date(pickupDate);
    
    while (businessDaysAdded < tatDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = deliveryDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysAdded++;
      }
    }
    
    return deliveryDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('[Expected TAT API] Error calculating delivery date:', error);
    // Fallback: add tatDays to current date
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + tatDays);
    return fallbackDate.toISOString().split('T')[0];
  }
}

/**
 * Helper function to format TAT response
 */
function formatTatResponse(tat: any): string {
  if (!tat) return "3-7 business days";
  
  const tatString = String(tat);
  
  // If it's already formatted, return as is
  if (tatString.includes('business days') || tatString.includes('days')) {
    return tatString;
  }
  
  // Try to parse if it's a number
  const days = parseInt(tatString);
  if (!isNaN(days)) {
    return `${days} business day${days > 1 ? 's' : ''}`;
  }
  
  return tatString || "3-7 business days";
}

/**
 * Helper function to format date response
 */
function formatDateResponse(date: any): string {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return String(date);
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return String(date);
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  console.log('[Expected TAT API] OPTIONS request received');
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}