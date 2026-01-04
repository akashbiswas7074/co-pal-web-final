import { NextResponse } from 'next/server';
import { delhiveryApi } from '@/lib/utils/delivery-partner';
import { connectToDatabase } from '@/lib/database/connect';
import Order from '@/lib/database/models/Order';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId } = body;

    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'create_manifest':
        const manifestResult = await delhiveryApi.createManifest({
          warehouseName: process.env.DELHIVERY_WAREHOUSE_NAME,
          paymentMode: order.paymentMethod === 'cod' ? 'cod' : 'prepaid',
          weight: order.totalWeight,
          shippingAddress: order.shippingAddress
        });

        await Order.findByIdAndUpdate(orderId, {
          manifestId: manifestResult.manifestId,
          trackingNumber: manifestResult.trackingNumber,
          deliveryStatus: 'manifest_created'
        });

        return NextResponse.json(manifestResult);

      case 'cancel_shipment':
        if (!order.trackingNumber) {
          return NextResponse.json(
            { error: 'No tracking number found' },
            { status: 400 }
          );
        }

        const cancelResult = await delhiveryApi.cancelShipment(order.trackingNumber);
        
        await Order.findByIdAndUpdate(orderId, {
          deliveryStatus: 'cancelled'
        });

        return NextResponse.json(cancelResult);

      case 'track_shipment':
        if (!order.trackingNumber) {
          return NextResponse.json(
            { error: 'No tracking number found' },
            { status: 400 }
          );
        }

        const trackingResult = await delhiveryApi.trackShipment(order.trackingNumber);
        return NextResponse.json(trackingResult);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process delivery action' },
      { status: 500 }
    );
  }
} 