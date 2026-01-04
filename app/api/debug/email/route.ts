
import { NextResponse } from 'next/server';
import { verifyEmailConnection } from '@/lib/email';

export async function GET() {
    try {
        const result = await verifyEmailConnection();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message, error }, { status: 500 });
    }
}
