"use client";

import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";
import { getCategoriesWithProductCount } from "@/lib/database/actions/categories.actions";
import { ProductCardSmall } from "@/components/shared/product/ProductCardSmall";
import { useNavbarSettings } from "@/hooks/use-navbar-settings";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import { debounce } from "lodash";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define the category type for proper typing
interface CategoryWithCount {
  _id: string;
  name: string;
  slug?: string;
  productCount?: number;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Popular suggestions
  const popularSuggestions = [
    "Best Sellers",
    "New Arrivals", 
    "Sale Items",
    "Featured Products",
    "Premium Collection"
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategoriesWithProductCount();
        if (result?.success) {
          setCategories(result.categories.slice(0, 8)); // Show first 8 categories
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Load featured products for default view
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/search/products?filter=featured&limit=4');
        const data = await response.json();
        
        if (data.success && data.products?.length > 0) {
          setFeaturedProducts(data.products);
        } else {
          // Fallback to recent products if no featured products
          const fallbackResponse = await fetch('/api/search/products?sort=newest&limit=4');
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            setFeaturedProducts(fallbackData.products);
          }
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    if (isOpen) {
      fetchFeaturedProducts();
    }
  }, [isOpen]);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search/products?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        saveRecentSearch(searchQuery);
      } else {
        setProducts([]);
        toast.error(data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle search input change
  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);
      debouncedSearch(query);
    } else {
      setProducts([]);
      setLoading(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  // Handle category click
  const handleCategoryClick = (categoryName: string) => {
    setQuery(categoryName);
    debouncedSearch(categoryName);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    debouncedSearch(suggestion);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentSearch: string) => {
    setQuery(recentSearch);
    debouncedSearch(recentSearch);
  };

  const { settings: navbarSettings } = useNavbarSettings();
  
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

  const dynamicTextColor = navbarSettings?.textColor || '#1a1a1a';
  const dynamicBgColor = navbarSettings?.backgroundColorValue || '#ffffff';
  const dynamicBgContrast = hexToRgba(dynamicTextColor, 0.05);
  const dynamicBorderColor = hexToRgba(dynamicTextColor, 0.1);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2100] bg-black md:bg-black/60 md:backdrop-blur-sm transition-all duration-300">
      <div className="flex items-start justify-center min-h-screen">
        <div 
          ref={modalRef}
          className="w-full h-screen md:h-auto md:max-w-4xl md:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col"
          style={{ backgroundColor: dynamicBgColor, color: dynamicTextColor }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b" style={{ borderColor: dynamicBorderColor }}>
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-blue-100 rounded-full">
                <Search className="h-5 w-5 text-blue-600" />
              </div> */}
              {/* <div>
                <h2 className="text-xl font-bold text-gray-900">Search Products</h2>
                <p className="text-sm text-gray-500">Find exactly what you're looking for</p>
              </div> */}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{ backgroundColor: dynamicBgContrast }}
            >
              <X className="h-5 w-5" style={{ color: dynamicTextColor }} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 md:p-6 border-b" style={{ borderColor: dynamicBorderColor }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-40" />
              <Input
                type="search"
                placeholder="Search for products, brands, categories..."
                className="w-full pl-12 pr-4 py-8 md:py-10 text-lg border-2 rounded-xl focus:ring-0 transition-all duration-300"
                style={{ 
                  backgroundColor: dynamicBgContrast, 
                  borderColor: dynamicBorderColor,
                  color: dynamicTextColor
                }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.length === 0 ? (
              /* Default State - Categories and Suggestions */
              <div className="p-6 space-y-8">
                {/* Browse by Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold opacity-70">Browse by Category</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {categories.map((category: any) => (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryClick(category.name)}
                        className="p-3 rounded-lg border transition-all duration-200 group text-center"
                        style={{ 
                          backgroundColor: dynamicBgContrast,
                          borderColor: dynamicBorderColor
                        }}
                      >
                        <p className="font-semibold text-xs truncate mb-1">{category.name}</p>
                        <p className="text-[10px] opacity-50">
                          {category.productCount || 0} Products
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Products
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Trending Products</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredProducts.length > 0 ? (
                      featuredProducts.map((product: any) => (
                        <div key={product.id || product._id} onClick={onClose} className="transition-transform hover:scale-105 active:scale-95">
                          <ProductCardSmall 
                            product={{
                              ...product,
                              id: product.id || product._id,
                              image: product.image || product.subProducts?.[0]?.images?.[0]?.url || '/placeholder-product.png'
                            }} 
                            viewMode="grid" 
                          />
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                          <div className="aspect-square bg-gray-200"></div>
                          <div className="p-3 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div> */}

                {/* Popular Suggestions */}
                {/* <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Popular Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 cursor-pointer transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div> */}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1 border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Products */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {/* <TrendingUp className="h-5 w-5 text-blue-500" /> */}
                    <h3 className="text-lg font-semibold text-gray-900">Trending Products</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredProducts.length > 0 ? (
                      featuredProducts.map((product: any) => (
                        <div key={product.id || product._id} onClick={onClose} className="transition-transform hover:scale-105 active:scale-95">
                          <ProductCardSmall 
                            product={{
                              ...product,
                              id: product.id || product._id,
                              image: product.image || product.subProducts?.[0]?.images?.[0]?.url || '/placeholder-product.png',
                              secondaryImage: product.secondaryImage || 
                                (Array.isArray(product.images) && product.images.length > 1 ? (typeof product.images[1] === 'string' ? product.images[1] : product.images[1]?.url) : 
                                (Array.isArray(product.subProducts?.[0]?.images) && product.subProducts[0].images.length > 1 ? (typeof product.subProducts[0].images[1] === 'string' ? product.subProducts[0].images[1] : product.subProducts[0].images[1]?.url) : null)),
                              subProducts: product.subProducts || [],
                              images: product.images || []
                            }} 
                            viewMode="grid" 
                          />
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                          <div className="aspect-square bg-gray-200"></div>
                          <div className="p-3 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
            ) : (
              /* Search Results */
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="animate-spin h-5 w-5" />
                        Searching...
                      </div>
                    ) : (
                      `Search Results for "${query}"`
                    )}
                  </h3>
                  {!loading && products.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {products.length} items found
                    </Badge>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" />
                      <p className="text-gray-500">Searching products...</p>
                    </div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No results found</h4>
                    <p className="text-gray-500 mb-6">
                      Try different keywords or browse our categories above
                    </p>
                    <button
                      onClick={() => setQuery("")}
                      className="font-medium underline opacity-70 hover:opacity-100"
                    >
                      ← Back to browse
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product: any, index: number) => (
                      <div key={product.id || index} onClick={onClose}>
                        <ProductCardSmall product={product} viewMode="grid" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;