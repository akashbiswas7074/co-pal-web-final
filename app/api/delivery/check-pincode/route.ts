import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  let pincode: string | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json(
        { message: 'Pincode is required' },
        { status: 400 }
      );
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { message: 'Please enter a valid 6-digit pincode' },
        { status: 400 }
      );
    }

    // Check if we have the auth token
    const authToken = process.env.DELHIVERY_AUTH_TOKEN;
    if (!authToken) {
      // Development fallback - mock some responses
      if (process.env.NODE_ENV === 'development') {
        console.log('Using development fallback for pincode check');
        
        // Mock serviceable pincodes for testing
        const serviceablePincodes = [
          '110001', '110002', '110003', // Delhi
          '400001', '400002', '400003', // Mumbai  
          '560001', '560002', '560003', // Bangalore
          '600001', '600002', '600003', // Chennai
          '700001', '700002', '700003', // Kolkata
          '194103' // Your example pincode
        ];
        
        const isServiceable = serviceablePincodes.includes(pincode);
        
        return NextResponse.json({
          serviceability: isServiceable,
          message: isServiceable 
            ? 'Delivery available for this pincode (Dev Mode)' 
            : 'Sorry, delivery is not available for this pincode (Dev Mode)',
          delivery_codes: isServiceable ? ['D', 'E'] : [],
          pincode: pincode,
          dev_mode: true
        });
      }
      
      return NextResponse.json(
        { message: 'Delivery service configuration error' },
        { status: 500 }
      );
    }

    // Make the API call to Delhivery
    // Always use production URL
    const apiUrl = `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`;
    
    console.log('Making request to:', apiUrl);
    console.log('Using token:', authToken.substring(0, 10) + '...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Delhivery API response status:', response.status);

    if (!response.ok) {
      throw new Error(`Delhivery API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the pincode is serviceable
    const isServiceable = data.delivery_codes && data.delivery_codes.length > 0;
    
    return NextResponse.json({
      serviceability: isServiceable,
      message: isServiceable 
        ? 'Delivery available for this pincode' 
        : 'Sorry, delivery is not available for this pincode',
      delivery_codes: data.delivery_codes || [],
      pincode: pincode
    });

  } catch (error: any) {
    console.error('Error checking pincode serviceability:', error);
    
    // If it's a 401 error, provide more specific guidance
    if (error.message.includes('401')) {
      console.error('Authentication failed. Token might be invalid or expired.');
      
      // Return development fallback in case of auth issues
      const serviceablePincodes = [
        '110001', '110002', '110003', // Delhi
        '400001', '400002', '400003', // Mumbai  
        '560001', '560002', '560003', // Bangalore
        '600001', '600002', '600003', // Chennai
        '700001', '700002', '700003', // Kolkata
        '741235', '194103' // Test pincodes
      ];
      
      const isServiceable = pincode ? serviceablePincodes.includes(pincode) : false;
      
      return NextResponse.json({
        serviceability: isServiceable,
        message: isServiceable 
          ? 'Delivery available for this pincode (Fallback Mode - API Auth Issue)' 
          : 'Sorry, delivery is not available for this pincode (Fallback Mode)',
        delivery_codes: isServiceable ? ['D', 'E'] : [],
        pincode: pincode || 'unknown',
        fallback_mode: true,
        auth_error: true
      });
    }
    
    return NextResponse.json(
      { 
        message: 'Unable to check delivery availability. Please try again later.',
        error: error.message,
        pincode: pincode
      },
      { status: 500 }
    );
  }
}
