import React from "react";
import { getRecentBlogs } from "@/lib/database/actions/blog.actions";
import BlogGrid from "@/components/shared/home/BlogGrid";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BlogListingPage() {
    const result = await getRecentBlogs(12); // Fetch more for the listing page
    const blogs = result.success ? result.blogs : [];

    return (
        <main className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors mb-4"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold">Our Blog</h1>
                        <p className="text-gray-600 mt-4 max-w-2xl">
                            Discover stories, tips, and insights from our team. Stay updated with the latest trends and news.
                        </p>
                    </div>
                </div>

                {blogs.length > 0 ? (
                    <BlogGrid blogs={blogs} />
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-400">No blogs found</h3>
                        <p className="text-gray-500 mt-2">Check back later for new content!</p>
                        <Link
                            href="/"
                            className="inline-block mt-8 px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                        >
                            Go to Shop
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
