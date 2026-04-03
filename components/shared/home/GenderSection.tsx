"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GenderCard = ({ category }: { category: any }) => {
    return (
        <Link
            href={category.link}
            className="relative block aspect-square group overflow-hidden rounded-none"
        >
            <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

            {/* Top Branding */}
            <div className="absolute top-4 inset-x-0 flex justify-center">
                <span className="text-white/80 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                    SCENT-RIX
                </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 inset-x-4 flex justify-between items-end">
                {/* Badge */}
                <div className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded-full uppercase">
                    Collection
                </div>

                {/* Name */}
                <div className="text-white text-right">
                    <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none">
                        {category.title}
                    </h4>
                    <div className="h-[1px] w-full bg-white/50 mt-1 origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
            </div>
        </Link>
    );
};

const GenderSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps",
        dragFree: true
    });

    const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const genderCategories = [
        {
            title: "Men",
            image: "/home/akashbiswas/.gemini/antigravity/brain/5096f974-2f4d-4794-86a5-37515c142de6/gender_men_perfume_1773014833929.png",
            link: "/shop?gender=men",
        },
        {
            title: "Women",
            image: "/home/akashbiswas/.gemini/antigravity/brain/5096f974-2f4d-4794-86a5-37515c142de6/gender_women_perfume_1773014858868.png",
            link: "/shop?gender=women",
        },
        {
            title: "Unisex",
            image: "/home/akashbiswas/.gemini/antigravity/brain/5096f974-2f4d-4794-86a5-37515c142de6/gender_unisex_perfume_1773014876452.png",
            link: "/shop?gender=unisex",
        },
    ];

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Gender
                    </h2>

                    <div className="flex gap-2">
                        <button
                            onClick={scrollPrev}
                            className="p-2 rounded-full bg-gray-50 border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="p-2 rounded-full bg-gray-50 border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="embla" ref={emblaRef}>
                    <div className="embla__container flex -ml-4">
                        {genderCategories.map((category) => (
                            <div
                                key={category.title}
                                className="embla__slide flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] pl-4"
                            >
                                <GenderCard category={category} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GenderSection;
