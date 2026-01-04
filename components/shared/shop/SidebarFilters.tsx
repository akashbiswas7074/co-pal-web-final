'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { CheckedState } from "@radix-ui/react-checkbox";

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface TagGroup {
  name: string;
  values: string[];
}

export interface SelectedFiltersState {
  category: string[];
  subcategory: string[];
  tags: string[];
  price: [number, number];
  sale: string[];
  bestSelling: string[];
  isNew: string[];
  isFeatured: string[];
  inStock: string[];
  rating: string[];
  color: string[];
  size: string[];
}

interface SidebarFiltersProps {
  categories: Category[];
  subCategoryNames: string[];
  tags: TagGroup[];
  onApplyFilters: (filters: SelectedFiltersState, priceRange: number[]) => void;
  onClearFilters: () => void;
  initialFilters?: SelectedFiltersState;
  initialPriceRange?: number[];
  className?: string;
  disabledCategories?: string[];
  disabledSubcategories?: string[];
  subCategoryDetails?: {
    _id: string;
    name: string;
    parent?: string | { _id: string };
    category?: string | { _id: string };
    categoryId?: string;
    parentCategory?: string | { _id: string };
  }[];
  isLoading?: boolean;
  hasProductsWithRatings?: boolean;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  categories,
  subCategoryNames,
  tags,
  onApplyFilters,
  onClearFilters,
  initialFilters,
  initialPriceRange = [0, 20000],
  className = '',
  disabledCategories = [],
  disabledSubcategories = [],
  subCategoryDetails = [],
  isLoading = false,
  hasProductsWithRatings = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const defaultFilters: SelectedFiltersState = useMemo(() => ({
    category: [],
    subcategory: [],
    sale: [],
    tags: [],
    bestSelling: [],
    isNew: [],
    isFeatured: [],
    inStock: [],
    rating: [],
    price: [0, 20000] as [number, number],
    color: [],
    size: []
  }), []);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersState>(
    initialFilters || defaultFilters
  );
  const [priceRange, setPriceRange] = useState<number[]>(initialPriceRange);
  const userInitiatedChange = useRef(false);
  const pendingFilters = useRef<{ filters: SelectedFiltersState; range: number[] } | null>(null);

  // Update state when props change (only if they're actually different)
  useEffect(() => {
    if (initialFilters) {
      setSelectedFilters(prev => {
        // Only update if filters actually changed
        if (JSON.stringify(prev) !== JSON.stringify(initialFilters)) {
          userInitiatedChange.current = false; // This is from props, not user
          return initialFilters;
        }
        return prev;
      });
    }
    if (initialPriceRange) {
      setPriceRange(prev => {
        // Only update if price range actually changed
        if (prev[0] !== initialPriceRange[0] || prev[1] !== initialPriceRange[1]) {
          userInitiatedChange.current = false; // This is from props, not user
          return initialPriceRange;
        }
        return prev;
      });
    }
  }, [initialFilters, initialPriceRange]);

