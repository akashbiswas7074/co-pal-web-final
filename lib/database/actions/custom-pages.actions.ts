"use server";

import { connectToDatabase } from "../connect";
import CustomPage from "../models/custom-page.model";

export async function getCustomPageBySlug(slug: string) {
  try {
    await connectToDatabase();
    console.log("Searching for custom page with slug:", slug);
    // Only fetch if active
    const page = await CustomPage.findOne({ slug, isActive: true });
    
    if (!page) {
      console.log("Custom page NOT FOUND for slug:", slug);
      // Let's also check if it exists but is inactive
      const inactivePage = await CustomPage.findOne({ slug });
      if (inactivePage) {
        console.log("Page EXISTS but is INACTIVE:", slug);
      }
      return { success: false, message: "Page not found" };
    }
    console.log("Custom page FOUND:", page.title);

    return { 
      success: true, 
      page: JSON.parse(JSON.stringify(page)) 
    };
  } catch (error: any) {
    console.error("Error fetching custom page by slug:", error);
    return { success: false, message: "Failed to fetch page" };
  }
}

export async function getAllActiveCustomPageSlugs() {
  try {
    await connectToDatabase();
    const pages = await CustomPage.find({ isActive: true }).select('slug');
    return pages.map(p => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error fetching active page slugs:", error);
    return [];
  }
}
