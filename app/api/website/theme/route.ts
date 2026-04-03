import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/connect";
import WebsiteSettings, { IWebsiteSettings } from "@/lib/database/models/website.settings.model";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    const activeSettings = await WebsiteSettings.findOne({ isActive: true }).lean() as IWebsiteSettings | null;
    
    if (activeSettings) {
      return NextResponse.json({ 
        success: true, 
        theme: {
          primaryColor: activeSettings.themeSettings?.primaryColor || '#2B2B2B',
          secondaryColor: activeSettings.themeSettings?.secondaryColor || '#6B7280',
          accentColor: activeSettings.themeSettings?.accentColor || '#3B82F6',
          backgroundColor: activeSettings.themeSettings?.backgroundColor || '#FFFFFF',
          textColor: activeSettings.themeSettings?.textColor || '#1F2937',
          borderRadius: activeSettings.themeSettings?.borderRadius || '0.5rem',
          fontFamily: activeSettings.themeSettings?.fontFamily || 'Inter',
          customCSS: activeSettings.themeSettings?.customCSS || '',
          darkMode: activeSettings.themeSettings?.darkMode || false, // Default to light mode
        }
      });
    }

    // Return default theme with dark mode enabled
    return NextResponse.json({ 
      success: true, 
      theme: {
        primaryColor: '#2B2B2B',
        secondaryColor: '#6B7280',
        accentColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        borderRadius: '0.5rem',
        fontFamily: 'Inter',
        customCSS: '',
        darkMode: false, // Default to light mode
      }
    });

  } catch (error) {
    console.error("Error fetching theme settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch theme settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { darkMode } = body;

    // Find active settings
    let activeSettings = await WebsiteSettings.findOne({ isActive: true });

    if (!activeSettings) {
      // Create new settings if none exist
      activeSettings = new WebsiteSettings({
        isActive: true,
        themeSettings: {
          darkMode: darkMode ?? false, // Default to light mode
        },
      });
    } else {
      // Update existing settings
      if (!activeSettings.themeSettings) {
        activeSettings.themeSettings = {};
      }
      activeSettings.themeSettings.darkMode = darkMode ?? false;
    }

    await activeSettings.save();

    return NextResponse.json({ 
      success: true, 
      message: "Theme settings updated successfully",
      theme: {
        darkMode: activeSettings.themeSettings.darkMode,
      }
    });

  } catch (error) {
    console.error("Error updating theme settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update theme settings" },
      { status: 500 }
    );
  }
}