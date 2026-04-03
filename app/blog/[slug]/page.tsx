import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getBlogBySlug } from "@/lib/database/actions/blog.actions";

interface BlogPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
    const { slug } = await params;
    const result = await getBlogBySlug(slug);

    if (!result.success || !result.blog) {
        notFound();
    }

    const blog = result.blog;

    return (
        <article className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full">
                <Image
                    src={blog.mainImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="container mx-auto px-6 text-center text-white">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium mb-8 hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-sm md:text-base">
                            <span className="flex items-center gap-2">
                                <Calendar size={18} />
                                {format(new Date(blog.date), "MMMM dd, yyyy")}
                            </span>
                            <span className="flex items-center gap-2">
                                <User size={18} />
                                {blog.author}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 -mt-20 relative z-10">
                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-xl max-w-5xl mx-auto">
                    {/* Excerpt */}
                    <p className="text-xl md:text-2xl text-gray-600 font-medium italic mb-12 border-l-4 border-amber-500 pl-6">
                        {blog.excerpt}
                    </p>

                    {/* Main Content (Rich Text) */}
                    <div
                        className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-amber-600 hover:prose-a:text-amber-700"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Tags (if any) */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
