import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import Shop from '@/lib/database/models/shop.model';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const shops = await Shop.find({ isActive: true }).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      shops: JSON.parse(JSON.stringify(shops)),
    });
  } catch (error) {
    console.error("API Error fetching nearby shops:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch nearby shops",
    }, { status: 500 });
  }
}
