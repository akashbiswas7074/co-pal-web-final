"use client";

import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ProductCardSmall } from "@/components/shared/product/ProductCardSmall";

interface Product {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    subtitle?: string;
    description?: string;
    isNew?: boolean;
    isHot?: boolean;
    status?: string;
    rating?: number;
    reviews?: number;
    subProducts?: any[];
    images?: any[];
}

interface FeaturedCollectionProps {
    featuredProducts: Product[];
    newArrivals: Product[];
}


export default function FeaturedCollection({ featuredProducts, newArrivals }: FeaturedCollectionProps) {
    const [activeTab, setActiveTab] = useState<"best-sellers" | "new-arrivals">("best-sellers");
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps",
        dragFree: true
    });

    const products = activeTab === "best-sellers" ? featuredProducts : newArrivals;

    useEffect(() => {
        if (emblaApi) {
            emblaApi.reInit();
            emblaApi.scrollTo(0);
        }
    }, [emblaApi, activeTab, products]);

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    return (
        <section className="relative py-20 bg-white">

            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight text-center">
                        Featured Collection
                    </h2>

                    <div className="flex p-1 bg-[#f5f5f5] rounded-xl">
                        <button
                            onClick={() => setActiveTab("best-sellers")}
                            className={`px-8 sm:px-12 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === "best-sellers"
                                ? "bg-black text-white shadow-md"
                                : "text-gray-500 hover:text-black"
                                }`}
                        >
                            Best Sellers
                        </button>
                        <button
                            onClick={() => setActiveTab("new-arrivals")}
                            className={`px-8 sm:px-12 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === "new-arrivals"
                                ? "bg-black text-white shadow-md"
                                : "text-gray-500 hover:text-black"
                                }`}
                        >
                            New Arrivals
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div className="embla overflow-hidden" ref={emblaRef}>
                        <div className="embla__container flex -ml-4 md:-ml-6">
                            {(products && products.length > 0 ? products : []).map((product) => (
                                <div key={product.id} className="embla__slide flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_31%] lg:flex-[0_0_23%] xl:flex-[0_0_19%] pl-4 md:pl-6 pb-4">
                                    <div className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden h-full">
                                        <ProductCardSmall product={product as any} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center items-center gap-4 mt-16">
                        <button
                            onClick={scrollPrev}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-black hover:bg-black/5 hover:border-black transition-all"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-black hover:bg-black/5 hover:border-black transition-all"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
