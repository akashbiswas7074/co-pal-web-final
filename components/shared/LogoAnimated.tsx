"use client";

import React from "react";
import { motion } from "framer-motion";
import { LOGO_PATHS } from "./LogoPaths";

const LogoAnimated: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1220 731"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        {LOGO_PATHS.map((path, index) => (
          <motion.path
            key={index}
            d={path.d}
            transform={path.transform}
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              duration: 3, 
              ease: "easeInOut",
              delay: index * 0.1 // Stagger the animation of paths
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
};

export default LogoAnimated;
