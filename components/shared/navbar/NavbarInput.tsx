"use client";
import React, { useState, useEffect } from "react";
import SearchModal from "@/components/shared/SearchModal";
import { Search, X } from "lucide-react";
import { useNavbarSettings } from "@/hooks/use-navbar-settings";

// Add openSearchModal as an optional prop
const NavbarInput = ({ responsive, openSearchModal = false }: { 
  responsive: boolean;
  openSearchModal?: boolean;
}) => {
  const { settings: navbarSettings } = useNavbarSettings();
  const [open, setOpen] = useState<boolean>(openSearchModal);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  
  const hexToRgba = (hex: string, opacity: number) => {
    let r = 0, g = 0, b = 0;
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const dynamicTextColor = navbarSettings?.textColor || '#ffffff';
  const dynamicBgTint = hexToRgba(dynamicTextColor, 0.1);
  const dynamicBorderColor = hexToRgba(dynamicTextColor, 0.2);

  // Effect to handle openSearchModal prop changes
  useEffect(() => {
    if (openSearchModal) {
      setOpen(true);
    }
  }, [openSearchModal]);

  useEffect(() => {
    // Only apply fixed positioning for desktop view (non-responsive mode)
    if (!responsive) {
      const handleScroll = () => {
        // After scrolling 200px, make the search bar fixed
        const shouldBeFixed = window.scrollY > 200;
        setIsFixed(shouldBeFixed);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [responsive]);
  
  // For responsive mobile design
  if (responsive) {
    return (
      <div className="w-full">
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
            style={{ color: dynamicTextColor }}
            size={18}
          />
          <input
            type="search"
            placeholder="Search products..."
            className="pl-10 pr-12 py-2.5 w-full border backdrop-blur-sm rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ 
              backgroundColor: dynamicBgTint, 
              borderColor: dynamicBorderColor,
              color: dynamicTextColor
            }}
            onClick={() => setOpen(true)}
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center justify-center text-[10px] font-sans font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: dynamicBgTint, color: dynamicTextColor, opacity: 0.5 }}
          >
            <span className="mr-0.5">⌘</span>K
          </kbd>
        </div>
        
        <SearchModal 
          isOpen={open} 
          onClose={() => setOpen(false)} 
        />
      </div>
    );
  }
  
  // For desktop design with fixed positioning option
  return (
    <>
      {/* Regular search input in navbar */}
      <div className={`hidden lg:block w-full max-w-md transition-all duration-300 ${isFixed ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
            style={{ color: dynamicTextColor }}
            size={18}
          />
          <input
            type="search"
            placeholder="Search for products, brands and more"
            onClick={() => setOpen(true)}
            className="pl-10 pr-12 py-2.5 w-full border backdrop-blur-sm rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ 
              backgroundColor: dynamicBgTint, 
              borderColor: dynamicBorderColor,
              color: dynamicTextColor
            }}
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center justify-center text-[10px] font-sans font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: dynamicBgTint, color: dynamicTextColor, opacity: 0.5 }}
          >
            <span className="mr-0.5">⌘</span>K
          </kbd>
        </div>
      </div>
      
      {/* Fixed search bar that appears when scrolling */}
      {isFixed && (
        <div 
          className="hidden lg:flex fixed top-4 left-1/2 transform -translate-x-1/2 z-[150] w-full max-w-xl transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-4"
        >
          <div className="w-full relative group shadow-lg rounded-full">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
              style={{ color: dynamicTextColor }}
              size={20}
            />
            <input
              type="search"
              placeholder="Search for products..."
              onClick={() => setOpen(true)}
              className="w-full pl-12 pr-12 py-3 border rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ 
                backgroundColor: dynamicBgTint, 
                borderColor: dynamicBorderColor,
                color: dynamicTextColor
              }}
              readOnly
            />
          </div>
        </div>
      )}
      
      <SearchModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
      />
    </>
  );
};

export default NavbarInput;
