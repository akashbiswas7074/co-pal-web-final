import { NextRequest, NextResponse } from 'next/server';
import { getActiveWebsiteSettings } from '@/lib/database/actions/website.settings.actions';
import { handlePaymentSuccess } from '@/lib/database/actions/order.actions';
import Order from '@/lib/database/models/order.model';
import { connectToDatabase } from '@/lib/database/connect';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { orderId, cfOrderId } = body;

    console.log('[API /api/order/verify-cashfree] Verifying Cashfree payment for:', { orderId, cfOrderId });

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing orderId parameter.' }, { status: 400 });
    }

    // Find internal order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (order.isPaid) {
      return NextResponse.json({ success: true, isPaid: true, message: 'Order is already marked as paid.' });
    }

    // Fetch active settings for Cashfree credentials
    const settingsResult = await getActiveWebsiteSettings();
    const settings = settingsResult.success ? settingsResult.settings : null;

    const cfAppId = settings?.cashfreeAppId || process.env.CASHFREE_APP_ID;
    const cfSecretKey = settings?.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY;
    const cfEnv = (settings?.cashfreeEnvironment || process.env.CASHFREE_ENV || 'sandbox').toLowerCase();

    if (!cfAppId || !cfSecretKey) {
      return NextResponse.json({ success: false, message: 'Cashfree credentials not configured.' }, { status: 500 });
    }

    const targetCfOrderId = cfOrderId || order.cashfreeOrderId || order._id.toString();
    const baseUrl = cfEnv === 'production'
      ? `https://api.cashfree.com/pg/orders/${targetCfOrderId}`
      : `https://sandbox.cashfree.com/pg/orders/${targetCfOrderId}`;

    console.log('[API /api/order/verify-cashfree] Calling Cashfree GET API:', baseUrl);

    const cfResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'x-client-id': cfAppId,
        'x-client-secret': cfSecretKey,
        'x-api-version': '2025-01-01',
        'Accept': 'application/json',
      },
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok) {
      console.error('[API /api/order/verify-cashfree] Cashfree GET Order error:', cfData);
      return NextResponse.json({ success: false, message: cfData.message || 'Failed to fetch order from Cashfree.' }, { status: 400 });
    }

    console.log('[API /api/order/verify-cashfree] Cashfree Order Status:', cfData.order_status);

    if (cfData.order_status === 'PAID') {
      const paymentResult = {
        id: cfData.cf_order_id || cfData.order_id,
        status: 'PAID',
        payment_amount: cfData.order_amount,
        update_time: new Date().toISOString()
      };

      const result = await handlePaymentSuccess(order._id.toString(), paymentResult, 'cashfree');
      if (result.success) {
        return NextResponse.json({ success: true, isPaid: true, message: 'Payment verified and order updated.' });
      } else {
        return NextResponse.json({ success: false, message: result.message || 'Failed to update order status.' }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        isPaid: false,
        orderStatus: cfData.order_status,
        message: `Payment status is ${cfData.order_status}`
      });
    }
  } catch (error: any) {
    console.error('[API /api/order/verify-cashfree] Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error.' }, { status: 500 });
  }
}