  // Apply filters when user-initiated changes occur
  useEffect(() => {
    if (userInitiatedChange.current && pendingFilters.current) {
      // Use setTimeout to ensure this runs after render
      const timeoutId = setTimeout(() => {
        if (pendingFilters.current) {
          onApplyFilters(pendingFilters.current.filters, pendingFilters.current.range);
          pendingFilters.current = null;
        }
        userInitiatedChange.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, priceRange]);

  // Get all subcategories (always show all, regardless of category selection)
  const relevantSubcategories = useMemo(() => {
    console.log('SidebarFilters - subCategoryDetails:', {
      length: subCategoryDetails.length,
      sample: subCategoryDetails.slice(0, 3)
    });
    
    if (subCategoryDetails.length === 0) {
      console.warn('No subcategory details provided to SidebarFilters');
      return [];
    }

    // Always show all subcategories, regardless of category selection
    const filtered = subCategoryDetails
      .filter(sub => {
        if (!sub) {
          console.warn('Found null/undefined subcategory');
          return false;
        }
        if (!sub.name) {
          console.warn('Found subcategory without name:', sub);
          return false;
        }
        return true;
      })
      .map(sub => ({ _id: sub._id, name: sub.name }));
    
    console.log('SidebarFilters - relevantSubcategories:', {
      length: filtered.length,
      sample: filtered.slice(0, 3)
    });
    
    return filtered;
  }, [subCategoryDetails]);

  // Toggle filter
  const toggleFilter = useCallback((type: keyof SelectedFiltersState, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'category') {
        newFilters.category = prev.category.includes(value)
          ? prev.category.filter(v => v !== value)
          : [value];
        newFilters.subcategory = []; // Clear subcategory when category changes
      } else if (type === 'subcategory') {
        const filterArray = Array.isArray(prev.subcategory) ? prev.subcategory : [];
        // Use case-insensitive comparison for subcategory names
        const valueLower = value.toLowerCase();
        const isSelected = filterArray.some(v => 
          v.toLowerCase() === valueLower || v === value
        );
        newFilters.subcategory = isSelected
          ? filterArray.filter(v => v.toLowerCase() !== valueLower && v !== value)
          : [...filterArray, value]; // Store the name as provided
      } else if (type === 'price') {
        return prev; // Price handled separately
      } else {
        const filterArray = Array.isArray(prev[type]) ? (prev[type] as string[]) : [];
        const valueLower = value.toLowerCase();
        const isSelected = filterArray.some(v => v.toLowerCase() === valueLower);
        
        newFilters[type] = (isSelected
          ? filterArray.filter(v => v.toLowerCase() !== valueLower)
          : [...filterArray, valueLower]
        ) as any;
      }
      
      // Mark as user-initiated and store pending filters
      userInitiatedChange.current = true;
      pendingFilters.current = { filters: newFilters, range: priceRange };
      
      return newFilters;
    });
  }, [priceRange]);

  // Handle price range change
  const handlePriceChange = useCallback((newRange: number[]) => {
    setPriceRange(newRange);
    setSelectedFilters(prev => {
      const newFilters = {
        ...prev,
        price: [newRange[0], newRange[1]] as [number, number]
      };
      
      // Mark as user-initiated and store pending filters
      userInitiatedChange.current = true;
      pendingFilters.current = { filters: newFilters, range: newRange };
      
      return newFilters;
    });
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const resetFilters = {
      ...defaultFilters,
      category: disabledCategories,
      subcategory: disabledSubcategories,
    };
    setSelectedFilters(resetFilters);
    setPriceRange([0, 20000]);
    onClearFilters();
  }, [defaultFilters, disabledCategories, disabledSubcategories, onClearFilters]);

  // Lazy loading state - show all categories by default
  const [visibleTagGroups, setVisibleTagGroups] = useState(5);
  const [visibleCategories, setVisibleCategories] = useState(100); // Show all categories by default (high number)
  const [visibleSubcategories, setVisibleSubcategories] = useState(5);
  
