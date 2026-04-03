import { NextResponse } from 'next/server';
import { calculateDelhiveryShipping } from '@/lib/utils/shipping';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const weight = searchParams.get('weight');
    const value = searchParams.get('value');

    if (!pincode) {
      return NextResponse.json(
        { 
          error: 'Pincode is required' 
        },
        { status: 400 }
      );
    }

    const result = await calculateDelhiveryShipping(
      pincode,
      weight ? Number(weight) : undefined,
      'Pre-paid' // Default payment mode
    );

    return NextResponse.json({
      success: !result.error,
      pincode,
      weight: weight ? Number(weight) : 'default',
      paymentMode: 'Pre-paid',
      shippingCost: result.cost,
      error: result.error || null
    });
  } catch (error: any) {
    console.error('Test shipping API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to calculate shipping'
      },
      { status: 500 }
    );
  }
}
