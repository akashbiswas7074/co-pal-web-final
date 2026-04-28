"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Phone, Navigation, Loader2, Store, ChevronRight, List, Map as MapIcon } from "lucide-react";
import { IShop } from "@/lib/database/models/shop.model";

// Dynamically import map to avoid SSR issues
const ShopMap = dynamic(() => import("@/components/shared/ShopMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500 font-medium">Preparing Live Map...</p>
      </div>
    </div>
  )
});

export default function NearbyShopsPage() {
  const [shops, setShops] = useState<IShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedShop, setFocusedShop] = useState<IShop | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("/api/nearby-shops");
        const data = await response.json();
        if (data.success) {
          setShops(data.shops);
        }
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const filteredShops = useMemo(() => {
    return shops.filter(shop => 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      shop.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shops, searchQuery]);

  const handleShopClick = (shop: IShop) => {
    setFocusedShop(shop);
    // On mobile, auto-switch to map view
    if (window.innerWidth < 768) {
      setViewMode("map");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Area - Optimized for Mobile */}
      <div className="bg-white border-b px-4 py-6 md:px-6 md:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Store className="text-purple-600 h-7 w-7 md:h-8 md:w-8" />
              Store Locator
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Experience VibeCart products at our physical locations near you.</p>
          </div>
          
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search stores by name or city..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm bg-gray-50/50 hover:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Sidebar: Shop List - Shown conditionally on mobile */}
        <div className={`w-full md:w-[400px] bg-white border-r flex flex-col h-[calc(100vh-280px)] md:h-auto overflow-y-auto z-10 transition-all ${
          viewMode === 'map' ? 'hidden md:flex' : 'flex'
        }`}>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-gray-500 font-medium animate-pulse">Syncing store locations...</p>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                <Search className="text-purple-300 h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">No Results Found</h3>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                We couldn't find any shops matching "{searchQuery}". <br/>
                Try searching for a city or common area.
              </p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-bold shadow-md shadow-purple-200 hover:bg-purple-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="flex-1 py-4">
              <div className="px-6 mb-4 flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                  {filteredShops.length} Stores found
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredShops.map((shop) => (
                  <div 
                    key={(shop._id as string)}
                    onClick={() => handleShopClick(shop)}
                    className={`px-6 py-6 cursor-pointer transition-all hover:bg-purple-50/50 group relative ${
                      focusedShop?._id === shop._id 
                        ? "bg-purple-50/70" 
                        : ""
                    }`}
                  >
                    {focusedShop?._id === shop._id && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-full" />
                    )}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className={`font-extrabold text-base transition-colors ${
                          focusedShop?._id === shop._id ? "text-purple-700" : "text-gray-900"
                        }`}>
                          {shop.name}
                        </h3>
                        <div className="mt-3 space-y-2.5">
                          <div className="flex items-start gap-2.5 text-sm text-gray-500 group-hover:text-gray-700">
                            <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{shop.address}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-gray-500 group-hover:text-gray-700">
                            <Phone className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span className="font-medium">{shop.phoneNumber}</span>
                          </div>
                        </div>
                        <div className="mt-5 flex items-center gap-4">
                          <button className="text-[11px] font-black text-purple-600 uppercase tracking-wider group-hover:underline">
                            View on Map
                          </button>
                          {shop.googleMapLink && (
                            <a 
                              href={shop.googleMapLink} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-black text-gray-400 hover:text-green-600 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Directions
                            </a>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 ${
                        focusedShop?._id === shop._id ? "text-purple-400 translate-x-1" : ""
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Map View - Shown conditionally on mobile */}
        <div 
          id="map-container" 
          className={`flex-1 min-h-[500px] md:h-auto relative transition-all ${
            viewMode === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ShopMap shops={shops} focusedShop={focusedShop} />
          
          {/* Legend/Reset Controls Overlay */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
             <button 
               onClick={() => {
                 setFocusedShop(null);
               }}
               className="bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl shadow-xl border border-white text-xs font-black uppercase text-gray-800 hover:bg-white flex items-center gap-2.5 transition-all active:scale-95"
             >
               <MapPin className="h-4 w-4 text-purple-600" />
               Reset View
             </button>
          </div>
        </div>

        {/* Floating Toggle Button (Mobile Only) */}
        <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[500]">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-purple-500/40 font-black uppercase text-xs tracking-widest transition-all active:scale-90"
          >
            {viewMode === 'list' ? (
              <>
                <MapIcon className="h-4 w-4" />
                Show Map
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                Show List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