  // Update visibleCategories when categories prop changes to show all
  useEffect(() => {
    if (categories.length > 0) {
      setVisibleCategories(categories.length); // Show all categories when they're loaded
    }
  }, [categories.length]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-full mb-2" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="mb-4">
            <Slider
              value={priceRange}
              min={0}
              max={20000}
              step={100}
              onValueChange={handlePriceChange}
              className="my-6"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="space-y-1.5">
              <Label htmlFor="minPrice" className="text-xs text-gray-500">Min Price</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  id="minPrice"
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    if (newValue >= 0 && newValue <= priceRange[1]) {
                      handlePriceChange([newValue, priceRange[1]]);
                    }
                  }}
                  className="w-full h-9 pl-6 pr-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxPrice" className="text-xs text-gray-500">Max Price</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  id="maxPrice"
                  type="number"
                  min={priceRange[0]}
                  max={20000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    if (newValue >= priceRange[0] && newValue <= 20000) {
                      handlePriceChange([priceRange[0], newValue]);
                    }
                  }}
                  className="w-full h-9 pl-6 pr-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
            <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
          </div>
          <Button
            onClick={() => {
              userInitiatedChange.current = true;
              pendingFilters.current = { filters: selectedFilters, range: priceRange };
              onApplyFilters(selectedFilters, priceRange);
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            Apply Price Filter
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Categories */}
        <Accordion type="single" collapsible defaultValue="categories" className="mb-4">
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="py-2 px-0 hover:no-underline">
              <h4 className="font-medium text-left">Categories</h4>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="category-all-products"
                    checked={
                      pathname === '/shop' &&
                      selectedFilters.category.length === 0 &&
                      selectedFilters.subcategory.length === 0 &&
                      selectedFilters.tags.length === 0 &&
                      selectedFilters.sale.length === 0 &&
                      selectedFilters.bestSelling.length === 0 &&
                      selectedFilters.isNew.length === 0 &&
                      selectedFilters.isFeatured.length === 0 &&
                      selectedFilters.inStock.length === 0 &&
                      selectedFilters.rating.length === 0
                    }
                    onCheckedChange={(checked: CheckedState) => {
                      if (checked) {
                        handleClearFilters();
                        router.push('/shop');
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label htmlFor="category-all-products" className="cursor-pointer text-sm font-medium">
                    All Products
                  </Label>
                </div>

                {categories.slice(0, visibleCategories).map((category) => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category._id}`}
                      checked={selectedFilters.category.includes(category._id)}
                      onCheckedChange={(checked: CheckedState) => {
                        toggleFilter('category', category._id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label 
                      htmlFor={`category-${category._id}`} 
                      className="cursor-pointer text-sm flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFilter('category', category._id);
                      }}
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}

                {visibleCategories < categories.length && (
                  <button
                    onClick={() => setVisibleCategories(prev => prev + 5)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2"
                  >
                    Show more
                    <ChevronDown size={14} />
                  </button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator className="my-4" />

        {/* Subcategories */}
        {relevantSubcategories.length > 0 && (
          <>
            <Accordion type="single" collapsible defaultValue="subcategories" className="mb-4">
              <AccordionItem value="subcategories" className="border-none">
                <AccordionTrigger className="py-2 px-0 hover:no-underline">
                  <h4 className="font-medium text-left">Subcategories</h4>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 py-2">
                    {relevantSubcategories.slice(0, visibleSubcategories).map((subcategory) => {
                      const isChecked = selectedFilters.subcategory.some(
                        sc => sc === subcategory._id || sc === subcategory.name || 
                        sc.toLowerCase() === subcategory.name.toLowerCase()
                      );
                      
                      return (
                        <div key={subcategory._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subcategory-${subcategory._id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              // Use name for consistency with URL
                              toggleFilter('subcategory', subcategory.name);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label 
                            htmlFor={`subcategory-${subcategory._id}`} 
                            className="cursor-pointer text-sm flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Toggle the checkbox by calling toggleFilter
                              toggleFilter('subcategory', subcategory.name);
                            }}
                          >
                            {subcategory.name}
                          </Label>
                        </div>
                      );
                    })}

                    {visibleSubcategories < relevantSubcategories.length && (
                      <button
                        onClick={() => setVisibleSubcategories(prev => prev + 5)}
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2"
                      >
                        Show more
                        <ChevronDown size={14} />
                      </button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Separator className="my-4" />
          </>
        )}

        {/* Tags (Brand, Color, Fabric, etc.) */}
        {tags.length > 0 && (
          <Accordion type="multiple" defaultValue={tags.slice(0, 5).map(t => `tag-${t.name}`)} className="mb-4">
            <h4 className="font-medium mb-2">Filters</h4>
            {tags.slice(0, visibleTagGroups).map((tagGroup) => (
              <AccordionItem key={tagGroup.name} value={`tag-${tagGroup.name}`} className="border-b-0">
                <AccordionTrigger className="py-2 px-0 hover:no-underline">
                  <span className="text-sm font-medium">{tagGroup.name.toUpperCase()}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 py-1 ml-1">
                    {tagGroup.values.map((val) => {
                      const filterValue = `${tagGroup.name}:${val}`;
                      return (
                        <div key={val} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tagGroup.name}-${val}`}
                            checked={selectedFilters.tags.some(t => t.toLowerCase() === filterValue.toLowerCase())}
                            onCheckedChange={(checked: CheckedState) => {
                              if (checked !== undefined) {
                                toggleFilter('tags', filterValue);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label 
                            htmlFor={`tag-${tagGroup.name}-${val}`} 
                            className="cursor-pointer text-sm flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFilter('tags', filterValue);
                            }}
                          >
                            {val}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {visibleTagGroups < tags.length && (
              <button
                onClick={() => setVisibleTagGroups(prev => prev + 5)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2"
              >
                Show more tags
                <ChevronDown size={14} />
              </button>
            )}
          </Accordion>
        )}

        <Separator className="my-4" />

        {/* Rating Filter */}
        {hasProductsWithRatings && (
          <>
            <div className="mb-4">
              <h4 className="font-medium mb-3">Rating</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={selectedFilters.rating.includes(rating.toString())}
                      onCheckedChange={(checked: CheckedState) => {
                        if (checked !== undefined) {
                          toggleFilter('rating', rating.toString());
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label 
                      htmlFor={`rating-${rating}`} 
                      className="cursor-pointer text-sm flex items-center flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFilter('rating', rating.toString());
                      }}
                    >
                      <div className="flex items-center">
                        {[...Array(rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        <span className="ml-1">{rating} {rating === 1 ? 'star' : 'stars'}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* Product Status */}
        <div className="mb-4">
          <h4 className="font-medium mb-3">Product Status</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={selectedFilters.isFeatured.includes('featured') || selectedFilters.isFeatured.includes('Featured')}
                onCheckedChange={(checked: CheckedState) => {
                  if (checked !== undefined) {
                    console.log('Featured filter toggled:', checked);
                    toggleFilter('isFeatured', 'featured');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Label 
                htmlFor="featured" 
                className="cursor-pointer text-sm flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Let the label's natural behavior toggle the checkbox
                  // The onCheckedChange will handle the filter toggle
                }}
              >
                Featured Products
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-arrival"
                checked={selectedFilters.isNew.includes('new')}
                onCheckedChange={(checked: CheckedState) => {
                  if (checked !== undefined) {
                    toggleFilter('isNew', 'new');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Label 
                htmlFor="new-arrival" 
                className="cursor-pointer text-sm flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Let the label's natural behavior toggle the checkbox
                  // The onCheckedChange will handle the filter toggle
                }}
              >
                Newly Arrived
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="best-selling"
                checked={selectedFilters.bestSelling.includes('bestseller') || selectedFilters.bestSelling.includes('Bestseller')}
                onCheckedChange={(checked: CheckedState) => {
                  if (checked !== undefined) {
                    console.log('Best Selling filter toggled:', checked);
                    toggleFilter('bestSelling', 'bestseller');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Label 
                htmlFor="best-selling" 
                className="cursor-pointer text-sm flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Let the label's natural behavior toggle the checkbox
                  // The onCheckedChange will handle the filter toggle
                }}
              >
                Best Selling
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={selectedFilters.inStock.includes('instock') || selectedFilters.inStock.includes('inStock')}
                onCheckedChange={(checked: CheckedState) => {
                  if (checked !== undefined) {
                    toggleFilter('inStock', 'instock');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Label 
                htmlFor="in-stock" 
                className="cursor-pointer text-sm flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Let the label's natural behavior toggle the checkbox
                  // The onCheckedChange will handle the filter toggle
                }}
              >
                In Stock
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarFilters;
