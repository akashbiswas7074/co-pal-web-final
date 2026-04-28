import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/connect";
import NavbarSettings from "@/lib/database/models/navbar.settings.model";

/**
 * GET /api/navbar-settings
 * Fetches the active navbar global settings
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Fetch active settings
    let settings = await NavbarSettings.findOne({ isActive: true }).lean();
    
    // Fallback if none in db yet
    if (!settings) {
      settings = {
        backgroundType: 'blur',
        backgroundColorValue: '#1a0a2c',
        backgroundGradientValue: 'linear-gradient(to right, #1a0a2c, #4a192c)',
        blurOpacity: 40,
        desktopLayout: 'inline',
        textColor: '#ffffff',
        isActive: true
      } as any;
    }
    
    return NextResponse.json({
      success: true,
      settings: JSON.parse(JSON.stringify(settings))
    });
  } catch (error: any) {
    console.error("Error fetching navbar settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch navbar settings",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
