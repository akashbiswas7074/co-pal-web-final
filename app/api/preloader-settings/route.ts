import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/connect";
import PreloaderSettings from "@/lib/database/models/preloader.settings.model";

export const revalidate = 0; // Disable static caching

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await PreloaderSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json(
        {
          success: true,
          settings: {
            logoUrl: "",
            isActive: false,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, settings },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Preloader Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
