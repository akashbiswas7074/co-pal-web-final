import { NextRequest, NextResponse } from "next/server";
import { getCategoriesWithSubcategories } from "@/lib/database/actions/categories.actions";

export async function GET(request: NextRequest) {
    try {
        const result = await getCategoriesWithSubcategories();

        if (result.success) {
            return NextResponse.json({
                success: true,
                categories: result.categories
            });
        } else {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("API Error in categories-nav:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
