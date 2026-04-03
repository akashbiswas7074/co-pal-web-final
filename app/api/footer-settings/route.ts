import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import FooterSettings from '@/lib/database/models/footer.settings.model';

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await FooterSettings.findOne({ isActive: true });

    if (!settings) {
      settings = {
        backgroundType: 'mesh',
        backgroundColorValue: '#111827',
        backgroundGradientValue: 'linear-gradient(to right, #111827, #1f2937)',
        blurOpacity: 40,
        textColor: '#ffffff',
        isActive: true
      } as any;
    }
    
    return NextResponse.json({
      success: true,
      settings: settings
    });
    
  } catch (error: any) {
    console.error("Error API GET footer settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get footer settings" },
      { status: 500 }
    );
  }
}
