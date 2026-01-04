"use server";

import { connectToDatabase } from "@/lib/database/connect";
import SizeGuide from "@/lib/database/models/size-guide.model";
import Category from "@/lib/database/models/category.model";
import { ISizeGuide } from "@/lib/database/models/size-guide.model";

export async function getActiveSizeGuide() {
  try {
    await connectToDatabase();
    
    const activeConfig = await SizeGuide.findOne({ isActive: true }).lean() as ISizeGuide | null;
    
    if (!activeConfig) {
      return {
        success: false,
        config: null,
        message: "No active size guide found",
      };
    }
    
    return {
      success: true,
      config: JSON.parse(JSON.stringify(activeConfig)),
    };
  } catch (error) {
    console.error("Error getting active size guide:", error);
    return {
      success: false,
      config: null,
      message: "Failed to fetch size guide",
    };
  }
}

export async function getSizeGuideByCategory(categoryId: string) {
  try {
    await connectToDatabase();
    
    const activeConfig = await SizeGuide.findOne({ isActive: true }).lean() as ISizeGuide | null;
    
    if (!activeConfig) {
      return {
        success: false,
        config: null,
        message: "No active size guide found",
      };
    }

    // Find the specific category size chart
    const categorySizeChart = activeConfig.sizeCharts?.find(
      (chart: any) => chart.categoryId?.toString() === categoryId && chart.isActive
    );

    if (!categorySizeChart) {
      // Return general size guide if no category-specific chart found
      return {
        success: true,
        config: JSON.parse(JSON.stringify(activeConfig)),
        message: "Category-specific size chart not found, showing general size guide",
      };
    }

    // Create a modified config with only the category-specific chart
    const categorySpecificConfig = {
      ...activeConfig,
      sizeCharts: [categorySizeChart],
    };
    
    return {
      success: true,
      config: JSON.parse(JSON.stringify(categorySpecificConfig)),
      categoryName: categorySizeChart.categoryName,
    };
  } catch (error) {
    console.error("Error getting size guide by category:", error);
    return {
      success: false,
      config: null,
      message: "Failed to fetch category-specific size guide",
    };
  }
}

export async function getSizeGuideByCategoryName(categoryName: string) {
  try {
    await connectToDatabase();
    
    const activeConfig = await SizeGuide.findOne({ isActive: true }).lean() as ISizeGuide | null;
    
    if (!activeConfig) {
      return {
        success: false,
        config: null,
        message: "No active size guide found",
      };
    }

    // Find the specific category size chart by name
    const categorySizeChart = activeConfig.sizeCharts?.find(
      (chart: any) => 
        chart.categoryName?.toLowerCase() === categoryName.toLowerCase() && 
        chart.isActive
    );

    if (!categorySizeChart) {
      // Return general size guide if no category-specific chart found
      return {
        success: true,
        config: JSON.parse(JSON.stringify(activeConfig)),
        message: "Category-specific size chart not found, showing general size guide",
      };
    }

    // Create a modified config with only the category-specific chart
    const categorySpecificConfig = {
      ...activeConfig,
      sizeCharts: [categorySizeChart],
    };
    
    return {
      success: true,
      config: JSON.parse(JSON.stringify(categorySpecificConfig)),
      categoryName: categorySizeChart.categoryName,
    };
  } catch (error) {
    console.error("Error getting size guide by category name:", error);
    return {
      success: false,
      config: null,
      message: "Failed to fetch category-specific size guide",
    };
  }
}

export async function getAllCategoriesWithSizeCharts() {
  try {
    await connectToDatabase();
    
    const activeConfig = await SizeGuide.findOne({ isActive: true }).lean() as ISizeGuide | null;
    
    if (!activeConfig) {
      return {
        success: false,
        categories: [],
        message: "No active size guide found",
      };
    }

    // Get all categories that have size charts
    const categoriesWithCharts = activeConfig.sizeCharts
      ?.filter((chart: any) => chart.isActive)
      .map((chart: any) => ({
        categoryId: chart.categoryId,
        categoryName: chart.categoryName,
        description: chart.description,
        measurementUnits: chart.measurementUnits,
        order: chart.order,
      }))
      .sort((a: any, b: any) => a.order - b.order) || [];
    
    return {
      success: true,
      categories: JSON.parse(JSON.stringify(categoriesWithCharts)),
    };
  } catch (error) {
    console.error("Error getting categories with size charts:", error);
    return {
      success: false,
      categories: [],
      message: "Failed to fetch categories with size charts",
    };
  }
}