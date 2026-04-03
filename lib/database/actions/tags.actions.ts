"use server";

import { connectToDatabase } from "../connect";
import Product from "../models/product.model";
import Tag from "../models/tag.model";
import { unstable_cache } from "next/cache";

export interface UniqueTag {
    name: string;
    values: string[];
}

export const getUniqueTagsFromProducts = unstable_cache(
    async (): Promise<{ success: boolean; tags: UniqueTag[]; message: string }> => {
        try {
            await connectToDatabase();

            // We need to populate tag names to get unique tags correctly
            const productsWithTags = await Product.find()
                .select("tagValues")
                .populate({ path: "tagValues.tag", model: Tag, select: "name", strictPopulate: false })
                .lean();

            // Use normalized (lowercase) tag name as key
            // Store name variants with counts to pick the most common one
            const tagMap: Map<string, { nameCounts: Map<string, number>; values: Set<string> }> = new Map();

            productsWithTags.forEach((product: any) => {
                if (product.tagValues && Array.isArray(product.tagValues)) {
                    product.tagValues.forEach((tv: any) => {
                        if (tv.tag && tv.tag.name && tv.value) {
                            const tagName = tv.tag.name.trim();
                            const tagValue = tv.value.trim();

                            // Normalize tag name to lowercase for grouping (case-insensitive)
                            // This ensures "BRAND", "brand", "Brand" all get grouped together
                            const normalizedName = tagName.toLowerCase();
                            
                            if (!tagMap.has(normalizedName)) {
                                tagMap.set(normalizedName, {
                                    nameCounts: new Map(),
                                    values: new Set()
                                });
                            }
                            
                            const tagData = tagMap.get(normalizedName)!;
                            // Count occurrences of each name variant
                            tagData.nameCounts.set(tagName, (tagData.nameCounts.get(tagName) || 0) + 1);
                            tagData.values.add(tagValue);
                        }
                    });
                }
            });

            // Convert to array, using the most common name variant (or first if tie)
            const uniqueTags: UniqueTag[] = Array.from(tagMap.entries())
                .map(([normalizedName, { nameCounts, values }]) => {
                    // Get the most common name variant
                    let mostCommonName = normalizedName;
                    let maxCount = 0;
                    nameCounts.forEach((count, name) => {
                        if (count > maxCount) {
                            maxCount = count;
                            mostCommonName = name;
                        }
                    });
                    
                    return {
                        name: mostCommonName,
                        values: Array.from(values).sort(),
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name));

            return {
                success: true,
                message: "Successfully fetched all unique tags from products.",
                tags: uniqueTags,
            };
        } catch (error: any) {
            console.error("Error fetching unique tags:", error);
            return {
                success: false,
                message: error.message || "Failed to fetch tags",
                tags: [],
            };
        }
    },
    ["unique_tags_from_products"],
    {
        revalidate: 1800,
    }
);
