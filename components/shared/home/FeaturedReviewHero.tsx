"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Star, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface ReviewData {
    quote: string;
    reviewerName: string;
    reviewerSubtext?: string;
    stars: number;
    totalReviewsText: string;
    averageRatingText: string;
    backgroundImage?: string;
    isVerified?: boolean;
    quoteColor?: string;
    reviewerNameColor?: string;
    reviewerSubtextColor?: string;
    socialProofColor?: string;
}

interface FeaturedReviewProps {
    data: ReviewData[] | null;
}

const FeaturedReviewHero: React.FC<FeaturedReviewProps> = ({ data }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    if (!data || data.length === 0) return null;

    return (
        <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {data.map((review, index) => (
                        <div key={index} className="flex-[0_0_100%] min-w-0 relative flex items-center h-full">
                            {/* Background with Dark Overlay */}
                            <div className="absolute inset-0">
                                <Image
                                    src={review.backgroundImage || "https://res.cloudinary.com/dlrlet9fg/image/upload/v1727319639/bg-placeholder.webp"}
                                    alt="Featured Review Background"
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                            </div>

                            <div className="container mx-auto px-6 relative z-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    {/* Left Side: Quote */}
                                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
                                        <div
                                            className="text-6xl md:text-8xl font-serif mb-2 leading-none opacity-40"
                                            style={{ color: review.quoteColor || "#ffffff" }}
                                        >
                                            “
                                        </div>
                                        <h2
                                            className="text-2xl md:text-4xl font-semibold leading-tight mb-8"
                                            style={{ color: review.quoteColor || "#ffffff" }}
                                        >
                                            {review.quote}
                                        </h2>

                                        <div className="flex flex-col items-center lg:items-start">
                                            <div className="flex gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={i < review.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
                                                    />
                                                ))}
                                            </div>
                                            <p
                                                className="text-lg font-medium flex items-center gap-2"
                                                style={{ color: review.reviewerNameColor || "#ffffff" }}
                                            >
                                                {review.reviewerName}
                                                {review.isVerified && (
                                                    <CheckCircle size={18} className="text-green-400" />
                                                )}
                                            </p>
                                            {review.reviewerSubtext && (
                                                <p
                                                    className="text-sm"
                                                    style={{ color: review.reviewerSubtextColor || "rgba(255, 255, 255, 0.7)" }}
                                                >
                                                    {review.reviewerSubtext}
                                                </p>
                                            )}
                                        </div>

                                        {/* Pagination Dots */}
                                        <div className="flex gap-2 mt-8">
                                            {data.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedIndex === i ? "bg-white w-6" : "bg-white/30"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Side: Social Proof Graphic */}
                                    <div className="hidden lg:flex justify-center items-center">
                                        <div className="relative">
                                            {/* Bursts/Graphic background */}
                                            <div className="absolute inset-0 scale-150 opacity-30 animate-pulse">
                                                <div className="absolute inset-0 border-[40px] border-white/10 rounded-full" />
                                                <div className="absolute inset-x-[-50%] top-1/2 h-[1px] bg-white/20 rotate-45" />
                                                <div className="absolute inset-x-[-50%] top-1/2 h-[1px] bg-white/20 -rotate-45" />
                                                <div className="absolute inset-y-[-50%] left-1/2 w-[1px] bg-white/20" />
                                            </div>

                                            <div className="relative text-center p-8">
                                                <div
                                                    className="text-8xl md:text-9xl font-black tracking-tighter mb-0"
                                                    style={{ color: review.socialProofColor || "#ffffff" }}
                                                >
                                                    {review.totalReviewsText}
                                                </div>
                                                <div
                                                    className="text-xl md:text-2xl font-bold uppercase tracking-widest mt-[-10px]"
                                                    style={{ color: review.socialProofColor || "#ffffff" }}
                                                >
                                                    Verified <span className="text-yellow-400">{review.averageRatingText} Star</span> Reviews
                                                </div>
                                                <div className="flex justify-center gap-2 mt-4">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={28} className="fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            {data.length > 1 && (
                <>
                    <button
                        onClick={scrollPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}
        </section>
    );
};

export default FeaturedReviewHero;
