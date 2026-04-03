"use server";

import { connectToDatabase } from "@/lib/database/connect";
import CollectionHighlight from "@/lib/database/models/collection-highlight.model";

export const getActiveCollectionHighlight = async () => {
    try {
        await connectToDatabase();
        const highlight = await CollectionHighlight.findOne({ isActive: true }).sort({ order: 1 }).lean();
        return highlight ? JSON.parse(JSON.stringify(highlight)) : null;
    } catch (error: any) {
        console.error("Error fetching active collection highlight:", error);
        return null;
    }
};
