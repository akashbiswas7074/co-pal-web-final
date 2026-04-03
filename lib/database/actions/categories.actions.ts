"use server";

import { handleError } from "@/lib/utils";
import { connectToDatabase } from "../connect";
import Category from "../models/category.model";
import { unstable_cache } from "next/cache";

// Define more specific types for the category data
interface LeanImage {
  url?: string;
  public_id?: string;
  _id?: string; // Mongoose subdocuments often have an _id
}

interface LeanCategory {
  _id: string;
  name: string;
  slug: string;
  images?: LeanImage[];
  createdAt: string; // Dates will be stringified
  updatedAt: string; // Dates will be stringified
  // Add other fields like 'vendor' here if needed and selected
}

// Update the CategoryResult interface to use the more specific LeanCategory type
interface CategoryResult {
  success: boolean;
  message: string;
  categories: LeanCategory[];
}

interface SingleCategoryResult {
  success: boolean;
  message: string;
  category?: LeanCategory;
}

export const getAllCategories = unstable_cache(
  async (): Promise<CategoryResult> => { // Ensure Promise<CategoryResult> not undefined
    try {
      await connectToDatabase();
      // Explicitly select the fields to be fetched
      const categories = await Category.find({})
        .sort({ updatedAt: -1 })
        .select('_id name slug images createdAt updatedAt') // Explicitly select fields
        .lean();

      // The result of lean() should be serializable, but JSON.parse(JSON.stringify()) ensures it
      // and handles any complex types like Mongoose ObjectIds or Dates correctly for Next.js server actions.
      const plainCategories: LeanCategory[] = JSON.parse(JSON.stringify(categories));

      return {
        success: true,
        message: "Successfully fetched all categories.",
        categories: plainCategories,
      };
    } catch (error) {
      const errorResult = handleError(error);
      const errorMessage =
        typeof errorResult === 'object' && errorResult !== null && 'error' in errorResult && typeof errorResult.error === 'string'
          ? errorResult.error
          : "Failed to fetch categories due to an unexpected error.";

      return {
        success: false,
        message: errorMessage,
        categories: [],
      };
    }
  },
  ["all_categories"], // Cache key
  {
    revalidate: 1800, // Revalidate every 30 minutes (optional)
  }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<SingleCategoryResult> => {
    try {
      if (!slug) {
        return {
          success: false,
          message: "Category slug is required",
        };
      }

      await connectToDatabase();

      // Find the category by slug
      const category = await Category.findOne({ slug })
        .select('_id name slug images createdAt updatedAt')
        .lean();

      if (!category) {
        return {
          success: false,
          message: `Category with slug "${slug}" not found`,
        };
      }

      // Ensure the data is serializable for Next.js
      const plainCategory: LeanCategory = JSON.parse(JSON.stringify(category));

      return {
        success: true,
        message: "Category fetched successfully",
        category: plainCategory,
      };
    } catch (error) {
      const errorResult = handleError(error);
      const errorMessage =
        typeof errorResult === 'object' && errorResult !== null && 'error' in errorResult && typeof errorResult.error === 'string'
          ? errorResult.error
          : "Failed to fetch category due to an unexpected error.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  },
  ["category_by_slug"], // Cache key prefix
  {
    revalidate: 1800, // Revalidate every 30 minutes
  }
);

// Add new function to get categories with product counts
export const getCategoriesWithProductCount = unstable_cache(
  async (): Promise<CategoryResult & { categoriesWithCount?: any[] }> => {
    try {
      await connectToDatabase();

      // Import Product model
      const Product = (await import("../models/product.model")).default;

      // Get categories with aggregation to count products
      const categoriesWithCount = await Category.aggregate([
        {
          $lookup: {
            from: 'products', // MongoDB collection name (lowercase + plural)
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            images: 1,
            createdAt: 1,
            updatedAt: 1,
            productCount: { $size: '$products' }
          }
        },
        {
          $sort: { updatedAt: -1 }
        }
      ]);

      // Ensure the data is serializable
      const plainCategories = JSON.parse(JSON.stringify(categoriesWithCount));

      return {
        success: true,
        message: "Successfully fetched categories with product counts.",
        categories: plainCategories,
        categoriesWithCount: plainCategories
      };
    } catch (error) {
      console.error('Error in getCategoriesWithProductCount:', error);
      const errorResult = handleError(error);
      const errorMessage =
        typeof errorResult === 'object' && errorResult !== null && 'error' in errorResult && typeof errorResult.error === 'string'
          ? errorResult.error
          : "Failed to fetch categories with product counts.";

      return {
        success: false,
        message: errorMessage,
        categories: [],
      };
    }
  },
  ["categories_with_product_count"],
  {
    revalidate: 1800,
  }
);
// get categories with their sub-categories
export const getCategoriesWithSubcategories = unstable_cache(
  async () => {
    try {
      await connectToDatabase();

      const categories = await Category.aggregate([
        {
          $lookup: {
            from: 'subcategories', // Mongoose usually pluralizes and lowercases
            localField: '_id',
            foreignField: 'parent',
            as: 'subCategories'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            subCategories: {
              $map: {
                input: '$subCategories',
                as: 'sub',
                in: {
                  _id: '$$sub._id',
                  name: '$$sub.name',
                  slug: '$$sub.slug'
                }
              }
            }
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);

      return {
        success: true,
        categories: JSON.parse(JSON.stringify(categories)),
        message: "Successfully fetched categories with subcategories."
      };
    } catch (error) {
      console.error("Error in getCategoriesWithSubcategories:", error);
      return {
        success: false,
        categories: [],
        message: "Failed to fetch categories with subcategories."
      };
    }
  },
  ["categories_with_subcategories"],
  {
    revalidate: 1800,
  }
);
