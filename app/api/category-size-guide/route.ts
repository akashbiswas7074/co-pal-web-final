import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/connect";
import CategorySizeGuide from "@/lib/database/models/category-size-guide.model";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get("category");
        const subCategory = searchParams.get("subCategory");

        if (!category || !subCategory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category and subCategory parameters are required",
                },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const sizeGuide = await CategorySizeGuide.findOne({
            category,
            subCategory,
            isActive: true,
        }).lean();

        if (!sizeGuide) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Size guide not found for this category-subcategory combination",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            sizeGuide: JSON.parse(JSON.stringify(sizeGuide)),
        });
    } catch (error: any) {
        console.error("Error fetching category size guide:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch size guide",
            },
            { status: 500 }
        );
    }
}
