import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import Product from '@/lib/database/models/product.model';
import Category from '@/lib/database/models/category.model';
import SubCategory from '@/lib/database/models/subCategory.model';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort');
    const filter = searchParams.get('filter');

    console.log('[Search API] Query:', query, 'Sort:', sort, 'Filter:', filter, 'Limit:', limit, 'Page:', page);

    await connectToDatabase();

    let searchConditions: any = {};
    let sortConditions: any = {};

    // Handle special search types
    if (filter) {
      switch (filter) {
        case 'sale':
          // Products with discount > 0
          searchConditions = {
            $or: [
              { 'subProducts.discount': { $gt: 0 } },
              { discount: { $gt: 0 } }
            ]
          };
          break;
        case 'featured':
          // Featured products
          searchConditions = {
            $or: [
              { featured: true },
              { isFeatured: true }
            ]
          };
          break;
      }
    } else if (query.trim().length > 0) {
      // Regular text search - find categories that match the search query
      const matchingCategories = await Category.find({
        name: { $regex: query, $options: 'i' }
      }).select('_id').lean();

      const categoryIds = matchingCategories.map(cat => cat._id);

      // Create search conditions - Enhanced to handle category searches properly
      searchConditions = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { slug: { $regex: query, $options: 'i' } }
        ]
      };

      // Add category search if we found matching categories
      if (categoryIds.length > 0) {
        searchConditions.$or.push({ category: { $in: categoryIds } });
      }
    }

    // Handle sorting
    if (sort) {
      switch (sort) {
        case 'bestselling':
          sortConditions = { sold: -1, createdAt: -1 };
          break;
        case 'newest':
          sortConditions = { createdAt: -1 };
          break;
        case 'price-asc':
          sortConditions = { price: 1 };
          break;
        case 'price-desc':
          sortConditions = { price: -1 };
          break;
        default:
          sortConditions = { sold: -1, createdAt: -1 };
          break;
      }
    } else {
      // Default sorting
      sortConditions = { sold: -1, createdAt: -1 };
    }

    console.log('[Search API] Search conditions:', JSON.stringify(searchConditions));
    console.log('[Search API] Sort conditions:', JSON.stringify(sortConditions));

    // Get total count for pagination
    const totalCount = await Product.countDocuments(searchConditions);
    console.log('[Search API] Total count:', totalCount);

    // Fetch products with pagination and populate references
    const products = await Product.find(searchConditions)
      .populate('category', 'name slug')
      .populate('subCategories', 'name slug')
      .sort(sortConditions)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    console.log('[Search API] Found products:', products.length);

    // Transform products to include calculated fields
    const transformedProducts = products.map((product: any) => {
      try {
        // Safely handle the product ID
        const productId = product._id ? product._id.toString() : '';
        
        // Calculate total sold count
        let totalSold = 0;
        
        // Direct sold count
        if (typeof product.sold === 'number') {
          totalSold += product.sold;
        }

        // Add sold from subProducts
        if (product.subProducts?.length > 0) {
          product.subProducts.forEach((subProduct: any) => {
            if (typeof subProduct.sold === 'number') {
              totalSold += subProduct.sold;
            }
            
            // Add sold from sizes
            if (subProduct.sizes?.length > 0) {
              subProduct.sizes.forEach((size: any) => {
                if (typeof size.sold === 'number') {
                  totalSold += size.sold;
                }
              });
            }
          });
        }

        // Get main image
        let mainImage = '/images/placeholder-product.jpg';
        if (product.image) {
          mainImage = product.image;
        } else if (product.subProducts?.[0]?.images?.[0]) {
          const img = product.subProducts[0].images[0];
          mainImage = typeof img === 'string' ? img : img.url;
        } else if (product.images?.[0]) {
          const img = product.images[0];
          mainImage = typeof img === 'string' ? img : img.url;
        }

        // Get price information
        let price = 0;
        let originalPrice = 0;
        let discount = 0;

        if (product.subProducts?.[0]) {
          const subProduct = product.subProducts[0];
          
          if (subProduct.sizes?.[0]) {
            price = subProduct.sizes[0].price || 0;
            originalPrice = subProduct.sizes[0].originalPrice || price;
          } else {
            price = subProduct.price || 0;
            originalPrice = subProduct.originalPrice || price;
          }
          
          discount = subProduct.discount || 0;
        } else {
          price = product.price || 0;
          originalPrice = product.originalPrice || price;
          discount = product.discount || 0;
        }

        // Format category name
        let categoryName = 'Product';
        if (product.category) {
          if (typeof product.category === 'string') {
            categoryName = product.category;
          } else if (product.category.name) {
            categoryName = product.category.name;
          }
        }

        // Determine badges
        const isBestseller = product.isBestseller || totalSold > 5;
        const isFeatured = product.featured || product.isFeatured;
        const isNew = product.isNew || (product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000));
        const isOnSale = discount > 0;

        return {
          id: productId,
          _id: productId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          category: categoryName,
          subcategory: product.subCategories?.[0]?.name || '',
          image: mainImage,
          price: price,
          originalPrice: originalPrice,
          discount: discount,
          sold: totalSold,
          stock: product.stock || 0,
          rating: product.rating || 0,
          reviews: product.numReviews || 0,
          isBestseller: isBestseller,
          isFeatured: isFeatured,
          featured: isFeatured,
          isNew: isNew,
          isOnSale: isOnSale,
          createdAt: product.createdAt,
          subProducts: product.subProducts || []
        };
      } catch (transformError) {
        console.error('[Search API] Transform error for product:', product._id, transformError);
        return null;
      }
    }).filter(Boolean); // Remove null values

    console.log('[Search API] Transformed products:', transformedProducts.length);

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      products: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}