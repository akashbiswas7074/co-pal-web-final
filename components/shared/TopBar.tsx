"use client";
import { getAllTopBars } from "@/lib/database/actions/topbar.actions";
import { handleError } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const TopBarComponent = () => {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => {
    async function fetchBanners() {
      try {
        await getAllTopBars()
          .then((res) => setMessages(res?.topbars ?? []))
          .catch((err) => {
            toast.error("Failed to load top bar messages.");
            console.error("Error fetching top bars:", err);
            setMessages([]);
          });
      } catch (error) {
        handleError(error);
        setMessages([]);
      }
    }
    fetchBanners();
  }, []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!messages) {
    return null;
  }

  return (
    <div className="bg-[#1a0a2c] text-white py-2 px-4 relative border-b border-white/5">
      <div className="embla overflow-hidden max-w-7xl mx-auto" ref={emblaRef}>
        <div className="embla__container flex">
          {messages?.map((message: any, index: number) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
              <div className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                {message.title}
                {message?.button?.title && (
                  message.button.link && !message.button.link.startsWith('#') ? (
                    <Link
                      href={message.button.link}
                      className="ml-[10px] hover:underline underline-offset-4 transition-all inline-flex items-center"
                    >
                      <button style={{ color: message.button.color ?? 'inherit' }}>
                        {message.button.title}
                      </button>
                    </Link>
                  ) : (
                    <a
                      href={message.button.link || '#'}
                      className="ml-[10px] hover:underline underline-offset-4 transition-all inline-flex items-center"
                    >
                      <button style={{ color: message.button.color ?? 'inherit' }}>
                        {message.button.title}
                      </button>
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-3 h-3" />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        onClick={scrollNext}
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export default TopBarComponent;
