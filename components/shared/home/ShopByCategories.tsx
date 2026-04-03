"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Category {
    _id: string;
    name: string;
    slug: string;
    images?: { url: string }[];
}

interface ShopByCategoriesProps {
    categories: Category[];
}

const CategoryCard = ({ category }: { category: Category }) => {
    const imageUrl = category.images?.[0]?.url || "/placeholder.png";

    return (
        <Link
            href={`/shop?category=${category._id}`}
            className="relative block aspect-[4/3] group overflow-hidden rounded-[2.5rem]"
        >
            <Image
                src={imageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />

            {/* Middle Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg text-center px-4">
                    {category.name}
                </h3>
            </div>
        </Link>
    );
};

const ShopByCategories = ({ categories }: ShopByCategoriesProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        breakpoints: {
            "(min-width: 1024px)": { slidesToScroll: 3 }
        }
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false);

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!categories || categories.length === 0) return null;

    const showNavigation = categories.length > 3;

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Shop By Categories
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto font-medium">
                        We've got something to cater to every one of you!{" "}
                        <span className="font-bold text-gray-900">Choose. Select. Buy. Enjoy!</span>
                    </p>
                </div>

                <div className="relative">
                    <div className="embla" ref={emblaRef}>
                        <div className="embla__container flex -ml-8">
                            {categories.map((category) => (
                                <div
                                    key={category._id}
                                    className="embla__slide flex-[0_0_100%] min-w-0 pl-8 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                                >
                                    <CategoryCard category={category} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {showNavigation && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button
                                onClick={scrollPrev}
                                disabled={!prevBtnEnabled}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-100 ${prevBtnEnabled
                                        ? "bg-gray-100 text-black hover:bg-gray-200"
                                        : "bg-gray-50 text-gray-300 cursor-not-allowed"
                                    }`}
                                aria-label="Previous categories"
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
                                aria-label="Next categories"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ShopByCategories;
