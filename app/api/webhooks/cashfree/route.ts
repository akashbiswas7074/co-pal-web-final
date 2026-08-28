import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentSuccess } from '@/lib/database/actions/order.actions';
import Order from '@/lib/database/models/order.model';
import { connectToDatabase } from '@/lib/database/connect';

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Cashfree Webhook endpoint active' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const rawBody = await request.text();
    let body: any = {};

    try {
      if (rawBody) {
        body = JSON.parse(rawBody);
      }
    } catch (e) {
      console.warn('[Cashfree Webhook] Non-JSON payload received:', rawBody);
      return NextResponse.json({ success: true, message: 'Payload received' }, { status: 200 });
    }

    console.log('[Cashfree Webhook] Received event:', body.type, JSON.stringify(body));

    const eventType = body.type || body.event || '';
    const data = body.data || {};
    const orderData = data.order || {};
    const paymentData = data.payment || {};

    // Handle Cashfree Test Webhooks
    if (!eventType || eventType.includes('TEST') || body.is_test || Object.keys(body).length === 0) {
      console.log('[Cashfree Webhook] Test webhook ping acknowledged successfully.');
      return NextResponse.json({ success: true, message: 'Test webhook acknowledged' }, { status: 200 });
    }

    const cfOrderId = orderData.order_id || body.order_id;
    const paymentStatus = paymentData.payment_status || data.payment_status;

    if (!cfOrderId) {
      console.warn('[Cashfree Webhook] Webhook ping without order_id acknowledged.');
      return NextResponse.json({ success: true, message: 'Webhook received' }, { status: 200 });
    }

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'ORDER_PAID' || paymentStatus === 'SUCCESS') {
      // Find order by ID or cashfreeOrderId
      let order = await Order.findById(cfOrderId).catch(() => null);
      if (!order) {
        order = await Order.findOne({ cashfreeOrderId: cfOrderId });
      }

      if (!order) {
        console.warn('[Cashfree Webhook] Order not found for order_id:', cfOrderId);
        return NextResponse.json({ success: true, message: 'Webhook received for unknown order' }, { status: 200 });
      }

      if (order.isPaid) {
        console.log('[Cashfree Webhook] Order already paid:', order._id.toString());
        return NextResponse.json({ success: true, message: 'Order already marked as paid' }, { status: 200 });
      }

      const paymentResult = {
        id: paymentData.cf_payment_id || cfOrderId,
        status: 'SUCCESS',
        email: data.customer_details?.customer_email || order.shippingAddress?.email
      };

      const result = await handlePaymentSuccess(order._id.toString(), paymentResult, 'cashfree');
      if (result.success) {
        console.log('[Cashfree Webhook] Successfully processed payment for order:', order._id.toString());
        return NextResponse.json({ success: true, message: 'Payment recorded successfully' }, { status: 200 });
      } else {
        console.error('[Cashfree Webhook] Failed to handle payment success:', result.message);
        return NextResponse.json({ success: false, message: result.message }, { status: 500 });
      }
    }

    // For other webhook events (failures, refunds, pings), log and acknowledge with 200 OK
    console.log('[Cashfree Webhook] Event acknowledged:', eventType, paymentStatus);
    return NextResponse.json({ success: true, message: 'Event received' }, { status: 200 });
  } catch (error: any) {
    console.error('[Cashfree Webhook] Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

