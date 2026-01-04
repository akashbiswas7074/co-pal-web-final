import { NextResponse } from 'next/server';
import { delhiveryApi } from '@/lib/utils/delivery-partner';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const weight = searchParams.get('weight');
    const isExpress = searchParams.get('express') === 'true';
    const isCod = searchParams.get('cod') === 'true';

    console.log('Received serviceability check request:', { pincode, weight });

    if (!pincode || !weight) {
      console.error('Missing required parameters:', { pincode, weight });
      return NextResponse.json(
        { 
          message: 'Missing required parameters',
          error: { type: 'validation_error', details: 'pincode and weight are required' }
        },
        { status: 400 }
      );
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      console.error('Invalid pincode format:', pincode);
      return NextResponse.json(
        {
          serviceability: false,
          message: 'Invalid pincode format. Please enter a 6-digit pincode.',
          error: { pincode: 'invalid_format' }
        },
        { status: 400 }
      );
    }

    // Validate weight
    const weightNum = Number(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      console.error('Invalid weight value:', weight);
      return NextResponse.json(
        {
          serviceability: false,
          message: 'Invalid weight value. Weight must be a positive number.',
          error: { weight: 'invalid_value' }
        },
        { status: 400 }
      );
    }

    console.log('Checking serviceability with Delhivery API:', { pincode, weight: weightNum });
    const result = await delhiveryApi.checkDeliveryAvailability(
      pincode,
      parseInt(weight),
      isExpress,
      isCod
    );
    console.log('Delhivery API response:', result);

    if (!result.serviceability) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Delivery check error:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to check delivery availability',
        error: error.response?.data || { type: 'unknown_error' }
      },
      { status: 500 }
    );
  }
} 