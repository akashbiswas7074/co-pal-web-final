"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LOGO_PATHS } from "./LogoPaths";

// Safely converts SVG attributes to React CamelCase props
const getReactPropsFromAttributes = (node: Element, keyPrefix: string) => {
  const props: any = { key: keyPrefix };
  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    let key = attr.name;
    
    if (key.startsWith('xmlns') || key === 'xml:space' || key === 'style') continue;
    if (key === 'class') key = 'className';
    else if (key.includes('-')) {
      key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
    
    // For path, d is safe.
    props[key] = attr.value;
  }
  return props;
};

// Recursive renderer that crawls the uploaded SVG and converts it to a Framer Motion tree
const recursivelyRenderNode = (node: Element, keyPrefix: string, indexTracker: { count: number }): React.ReactNode => {
  if (node.nodeType !== 1) return null; 
  
  const nodeName = node.nodeName.toLowerCase();
  
  // Strip styles to ensure our dynamic overrides take precedence
  if (nodeName === 'script' || nodeName === 'style') return null;

  const isGeometry = ['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon'].includes(nodeName);
  
  const props = getReactPropsFromAttributes(node, keyPrefix);

  // Check if it naturally had a fill
  const originalHadFill = props.fill && props.fill !== 'none' && props.fill !== 'transparent';
  const originalHadStroke = props.stroke && props.stroke !== 'none' && props.stroke !== 'transparent';

  // Force all paths to be stark White to stand out against the black background
  if (originalHadFill) {
      props.fill = 'white'; 
  } else {
      props.fill = 'transparent';
  }

  if (originalHadStroke) {
      props.stroke = 'white';
  }

  if (isGeometry) {
    // Force a stroke so it can be "drawn"
    props.stroke = 'white'; 
    props.strokeWidth = props.strokeWidth || "1.5";

    // Setup the staggering animation
    const delay = indexTracker.count * 0.05; 
    indexTracker.count++;

    // The Stroke pathLength animates to 1 over 3 seconds. The Fill fades in gradually starting at 1.5s
    // If it had no fill, we keep fillOpacity 0 so it remains just a line.
    props.initial = { pathLength: 0, opacity: 0, fillOpacity: 0 };
    props.animate = { pathLength: 1, opacity: 1, fillOpacity: originalHadFill ? 1 : 0 };
    props.transition = {
      duration: 3,
      ease: "easeInOut",
      delay: Math.min(delay, 2) 
    };
  }

  // Render children recursively preserving all complex <g> groupings
  const children = Array.from(node.childNodes)
    .map((child, i) => child.nodeType === 1 ? recursivelyRenderNode(child as Element, `${keyPrefix}-${i}`, indexTracker) : null)
    .filter(Boolean);

  // Exclude the root <svg> so we don't nest <svg> inside <motion.svg>
  if (nodeName === 'svg') {
    return <>{children}</>;
  }

  if (isGeometry) {
    const MotionComponent = motion[nodeName as keyof typeof motion] as any;
    return React.createElement(MotionComponent, props, children.length > 0 ? children : undefined);
  }

  return React.createElement(nodeName, props, children.length > 0 ? children : undefined);
};

const LogoAnimated: React.FC<{ className?: string; logoUrl?: string | null }> = ({ className = "", logoUrl }) => {
  const [svgTree, setSvgTree] = useState<React.ReactNode | null>(null);
  const [viewBox, setViewBox] = useState<string>("0 0 1220 731");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSvg = async () => {
      // Fallback renderer
      const renderDefault = () => {
        const defaultRender = LOGO_PATHS.map((path, index) => (
          <motion.path
            key={`fallback-${index}`}
            d={path.d}
            transform={path.transform}
            fill="transparent"
            stroke="white"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              delay: index * (1.4 / Math.max(LOGO_PATHS.length, 1))
            }}
          />
        ));
        setSvgTree(defaultRender);
        setViewBox("0 0 1220 731");
      };

      if (!logoUrl || (!logoUrl.endsWith('.svg') && !logoUrl.includes('format=svg'))) {
        renderDefault();
        setIsLoaded(true);
        return;
      }

      try {
        const response = await fetch(logoUrl);
        const svgText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = doc.querySelector("svg");

        if (svgElement) {
          // Parse viewBox or derive from width height to ensure it fits in middle perfectly!
          let vb = svgElement.getAttribute("viewBox");
          if (!vb) {
            const w = svgElement.getAttribute("width");
            const h = svgElement.getAttribute("height");
            if (w && h) vb = `0 0 ${parseInt(w)} ${parseInt(h)}`;
          }
          if (vb) setViewBox(vb);
          
          let tracker = { count: 0 };
          const processedTree = recursivelyRenderNode(svgElement, "svg-root", tracker);
          
          setSvgTree(processedTree);
        } else {
          throw new Error("No SVG container found in upload");
        }
      } catch (error) {
        console.error("Failed to load or parse SVG", error);
        renderDefault();
      } finally {
        setIsLoaded(true);
      }
    };

    loadSvg();
  }, [logoUrl]);

  if (!isLoaded) return null;

  return (
    <div className={`relative ${className}`}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        {svgTree}
      </motion.svg>
    </div>
  );
};

export default LogoAnimated;
