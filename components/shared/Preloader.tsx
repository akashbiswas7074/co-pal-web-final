"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LogoAnimated from "./LogoAnimated";
import { usePreloaderSettings } from "@/hooks/use-preloader-settings";

const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { settings, isLoading: logoLoading } = usePreloaderSettings();

  useEffect(() => {
    // Check if preloader was already shown in this session
    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem("peeds_preloader_shown");
      if (alreadyShown) {
        setLoading(false);
        if (typeof document !== "undefined") document.body.style.overflow = "";
        return;
      }
    }

    // If settings are evaluated and preloader is not enabled, dismiss immediately
    if (!logoLoading && !settings.isActive) {
      setLoading(false);
      if (typeof window !== "undefined") sessionStorage.setItem("peeds_preloader_shown", "true");
      if (typeof document !== "undefined") document.body.style.overflow = "";
      return;
    }

    // Snappy duration for animation
    const timer = setTimeout(() => {
      setLoading(false);
      if (typeof window !== "undefined") sessionStorage.setItem("peeds_preloader_shown", "true");
      if (typeof document !== "undefined") document.body.style.overflow = "";
    }, 1500); 

    return () => {
      clearTimeout(timer);
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, [logoLoading, settings.isActive]);

  // If loading is done or inactive, unmount immediately so it cannot block touch events
  if (!loading || (!logoLoading && !settings.isActive)) return null;

  // Prevent flashing before logo settings are evaluated
  if (logoLoading) return null;

  // If the preloader setting is inactive or there's no custom URL, fallback to default geometric paths
  const logoUrl = settings.isActive && settings.logoUrl ? settings.logoUrl : null;
  const isSvg = logoUrl && (logoUrl.endsWith('.svg') || logoUrl.includes('format=svg'));

  return (
    <AnimatePresence onExitComplete={() => {
      if (typeof document !== "undefined") document.body.style.overflow = "";
    }}>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onTouchStart={() => {
            setLoading(false);
            if (typeof window !== "undefined") sessionStorage.setItem("peeds_preloader_shown", "true");
            if (typeof document !== "undefined") document.body.style.overflow = "";
          }}
          onClick={() => {
            setLoading(false);
            if (typeof window !== "undefined") sessionStorage.setItem("peeds_preloader_shown", "true");
            if (typeof document !== "undefined") document.body.style.overflow = "";
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] lg:w-[750px] lg:h-[750px] flex items-center justify-center"
          >
            {isSvg || !logoUrl ? (
               <LogoAnimated className="w-full h-full" logoUrl={logoUrl} />
            ) : (
               <div className="relative w-[300px] h-[100px] md:w-[400px] md:h-[130px]">
                  <Image 
                    src={logoUrl} 
                    alt="Logo" 
                    fill 
                    className="object-contain" 
                  />
               </div>
            )}
          </motion.div>

          {/* Progress Indicator */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "240px" }}
            transition={{ duration: 3.0, ease: "easeInOut" }}
            className="absolute bottom-24 h-[1px] bg-white/20 overflow-hidden"
          >
            <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "0%" }}
               transition={{ duration: 3.0, ease: "easeInOut" }}
               className="w-full h-full bg-white"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default Preloader;
