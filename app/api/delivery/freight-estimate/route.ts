import { NextResponse } from 'next/server';
import { delhiveryApi } from '@/lib/utils/delivery-partner';

// Weight threshold for B2B shipping (in grams)
const B2B_WEIGHT_THRESHOLD = 20000; // 20kg

export async function POST(request: Request) {
  try {
    const params = await request.json();

    // Validate required parameters
    if (!params.dimensions || !params.weight_g || !params.source_pin || !params.consignee_pin) {
      return NextResponse.json(
        { 
          message: 'Missing required parameters',
          error: { type: 'validation_error', details: 'dimensions, weight_g, source_pin, and consignee_pin are required' }
        },
        { status: 400 }
      );
    }

    // Determine if this should be a B2B or B2C shipment based on weight
    const isB2B = params.weight_g >= B2B_WEIGHT_THRESHOLD;

    try {
      let freightEstimate;
      if (isB2B) {
        // For B2B, add required B2B parameters
        const b2bParams = {
          ...params,
          freight_mode: 'surface',
          cheque_payment: false,
          rov_insurance: false
        };
        freightEstimate = await delhiveryApi.getB2BFreightEstimate(b2bParams);
      } else {
        // For B2C, use regular parameters
        freightEstimate = await delhiveryApi.getB2CFreightEstimate(params);
      }

      return NextResponse.json(freightEstimate);
    } catch (error: any) {
      console.error('Freight estimate API error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
        return NextResponse.json(
          { 
            message: 'Authentication failed',
            error: { type: 'auth_error' }
          },
          { status: 401 }
        );
      }

      if (error.response?.status === 404) {
        return NextResponse.json(
          { 
            message: 'Delivery service not available',
            error: { type: 'service_unavailable' }
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          message: error.message || 'Failed to get freight estimate',
          error: error.response?.data || { type: 'unknown_error' }
        },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        message: 'Invalid request',
        error: { type: 'invalid_request', details: error.message }
      },
      { status: 400 }
    );
  }
} 