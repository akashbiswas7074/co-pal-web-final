"use server";

import { connectToDatabase } from "../connect";
import FeaturedReview from "../models/featured-review.model";

export const getFeaturedReview = async () => {
    try {
        await connectToDatabase();

        const reviews = await FeaturedReview.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return {
            success: true,
            review: reviews ? JSON.parse(JSON.stringify(reviews)) : [],
        };
    } catch (error) {
        console.error("Error fetching featured review:", error);
        return {
            success: false,
            review: null,
            error: "Failed to fetch featured review",
        };
    }
};
