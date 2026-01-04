import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import Product from '@/lib/database/models/product.model';
import Category from '@/lib/database/models/category.model';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get basic counts
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});

    // Get a few sample products
    const sampleProducts = await Product.find({})
      .limit(3)
      .select('name slug price category')
      .populate('category', 'name')
      .lean();

    // Get a few sample categories
    const sampleCategories = await Category.find({})
      .limit(3)
      .select('name slug')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        productCount,
        categoryCount,
        sampleProducts: JSON.parse(JSON.stringify(sampleProducts)),
        sampleCategories: JSON.parse(JSON.stringify(sampleCategories)),
        message: productCount > 0 ? 'Database has products!' : 'No products found in database'
      }
    });

  } catch (error) {
    console.error('[Database Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Database connection or query failed'
    }, { status: 500 });
  }
}