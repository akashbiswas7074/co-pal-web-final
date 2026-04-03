"use server";

import { connectToDatabase } from "../connect";
import InfluencerSpotlight from "../models/influencer-spotlight.model";

export const getActiveInfluencers = async () => {
    try {
        await connectToDatabase();

        const influencers = await InfluencerSpotlight.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return {
            success: true,
            influencers: JSON.parse(JSON.stringify(influencers)),
        };
    } catch (error) {
        console.error("Error fetching influencer spotlights:", error);
        return {
            success: false,
            influencers: [],
            error: "Failed to fetch influencer spotlights",
        };
    }
};
