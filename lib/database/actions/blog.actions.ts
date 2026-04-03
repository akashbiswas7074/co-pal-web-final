"use server";

import { connectToDatabase } from "../connect";
import Blog from "../models/blog.model";

export const getRecentBlogs = async (limit = 3) => {
    try {
        await connectToDatabase();

        const blogs = await Blog.find({ isActive: true })
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        return {
            success: true,
            blogs: JSON.parse(JSON.stringify(blogs)),
        };
    } catch (error) {
        console.error("Error fetching recent blogs:", error);
        return {
            success: false,
            blogs: [],
            error: "Failed to fetch blogs",
        };
    }
};

export const getBlogBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const blog = await Blog.findOne({ slug, isActive: true }).lean();

        if (!blog) {
            return {
                success: false,
                error: "Blog not found",
            };
        }

        return {
            success: true,
            blog: JSON.parse(JSON.stringify(blog)),
        };
    } catch (error) {
        console.error("Error fetching blog by slug:", error);
        return {
            success: false,
            error: "Failed to fetch blog",
        };
    }
};
