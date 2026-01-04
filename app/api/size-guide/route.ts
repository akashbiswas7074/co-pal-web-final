import { NextRequest, NextResponse } from "next/server";
import { 
  getActiveSizeGuide, 
  getSizeGuideByCategory, 
  getSizeGuideByCategoryName 
} from "@/lib/database/actions/size-guide.actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const category = searchParams.get("category");

    let result;

    if (categoryId) {
      result = await getSizeGuideByCategory(categoryId);
    } else if (category) {
      result = await getSizeGuideByCategoryName(category);
    } else {
      result = await getActiveSizeGuide();
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || "Failed to fetch size guide" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config: result.config,
      categoryName: (result as any).categoryName,
    });

  } catch (error) {
    console.error("Error in size guide API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
