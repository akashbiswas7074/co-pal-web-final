"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface HighlightItem {
    title: string;
    description?: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    gridSpan?: number;
    bgGradient?: string;
    titleColor?: string;
    descriptionColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

interface CollectionHighlightGridProps {
    title: string;
    subtitle?: string;
    titleColor?: string;
    subtitleColor?: string;
    backgroundColor?: string;
    items: HighlightItem[];
}

const CollectionHighlightGrid: React.FC<CollectionHighlightGridProps> = ({ title, subtitle, items, titleColor, subtitleColor, backgroundColor }) => {
    if (!items || items.length === 0) return null;

    return (
        <section
            className="py-20 overflow-hidden"
            style={{ backgroundColor: backgroundColor || '#ffffff' }}
        >
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="text-center mb-16 space-y-4">
                    <h2
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
                        style={{ color: titleColor }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
                            style={{ color: subtitleColor }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 justify-center">
                    {items.map((item, index) => {
                        // Use gridSpan from DB, default to 1 if not provided or 0
                        const gridSpan = item.gridSpan || 1;
                        let span = "md:col-span-4"; // Default for gridSpan 1

                        if (gridSpan === 2) {
                            span = "md:col-span-8";
                        } else if (gridSpan === 3) {
                            span = "md:col-span-12";
                        } else if (items.length <= 2) {
                            // If there are only 1 or 2 items with gridSpan 1, give them more space
                            span = "md:col-span-6";
                        }

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`${span} relative group h-[400px] sm:h-[500px] md:h-[650px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500`}
                            >
                                {/* Background Image */}
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Overlay / Gradient */}
                                {item.bgGradient ? (
                                    <div
                                        className="absolute inset-0 z-10"
                                        style={{ background: item.bgGradient }}
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"
                                    />
                                )}

                                {/* Content */}
                                <div className="absolute inset-0 z-20 p-10 sm:p-14 flex flex-col justify-between">
                                    <div className="max-w-[90%] space-y-4">
                                        <h3
                                            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight transition-colors"
                                            style={{ color: item.titleColor || '#111827' }}
                                        >
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p
                                                className="text-gray-600 text-sm sm:text-base font-medium line-clamp-2"
                                                style={{ color: item.descriptionColor || 'rgba(0,0,0,0.6)' }}
                                            >
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <Link
                                            href={item.buttonLink}
                                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all duration-300 transform group-hover:translate-x-2"
                                            style={{
                                                backgroundColor: item.buttonColor || 'white',
                                                color: item.buttonTextColor || 'black'
                                            }}
                                        >
                                            <span
                                                className="p-1 rounded-full transition-colors"
                                                style={{
                                                    backgroundColor: item.buttonTextColor || 'black',
                                                    color: item.buttonColor || 'white'
                                                }}
                                            >
                                                <ArrowRight size={14} />
                                            </span>
                                            {item.buttonText}
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CollectionHighlightGrid;
