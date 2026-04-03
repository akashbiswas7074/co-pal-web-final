"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LogoAnimated from "./LogoAnimated";


const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after a fixed duration to allow path animation to finish
    // Logo animation takes about 4.4s (3s duration + up to 1.4s staggered delay)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 seconds duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center"
          >
            <LogoAnimated className="w-full h-full" />
          </motion.div>

          {/* Progress Indicator */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "240px" }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
            className="absolute bottom-24 h-[1px] bg-white/20 overflow-hidden"
          >
            <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "0%" }}
               transition={{ duration: 4.5, ease: "easeInOut" }}
               className="w-full h-full bg-white"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default Preloader;
