export interface UniqueTag {
    name: string;
    values: string[];
}

/**
 * Extract unique tags from a given array of products
 * This is useful for getting tags relevant to filtered products
 */
export const extractTagsFromProducts = (products: any[]): UniqueTag[] => {
    try {
        // Use normalized (lowercase) tag name as key
        // Store original name with count to pick the most common one
        const tagMap: Map<string, { nameCounts: Map<string, number>; values: Set<string> }> = new Map();

        products.forEach((product: any) => {
            if (product.tagValues && Array.isArray(product.tagValues)) {
                product.tagValues.forEach((tv: any) => {
                    // Handle both populated and unpopulated tag references
                    const tagName = typeof tv.tag === 'object' && tv.tag?.name
                        ? tv.tag.name
                        : tv.tag;
                    const tagValue = tv.value?.trim();

                    if (tagName && tagValue) {
                        // Normalize tag name to lowercase for grouping (case-insensitive)
                        const normalizedName = tagName.trim().toLowerCase();
                        const originalName = tagName.trim();
                        
                        if (!tagMap.has(normalizedName)) {
                            tagMap.set(normalizedName, {
                                nameCounts: new Map(),
                                values: new Set()
                            });
                        }
                        
                        const tagData = tagMap.get(normalizedName)!;
                        // Count occurrences of each name variant
                        tagData.nameCounts.set(originalName, (tagData.nameCounts.get(originalName) || 0) + 1);
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

        return uniqueTags;
    } catch (error) {
        console.error("Error extracting tags from products:", error);
        return [];
    }
};
