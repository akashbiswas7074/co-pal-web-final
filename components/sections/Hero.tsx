'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlideContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  altText: string;
  color: string;
  textColor: string;
}

interface HeroProps {
  autoplaySpeed?: number;
}

const Hero: React.FC<HeroProps> = ({ autoplaySpeed = 5000 }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: SlideContent[] = [
    {
      title: "Summer Ready",
      subtitle: "Gear up for the season with our latest collection",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      imageUrl: "/hero-summer.jpg", // Replace with actual image path
      altText: "Summer collection",
      color: "from-blue-400 via-blue-500 to-indigo-600",
      textColor: "text-white"
    },
    {
      title: "New Arrivals",
      subtitle: "Discover the latest trends and styles",
      buttonText: "Explore",
      buttonLink: "/category/new-arrivals",
      imageUrl: "/hero-new-arrivals.jpg", // Replace with actual image path
      altText: "New arrivals collection",
      color: "from-amber-400 via-orange-500 to-red-600",
      textColor: "text-white"
    },
    {
      title: "Premium Sportswear",
      subtitle: "Performance meets style",
      buttonText: "Shop Collection",
      buttonLink: "/category/sportswear",
      imageUrl: "/hero-sportswear.jpg", // Replace with actual image path
      altText: "Sportswear collection",
      color: "from-green-400 via-emerald-500 to-teal-600",
      textColor: "text-white"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [activeSlide, isAutoPlaying, slides.length, autoplaySpeed]);

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setActiveSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setActiveSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={slide.imageUrl}
              alt={slide.altText}
              fill
              priority
              className="object-cover"
            />
            {/* Minimal overlay for text readability */}
            <div className={`absolute inset-0 bg-black/30`}></div>
          </div>

          {/* Content */}
          <div className="relative z-20 flex flex-col justify-center items-center text-center h-full max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter leading-[0.9] mb-6 ${slide.textColor}`}>
                {slide.title}
              </h1>
              <p className={`text-sm md:text-lg mb-8 uppercase tracking-[0.3em] font-medium ${slide.textColor} opacity-90`}>
                {slide.subtitle}
              </p>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-black hover:text-white transition-all duration-300 rounded-none px-10 py-7 uppercase tracking-widest text-xs font-bold"
                asChild
              >
                <Link href={slide.buttonLink}>
                  {slide.buttonText}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute bottom-6 right-6 z-30 flex space-x-2">
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          onClick={handlePrevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          onClick={handleNextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveSlide(index);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSlide === index
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
