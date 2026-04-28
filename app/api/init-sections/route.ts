import { NextResponse } from "next/server";
import { initializeDefaultSections } from "@/lib/database/actions/initialize-sections.actions";

export async function GET() {
  try {
    const result = await initializeDefaultSections();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Initialization failed",
    }, { status: 500 });
  }
}
