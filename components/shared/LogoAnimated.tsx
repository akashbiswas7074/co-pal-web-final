"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import defaultPeedsPaths from "./PeedsSvgPaths.json";
import { LOGO_PATHS } from "./LogoPaths";

interface LogoAnimatedProps {
  className?: string;
  logoUrl?: string | null;
}

export default function LogoAnimated({ className = "", logoUrl }: LogoAnimatedProps) {
  // If logoUrl matches the active Cloudinary SVG or is null/empty, we can start immediately with the 7 paths!
  const isCloudinaryActiveSvg = !logoUrl || logoUrl.includes("g3owbo9byi5xmltnmmc3.svg");
  const isSvgUrl = Boolean(logoUrl && (logoUrl.endsWith(".svg") || logoUrl.includes("format=svg") || logoUrl.includes(".svg?")));

  const [paths, setPaths] = useState<string[]>(isCloudinaryActiveSvg ? defaultPeedsPaths : []);
  const [viewBox, setViewBox] = useState<string>(isCloudinaryActiveSvg ? "0 0 5000 1916" : "0 0 1220 731");

  useEffect(() => {
    if (isCloudinaryActiveSvg) {
      setPaths(defaultPeedsPaths);
      setViewBox("0 0 5000 1916");
      return;
    }

    if (!isSvgUrl || !logoUrl) {
      return;
    }

    let isCancelled = false;
    async function fetchSvg() {
      try {
        const res = await fetch(logoUrl!);
        if (!res.ok) throw new Error("Failed to fetch custom SVG");
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svgEl = doc.querySelector("svg");
        if (svgEl) {
          const vb = svgEl.getAttribute("viewBox") || "0 0 5000 1916";
          const pathElements = Array.from(svgEl.querySelectorAll("path"));
          const extracted = pathElements.map((p) => p.getAttribute("d") || "").filter(Boolean);
          if (!isCancelled && extracted.length > 0) {
            setViewBox(vb);
            setPaths(extracted);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading custom preloader SVG:", err);
      }
      if (!isCancelled) {
        setPaths(defaultPeedsPaths);
        setViewBox("0 0 5000 1916");
      }
    }

    fetchSvg();
    return () => {
      isCancelled = true;
    };
  }, [logoUrl, isCloudinaryActiveSvg, isSvgUrl]);

  // If it is a non-SVG raster image (PNG, JPG), render with standard fade-in
  if (logoUrl && !isSvgUrl && !isCloudinaryActiveSvg) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          src={logoUrl}
          alt="Logo"
          className="w-full h-full object-contain filter brightness-0 invert animate-in fade-in duration-500"
          loading="eager"
        />
      </div>
    );
  }

  // If we have extracted SVG paths (e.g. 7 paths for PEEDS)
  if (paths.length > 0) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <motion.svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full max-w-[85vw] max-h-[40vh]"
          style={{ fillRule: "evenodd", clipRule: "evenodd" }}
        >
          {paths.map((d, index) => (
            <motion.path
              key={`path-${index}`}
              d={d}
              stroke="#ffffff"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#ffffff"
              fillRule="evenodd"
              clipRule="evenodd"
              initial={{
                pathLength: 0,
                opacity: 0,
                fillOpacity: 0,
              }}
              animate={{
                pathLength: 1,
                opacity: 1,
                fillOpacity: 1,
              }}
              transition={{
                pathLength: {
                  duration: 1.8,
                  ease: "easeInOut",
                  delay: index * 0.07,
                },
                opacity: {
                  duration: 0.3,
                  delay: index * 0.07,
                },
                fillOpacity: {
                  duration: 0.6,
                  delay: 1.1 + index * 0.05,
                  ease: "easeInOut",
                },
              }}
            />
          ))}
        </motion.svg>
      </div>
    );
  }

  // Fallback to LOGO_PATHS if paths is empty
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1220 731"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[85vw] max-h-[40vh]"
      >
        {LOGO_PATHS.map((path, index) => (
          <motion.path
            key={`fallback-${index}`}
            d={path.d}
            transform={path.transform}
            stroke="#ffffff"
            strokeWidth={2}
            fill="#ffffff"
            initial={{
              pathLength: 0,
              opacity: 0,
              fillOpacity: 0,
            }}
            animate={{
              pathLength: 1,
              opacity: 1,
              fillOpacity: 1,
            }}
            transition={{
              pathLength: {
                duration: 1.8,
                ease: "easeInOut",
                delay: index * 0.05,
              },
              opacity: {
                duration: 0.2,
                delay: index * 0.05,
              },
              fillOpacity: {
                duration: 0.6,
                delay: 1.1 + index * 0.04,
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
