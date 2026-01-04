import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import PendingCodOrder from '@/lib/database/models/pending-cod-order.model';
import User from '@/lib/database/models/user.model';
import { sendCodVerificationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Order ID is required' 
      }, { status: 400 });
    }

    await connectToDatabase();

    // Find the pending COD order
    const pendingOrder = await PendingCodOrder.findById(orderId)
      .populate('user')
      .lean() as any;

    if (!pendingOrder) {
      return NextResponse.json({ 
        success: false, 
        message: 'Order not found' 
      }, { status: 404 });
    }

    // Verify it's a COD order
    if (pendingOrder.paymentMethod !== 'cod') {
      return NextResponse.json({ 
        success: false, 
        message: 'Not a COD order' 
      }, { status: 400 });
    }

    // Generate new verification code
    const plainVerificationCode = generateOTP();
    const hashedCode = await bcrypt.hash(plainVerificationCode, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Update the pending order with new verification code
    await PendingCodOrder.findByIdAndUpdate(orderId, {
      codVerificationCode: hashedCode,
      codVerificationCodeExpires: expiresAt
    });

    // Get user email
    const user = pendingOrder.user as any;
    if (!user || !user.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'User email not found' 
      }, { status: 400 });
    }

    // Resend verification email
    try {
      await sendCodVerificationEmail(user.email, {
        userName: user.name || 'Customer',
        verificationCode: plainVerificationCode,
        orderId: pendingOrder._id.toString(),
        expiresInMinutes: 15,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      });

      return NextResponse.json({
        success: true,
        message: 'Verification code resent successfully'
      });
    } catch (emailError: any) {
      console.error('[API /api/order/resend-cod-verification] Failed to send email:', emailError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send verification email' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API /api/order/resend-cod-verification] Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
