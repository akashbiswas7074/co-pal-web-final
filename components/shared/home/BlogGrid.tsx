"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight, PenTool } from "lucide-react";
import { format } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";

interface BlogGridProps {
    blogs: any[];
}

const BlogGrid: React.FC<BlogGridProps> = ({ blogs }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        breakpoints: {
            "(min-width: 768px)": { slidesToScroll: 2 },
            "(min-width: 1024px)": { slidesToScroll: 3 }
        }
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    if (!blogs || blogs.length === 0) return null;

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Recent Blogs
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto font-medium">
                        Stay updated with the latest trends and stories from the world of scents.{" "}
                        <span className="font-bold text-gray-900">Read. Learn. Explore!</span>
                    </p>
                </div>

                <div className="relative">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-8">
                            {blogs.map((blog) => (
                                <div key={blog._id} className="flex-[0_0_100%] min-w-0 pl-8 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                                    <article className="group bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 h-full flex flex-col">
                                        <Link href={`/blog/${blog.slug}`} className="block relative aspect-[4/3] overflow-hidden rounded-[2.5rem]">
                                            <Image
                                                src={blog.mainImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Optional Overlay if header text is used inside, but for now matching the user image style */}
                                        </Link>

                                        <div className="pt-6 pb-2 px-2 flex flex-col flex-grow">
                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] md:text-xs text-gray-400 mb-3 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {format(new Date(blog.date), "MMMM dd, yyyy")}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <User size={14} className="text-gray-400" />
                                                    {blog.author}
                                                </span>
                                                {blog.editor && (
                                                    <span className="flex items-center gap-1.5">
                                                        <PenTool size={14} className="text-gray-400" />
                                                        Editor: {blog.editor}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg md:text-xl font-bold mb-3 line-clamp-2 transition-colors leading-tight text-gray-900 group-hover:text-amber-700">
                                                <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                                            </h3>

                                            <p className="text-gray-500 text-xs md:text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                                                {blog.excerpt}
                                            </p>

                                            <Link
                                                href={`/blog/${blog.slug}`}
                                                className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest group/link mt-auto transition-all text-gray-900 hover:text-amber-700"
                                            >
                                                Read more
                                                <ArrowRight size={16} className="group-hover/link:translate-x-2 transition-transform" />
                                            </Link>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Custom Navigation Buttons based on User Image */}
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-100 ${prevBtnEnabled
                                ? "bg-gray-100 text-black hover:bg-gray-200"
                                : "bg-gray-50 text-gray-300 cursor-not-allowed"
                                }`}
                            aria-label="Previous blog"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${nextBtnEnabled
                                ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            aria-label="Next blog"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogGrid;
