'use client';

import { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import SidebarFilters from '@/components/shared/shop/SidebarFilters';
import { Button } from '@/components/ui/button';
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type SelectedFiltersState } from "@/components/shared/shop/SidebarFilters";
import { extractTagsFromProducts } from "@/lib/utils/tagExtractor";

// Helper for deep equality check
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
};

interface Category {
  _id: string;
  name: string;
  slug: string; // Changed from string | ObjectId to string
  images?: { url: string }[];
}

interface TagGroup {
  name: string;
  values: string[];
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  parent: string;
  parentSlug?: string;
}

interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  category?: {
    _id: string;
    name: string;
    slug?: string;
  } | string;
  subcategory?: string | { name: string; _id?: string };
  subCategories?: (string | { name: string; _id?: string })[];
  tagValues?: {
    tag: {
      _id: string;
      name: string;
    } | string;
    value: string;
  }[];
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  stock?: number;
  image?: string;
  subProducts?: any[];
  rating?: number;
  numReviews?: number;
  bestsellerRank?: number;
  orderCount?: number;
  sold?: number;
}

// Page type enum to identify which page is currently active
export enum ShopPageType {
  SHOP = 'shop',
  CATEGORY = 'category',
  SUBCATEGORY = 'subcategory'
}

// Shop Context for sharing filter state
interface ShopContextType {
  filteredProducts: Product[];
  loading: boolean;
  selectedFilters: SelectedFiltersState;
  priceRange: number[];
  searchQuery: string;
  totalProducts: number;
  setSearchQuery: (query: string) => void;
  setSelectedFilters: (filters: SelectedFiltersState) => void;
  setPriceRange: (range: number[]) => void;
  clearAllFilters: () => void;
  removeFilter: (type: keyof SelectedFiltersState, value: string) => void;
  categories: Category[];
  subcategories: string[];
  tags: TagGroup[];
  allSubCategoryDetails: SubCategory[];
  pageType: ShopPageType;
  currentCategorySlug?: string;
  currentSubCategoryId?: string;
  currentSubCategoryName?: string;
  setDirectProducts?: (products: Product[]) => void;
  setPageType: (pageType: ShopPageType) => void;
  setCurrentSubCategoryName: (name: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCategorySlug?: (slug: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopLayout');
  }
  return context;
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // UI States
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Mobile filter state updated:', isMobileFilterOpen);
  }, [isMobileFilterOpen]);

  // Toggle mobile filter drawer with useCallback
  const toggleMobileFilterDrawer = useCallback(() => {
    setIsMobileFilterOpen(prev => !prev);
  }, []);

  // Filter States
  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersState>({
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
    size: [],
  });
  const [priceRange, setPriceRange] = useState<number[]>([0, 20000]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [tags, setTags] = useState<TagGroup[]>([]);
  const [allSubCategoryDetails, setAllSubCategoryDetails] = useState<SubCategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const skipURLUpdate = useRef(false);
  const isInitialSync = useRef(true);
  // Add state for direct products
  const [directProducts, setDirectProducts] = useState<Product[]>([]);

  // Determine page type based on URL path
  const [pageType, setPageType] = useState<ShopPageType>(ShopPageType.SHOP);
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string | undefined>(undefined);
  const [currentSubCategoryId, setCurrentSubCategoryId] = useState<string | undefined>(undefined);
  const [currentSubCategoryName, setCurrentSubCategoryName] = useState<string | undefined>(undefined);

  // Detect current page type and slugs from URL
  useEffect(() => {
    if (!pathname) return;

    try {
      // Check if we're on a direct subcategory page (new route)
      const directSubcategoryMatch = pathname.match(/\/shop\/subcategory\/([^\/]+)$/);
      if (directSubcategoryMatch) {
        setPageType(ShopPageType.SUBCATEGORY);
        setCurrentCategorySlug(undefined);

        // Format subcategory slug to a proper name (replace hyphens with spaces and capitalize)
        const formattedSubName = directSubcategoryMatch[1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        setCurrentSubCategoryName(formattedSubName);
        return;
      }

      // Check if we're on a category page
      const categoryMatch = pathname.match(/\/shop\/category\/([^\/]+)$/);
      if (categoryMatch) {
        setPageType(ShopPageType.CATEGORY);
        setCurrentCategorySlug(categoryMatch[1]);
        setCurrentSubCategoryName(undefined);
        return;
      }

      // Check if we're on a nested subcategory page
      const subcategoryMatch = pathname.match(/\/shop\/category\/([^\/]+)\/([^\/]+)$/);
      if (subcategoryMatch) {
        setPageType(ShopPageType.SUBCATEGORY);
        setCurrentCategorySlug(subcategoryMatch[1]);

        // Format subcategory slug to a proper name (replace hyphens with spaces and capitalize)
        const formattedSubName = subcategoryMatch[2]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        setCurrentSubCategoryName(formattedSubName);
        return;
      }

      // Default to shop page
      setPageType(ShopPageType.SHOP);
      setCurrentCategorySlug(undefined);
      setCurrentSubCategoryName(undefined);
    } catch (error) {
      console.error('Error determining page type:', error);
    }
  }, [pathname]);

  // Parse URL parameters and sync to state
  useEffect(() => {
    if (!searchParams || !categories.length || !allSubCategoryDetails.length) return;

    try {
      // Get all URL parameters
      const categoryParam = searchParams.get('category') ?? '';
      const subcategoryParam = searchParams.get('subcategory') ?? '';
      const tagsParam = searchParams.get('tags') ?? '';
      const search = searchParams.get('search') ?? '';
      const minPrice = searchParams.get('minPrice') ?? '';
      const maxPrice = searchParams.get('maxPrice') ?? '';
      const sale = searchParams.get('sale') ?? '';
      const bestseller = searchParams.get('bestseller') ?? '';
      const isNew = searchParams.get('new') ?? '';
      const featured = searchParams.get('featured') ?? '';
      const ratingParam = searchParams.get('rating') ?? '';

      // Update search query
      if (search !== searchQuery) {
        setSearchQuery(search);
      }

      // Parse price range
      const newPriceRange: number[] = [
        minPrice ? Math.max(0, parseInt(minPrice, 10)) : 0,
        maxPrice ? Math.min(20000, parseInt(maxPrice, 10)) : 20000
      ];

      // Parse category filters
      const categoryFilters = categoryParam
        ? categoryParam.split(',').filter(Boolean).filter(c => c && typeof c === 'string' && c !== '[object Object]')
        : [];

      // Parse subcategory filters (convert IDs to names if needed)
      const subcategoryFilters = subcategoryParam
        ? subcategoryParam.split(',').filter(Boolean).map(subParam => {
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(subParam);
            if (isObjectId) {
              const foundSub = allSubCategoryDetails.find(
                sub => sub._id === subParam || sub._id?.toString() === subParam
              );
              return foundSub?.name || subParam;
            }
            return subParam;
          })
        : [];

      // Parse tag filters
      const tagFilters = tagsParam
        ? tagsParam.split(',').filter(Boolean).map(t => t.toLowerCase())
        : [];

      // Parse rating filters
      const ratingFilters = ratingParam
        ? ratingParam.split(',').filter(Boolean)
        : [];

      // Build new filters object
      const newFilters: SelectedFiltersState = {
        category: categoryFilters,
        subcategory: subcategoryFilters,
        tags: tagFilters,
        sale: sale === 'true' ? ['sale'] : [],
        bestSelling: bestseller === 'true' ? ['bestseller'] : [],
        isNew: isNew === 'true' ? ['new'] : [],
        isFeatured: featured === 'true' ? ['featured'] : [],
        inStock: [],
        rating: ratingFilters,
        price: newPriceRange as [number, number],
        color: [],
        size: [],
      };

      // Only update if filters actually changed
      if (!deepEqual(newFilters, selectedFilters)) {
        skipURLUpdate.current = true; // Prevent URL update when syncing from URL
        setSelectedFilters(newFilters);
      }

      // Only update if price range actually changed
      if (newPriceRange[0] !== priceRange[0] || newPriceRange[1] !== priceRange[1]) {
        skipURLUpdate.current = true; // Prevent URL update when syncing from URL
        setPriceRange(newPriceRange);
      }

      if (isInitialSync.current) {
        isInitialSync.current = false;
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
  }, [searchParams, categories, allSubCategoryDetails]);

  // Update filter state based on path when path changes
  useEffect(() => {
    if (!pathname || !allSubCategoryDetails.length) return;

    try {
      // When on a subcategory page, update the filter state
      if (pageType === ShopPageType.SUBCATEGORY && currentSubCategoryName) {
        // Find the subcategory in our details list, matching both name and parent slug
        const subcategory = allSubCategoryDetails.find(sub =>
          sub.name.toLowerCase() === currentSubCategoryName?.toLowerCase() &&
          (!currentCategorySlug || sub.parentSlug === currentCategorySlug)
        );

        if (subcategory) {
          console.log(`Found subcategory match: ${subcategory.name}, setting parent category: ${subcategory.parentSlug}`);
          setSelectedFilters(prev => ({
            ...prev,
            category: [subcategory.parent as string],
            subcategory: [subcategory.name]
          }));
        } else {
          console.log(`No direct subcategory match found for "${currentSubCategoryName}" in category "${currentCategorySlug}"`);
          // Even if subcategory name doesn't match, we should try to set the category based on the slug
          const category = categories.find(cat => cat.slug === currentCategorySlug);
          if (category) {
            setSelectedFilters(prev => ({
              ...prev,
              category: [category._id],
              subcategory: [currentSubCategoryName] // Use placeholder name
            }));
          }
        }
      }
      // When on a category page, update filter state
      else if (pageType === ShopPageType.CATEGORY && currentCategorySlug) {
        // Find the category in our categories list
        const category = categories.find(cat =>
          cat.slug === currentCategorySlug
        );

        if (category) {
          setSelectedFilters(prev => ({
            ...prev,
            category: [category._id],
            subcategory: []
          }));
        }
      }
    } catch (error) {
      console.error('Error updating filters from path:', error);
    }
  }, [pathname, pageType, currentSubCategoryName, currentCategorySlug, allSubCategoryDetails, categories]);

  // Fetch all data using API route
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/shop/products');
        const result = await response.json();

        if (result.success && result.data) {
          const { products, categories, tags, subcategories, allSubCategoryDetails } = result.data;

          // Transform products to ensure consistent interface
          const transformedProducts = (products || [])
            .map(transformProduct)
            .filter(Boolean) as Product[];

          setAllProducts(transformedProducts);
          setCategories(categories || []);
          setTags(tags || []);
          setSubcategories(subcategories || []);
          setAllSubCategoryDetails(allSubCategoryDetails || []);

          console.log('Shop data loaded:', {
            products: transformedProducts.length,
            categories: (categories || []).length,
            tags: (tags || []).length,
            subcategories: (subcategories || []).length,
            allSubCategoryDetails: (allSubCategoryDetails || []).length
          });
          
          // Log category details for debugging
          if (categories && categories.length > 0) {
            console.log('Categories sample:', categories.slice(0, 5).map((c: Category) => ({ _id: c._id, name: c.name })));
          } else {
            console.warn('No categories found in API response');
          }
          
          // Log subcategory details for debugging
          if (allSubCategoryDetails && allSubCategoryDetails.length > 0) {
            console.log('SubCategory details sample:', allSubCategoryDetails.slice(0, 3));
          } else {
            console.warn('No subcategory details found in API response');
          }
        } else {
          console.error('Failed to fetch shop data:', result.error);
          // Set empty arrays as fallback
          setAllProducts([]);
          setCategories([]);
          setTags([]);
          setSubcategories([]);
          setAllSubCategoryDetails([]);
        }

      } catch (error) {
        console.error("Error fetching shop data:", error);
        // Set empty arrays as fallback
        setAllProducts([]);
        setCategories([]);
        setTags([]);
        setSubcategories([]);
        setAllSubCategoryDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Transform product data safely
  const transformProduct = (product: any): Product | null => {
    if (!product || typeof product !== 'object') return null;

    try {
      const subProducts = Array.isArray(product.subProducts) ? product.subProducts : [];
      const firstSubProduct = subProducts.length > 0 ? subProducts[0] : null;

      // Calculate stock safely
      let stock = 0;
      try {
        if (firstSubProduct?.sizes && Array.isArray(firstSubProduct.sizes)) {
          stock = firstSubProduct.sizes.reduce((total: number, size: any) => total + (size?.qty || 0), 0);
        } else if (firstSubProduct?.qty) {
          stock = firstSubProduct.qty;
        } else if (product.stock || product.qty) {
          stock = product.stock || product.qty;
        }
      } catch (e) {
        stock = 0;
      }

      // Calculate prices safely
      let price = 0;
      let originalPrice = 0;
      try {
        if (firstSubProduct?.sizes && Array.isArray(firstSubProduct.sizes) && firstSubProduct.sizes.length > 0) {
          originalPrice = firstSubProduct.sizes[0]?.price || firstSubProduct.sizes[0]?.originalPrice || 0;
        } else if (firstSubProduct?.price) {
          originalPrice = firstSubProduct.price;
        } else if (product.price) {
          originalPrice = product.price;
        }

        const discount = firstSubProduct?.discount || product.discount || 0;
        if (discount > 0 && originalPrice > 0) {
          price = originalPrice - (originalPrice * discount / 100);
        } else {
          price = originalPrice;
        }
      } catch (e) {
        price = 0;
        originalPrice = 0;
      }

      // Extract image safely
      let image = product.image || '';
      try {
        if (!image && firstSubProduct?.images && Array.isArray(firstSubProduct.images) && firstSubProduct.images.length > 0) {
          const img = firstSubProduct.images[0];
          image = typeof img === 'string' ? img : (img?.url || '');
        }
        if (!image && firstSubProduct?.sizes && Array.isArray(firstSubProduct.sizes) && firstSubProduct.sizes.length > 0) {
          const size = firstSubProduct.sizes[0];
          if (size?.images && Array.isArray(size.images) && size.images.length > 0) {
            const img = size.images[0];
            image = typeof img === 'string' ? img : (img?.url || '');
          }
        }
        if (!image) {
          image = '/images/broken-link.png';
        }
      } catch (e) {
        image = '/images/broken-link.png';
      }

      // Extract subcategory information - handle both formats
      let subcategory = '';
      if (product.subcategory) {
        if (typeof product.subcategory === 'string') {
          subcategory = product.subcategory;
        } else if (typeof product.subcategory === 'object' && product.subcategory.name) {
          subcategory = product.subcategory.name;
        }
      }

      // Get sold count from product
      const orderCount = product.orderCount || 0;
      const soldCount = product.sold || 0;

      // Determine bestseller status based on sales threshold (30+ orders) or explicit flag
      const isBestsellerBySales = soldCount >= 30 || orderCount >= 30;
      const isBestsellerFlag = product.isBestseller || false;

      return {
        _id: product._id?.toString() || '',
        name: product.name || 'Unnamed Product',
        slug: product.slug || '',
        price,
        originalPrice,
        discount: firstSubProduct?.discount || product.discount || 0,
        category: product.category,
        tagValues: product.tagValues || [],
        subcategory,
        subCategories: product.subCategories || [], // Keep the original subCategories array
        isNew: product.isNew || (product.createdAt && new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000),
        isBestseller: isBestsellerFlag || isBestsellerBySales, // Use either explicit flag or sales-based determination
        bestsellerRank: isBestsellerBySales ? (soldCount || orderCount) : 0, // Add rank for sorting
        isFeatured: product.isFeatured || product.featured || false,
        isOnSale: (firstSubProduct?.discount || product.discount || 0) > 0,
        stock,
        image,
        subProducts,
        rating: product.rating || 0, // Extract rating
        numReviews: product.numReviews || product.reviews || 0, // Extract number of reviews
        orderCount: orderCount,
        sold: soldCount,
      };
    } catch (error) {
      console.error('Error transforming product:', error, product);
      return null;
    }
  };

  // Check if any products have ratings
  const hasProductsWithRatings = useMemo(() => {
    return allProducts.some(product =>
      product.rating &&
      product.rating > 0 &&
      product.numReviews &&
      product.numReviews > 0
    );
  }, [allProducts]);

  // Single unified filter function
  const applyFilters = useCallback((filters: SelectedFiltersState, newPriceRange?: number[]) => {
    if (newPriceRange) {
      setPriceRange(newPriceRange);
    }

    // Start with all products
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const name = product.name?.toLowerCase() || '';
        const categoryName = typeof product.category === 'object' 
          ? product.category?.name?.toLowerCase() || ''
          : '';
        const subcategoryName = typeof product.subcategory === 'string'
          ? product.subcategory.toLowerCase()
          : product.subcategory?.name?.toLowerCase() || '';
        return name.includes(query) || categoryName.includes(query) || subcategoryName.includes(query);
      });
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        const productCategoryId = typeof product.category === 'object' 
          ? product.category._id 
          : product.category;
        return filters.category.includes(productCategoryId);
      });
    }

    // Apply subcategory filter - handle both ID and name
    if (filters.subcategory.length > 0) {
      filtered = filtered.filter(product => {
        return filters.subcategory.some(filterSub => {
          const isFilterId = /^[0-9a-fA-F]{24}$/.test(filterSub);
          let filterName = filterSub.toLowerCase();
          let filterId = filterSub;

          // Convert ID to name if needed
          if (isFilterId) {
            const foundSub = allSubCategoryDetails.find(
              sub => sub._id === filterSub || sub._id?.toString() === filterSub
            );
            if (foundSub?.name) {
              filterName = foundSub.name.toLowerCase();
            }
          }

          // Check subcategory field (string)
          if (typeof product.subcategory === 'string') {
            if (product.subcategory.toLowerCase() === filterName || 
                (isFilterId && product.subcategory === filterId)) {
              return true;
            }
          }

          // Check subcategory field (object)
          if (typeof product.subcategory === 'object' && product.subcategory) {
            const productSubName = product.subcategory.name?.toLowerCase();
            const productSubId = product.subcategory._id?.toString();
            if (productSubName === filterName || 
                (isFilterId && productSubId === filterId)) {
              return true;
            }
          }

          // Check subCategories array
          if (Array.isArray(product.subCategories)) {
            return product.subCategories.some(subcat => {
              if (typeof subcat === 'string') {
                return subcat.toLowerCase() === filterName || 
                       (isFilterId && subcat === filterId);
              }
              if (typeof subcat === 'object' && subcat) {
                const subCatName = subcat.name?.toLowerCase();
                const subCatId = subcat._id?.toString();
                return subCatName === filterName || 
                       (isFilterId && subCatId === filterId);
              }
              return false;
            });
          }

          return false;
        });
      });
    }

    // Apply tag filter (AND across groups, OR within groups)
    if (filters.tags.length > 0) {
      const tagGroups: Record<string, string[]> = {};
      filters.tags.forEach(selectedTag => {
        const [tagName, tagValue] = selectedTag.split(':');
        if (!tagGroups[tagName]) tagGroups[tagName] = [];
        tagGroups[tagName].push(tagValue);
      });

      filtered = filtered.filter(product => {
        if (!product.tagValues || !Array.isArray(product.tagValues)) return false;
        
        return Object.entries(tagGroups).every(([tagName, values]) => {
          return values.some(val => {
            return product.tagValues!.some((tv: any) => {
              const pTagName = typeof tv.tag === 'object' ? tv.tag.name : tv.tag;
              if (!pTagName || !tv.value) return false;
              
              const pTagNameLower = String(pTagName).toLowerCase();
              const pTagValueLower = String(tv.value).toLowerCase();
              const filterTagNameLower = tagName.toLowerCase();
              const filterValueLower = val.toLowerCase();
              
              return pTagNameLower === filterTagNameLower && pTagValueLower === filterValueLower;
            });
          });
        });
      });
    }

    // Apply price filter
    const minPrice = newPriceRange ? newPriceRange[0] : filters.price[0];
    const maxPrice = newPriceRange ? newPriceRange[1] : filters.price[1];
    filtered = filtered.filter(product => {
      const productPrice = product.price || 0;
      return productPrice >= minPrice && productPrice <= maxPrice;
    });

    // Apply status filters
    if (filters.sale.includes('sale')) {
      filtered = filtered.filter(product => product.discount && product.discount > 0);
    }
    if (filters.isFeatured.includes('featured')) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(product => {
        // Check isFeatured property (featured is not in the Product interface)
        const isFeatured = product.isFeatured === true || (product as any).featured === true;
        return isFeatured;
      });
      console.log(`Featured filter: ${beforeCount} -> ${filtered.length} products`);
    }
    if (filters.isNew.includes('new')) {
      filtered = filtered.filter(product => product.isNew === true || product.isNew);
    }
    if (filters.bestSelling.includes('bestseller')) {
      const beforeCount = filtered.length;
      
      // Calculate sales count for all products and sort by sales
      const productsWithSales = filtered.map(product => {
        const soldCount = product.sold || 0;
        const orderCount = product.orderCount || 0;
        const totalSales = soldCount > 0 ? soldCount : orderCount;
        return {
          ...product,
          totalSales
        };
      });
      
      // Sort by sales count (descending)
      const sortedBySales = [...productsWithSales].sort((a, b) => b.totalSales - a.totalSales);
      
      // Determine threshold: top 20% of products or minimum 5 products, but only if they have sales > 0
      const productsWithSalesCount = sortedBySales.filter(p => p.totalSales > 0).length;
      const threshold = Math.max(5, Math.ceil(productsWithSalesCount * 0.2));
      
      // Get top selling products
      const topSellingProducts = sortedBySales
        .filter(p => p.totalSales > 0)
        .slice(0, threshold)
        .map(p => p._id);
      
      // Filter to show only top selling products or products marked as bestseller
      filtered = filtered.filter(product => {
        // Include if explicitly marked as bestseller
        if (product.isBestseller === true) return true;
        // Include if in top selling list
        return topSellingProducts.includes(product._id);
      });
      
      console.log(`Best Selling filter: ${beforeCount} -> ${filtered.length} products (top ${threshold} by sales)`);
    }
    if (filters.inStock.includes('instock')) {
      filtered = filtered.filter(product => product.stock && product.stock > 0);
    }
    if (filters.rating.length > 0) {
      const minRating = Math.min(...filters.rating.map(r => parseInt(r, 10)));
      filtered = filtered.filter(product => 
        product.rating && product.rating >= minRating
      );
    }

    // Update filtered products only - don't update selectedFilters to avoid infinite loop
    setFilteredProducts(filtered);
  }, [allProducts, searchQuery, allSubCategoryDetails]);

  // Apply filters when state changes (from URL/props, not user interaction)
  useEffect(() => {
    if (directProducts.length > 0) {
      setFilteredProducts(directProducts);
      return;
    }

    // Skip if filters were just applied by user (handled in handleApplyFilters)
    if (skipURLUpdate.current) {
      skipURLUpdate.current = false;
      return;
    }

    // Build filters including page-based filters
    let filtersToApply = { ...selectedFilters };

    // If on category page, add category to filters
    if (pageType === ShopPageType.CATEGORY && currentCategorySlug) {
      const category = categories.find(c => c.slug === currentCategorySlug);
      if (category && !filtersToApply.category.includes(category._id)) {
        filtersToApply = {
          ...filtersToApply,
          category: [category._id],
          subcategory: []
        };
      }
    }

    // If on subcategory page, add subcategory to filters
    if (pageType === ShopPageType.SUBCATEGORY && currentSubCategoryName) {
      const isSubId = /^[0-9a-fA-F]{24}$/.test(currentSubCategoryName);
      let subcategoryValue = currentSubCategoryName;

      // Convert ID to name if needed
      if (isSubId) {
        const foundSub = allSubCategoryDetails.find(
          sub => sub._id === currentSubCategoryName || sub._id?.toString() === currentSubCategoryName
        );
        if (foundSub?.name) {
          subcategoryValue = foundSub.name;
        }
      }

      if (!filtersToApply.subcategory.includes(subcategoryValue)) {
        filtersToApply = {
          ...filtersToApply,
          subcategory: [subcategoryValue]
        };
      }
    }

    // Apply filters using the unified function
    applyFilters(filtersToApply, priceRange);

    // Update URL if needed (but skip if this is from URL parsing to avoid loop)
    if (!isInitialSync.current && !skipURLUpdate.current) {
      updateURL();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts, selectedFilters, priceRange, pageType, currentCategorySlug, currentSubCategoryName, directProducts, categories, allSubCategoryDetails]);

  // Dynamically update tags based on products matching current category and search
  useEffect(() => {
    try {
      // To prevent filters from disappearing when selected, we should extract tags
      // from products that match the current Category and Search Query, 
      // but NOT necessarily the current Tag filters themselves.

      let baseProductsForTags = [...allProducts];

      // Apply category filter
      if (pageType === ShopPageType.CATEGORY && currentCategorySlug) {
        const category = categories.find(c => c.slug === currentCategorySlug);
        if (category) {
          baseProductsForTags = baseProductsForTags.filter(product =>
            product.category && typeof product.category === 'object' && product.category._id === category._id
          );
        }
      }

      // Apply subcategory filter
      if (pageType === ShopPageType.SUBCATEGORY && currentSubCategoryName) {
        baseProductsForTags = baseProductsForTags.filter(product => {
          // Normalize the subcategory name (could be ID or name)
          const isSubId = /^[0-9a-fA-F]{24}$/.test(currentSubCategoryName);
          let filterSubName = currentSubCategoryName.toLowerCase();
          let filterSubId = currentSubCategoryName;
          
          if (isSubId) {
            const foundSub = allSubCategoryDetails.find(
              sub => sub._id === currentSubCategoryName || sub._id?.toString() === currentSubCategoryName
            );
            if (foundSub && foundSub.name) {
              filterSubName = foundSub.name.toLowerCase();
            }
          }
          
          // Check string subcategory
          if (typeof product.subcategory === 'string') {
            return product.subcategory.toLowerCase() === filterSubName || 
                   (isSubId && product.subcategory === filterSubId);
          }
          // Check object subcategory
          if (typeof product.subcategory === 'object' && product.subcategory) {
            const productSubName = product.subcategory.name?.toLowerCase();
            const productSubId = product.subcategory._id?.toString() || product.subcategory._id;
            
            if (productSubName === filterSubName || 
                (isSubId && (productSubId === filterSubId || String(productSubId).toLowerCase() === filterSubId.toLowerCase()))) {
              return true;
            }
          }
          
          // Check subCategories array
          if (Array.isArray(product.subCategories)) {
            return product.subCategories.some(subCat => {
              if (typeof subCat === 'string') {
                const subCatLower = subCat.toLowerCase();
                return subCatLower === filterSubName || 
                       (isSubId && (subCat === filterSubId || subCatLower === filterSubId.toLowerCase()));
              }
              if (typeof subCat === 'object' && subCat) {
                const subCatName = subCat.name?.toLowerCase();
                const subCatId = subCat._id?.toString() || subCat._id;
                
                return subCatName === filterSubName || 
                       (isSubId && (subCatId === filterSubId || String(subCatId).toLowerCase() === filterSubId.toLowerCase()));
              }
              return false;
            });
          }
          return false;
        });
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        baseProductsForTags = baseProductsForTags.filter(product => {
          const subcategoryName = typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?.name || '';
          const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || '';
          return (
            product.name?.toLowerCase().includes(query) ||
            categoryName.toLowerCase().includes(query) ||
            subcategoryName.toLowerCase().includes(query)
          );
        });
      }

      if (baseProductsForTags.length > 0) {
        const dynamicTags = extractTagsFromProducts(baseProductsForTags);
        setTags(dynamicTags);
        console.log(`Updated tags from ${baseProductsForTags.length} base products:`, dynamicTags.length, 'tag groups');
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Error updating dynamic tags:', error);
    }
  }, [allProducts, pageType, currentCategorySlug, currentSubCategoryName, searchQuery, categories, allSubCategoryDetails]);

  // Update URL with current filter state
  const updateURL = useCallback((filters?: SelectedFiltersState, range?: number[]) => {
    // Skip if we're currently syncing from URL to prevent loops
    if (skipURLUpdate.current) {
      skipURLUpdate.current = false;
      return;
    }

    try {
      // Use provided filters/range or fall back to current state
      const filtersToUse = filters || selectedFilters;
      const rangeToUse = range || priceRange;

      // Build URL parameters
      const params = new URLSearchParams();

      // Search query
      if (searchQuery?.trim()) {
        params.set('search', searchQuery.trim());
      }

      // Category filters
      if (filtersToUse.category.length > 0) {
        const validCategories = filtersToUse.category
          .filter(c => c && typeof c === 'string' && c !== '[object Object]')
          .sort();
        if (validCategories.length > 0) {
          params.set('category', validCategories.join(','));
        }
      }

      // Subcategory filters
      if (filtersToUse.subcategory.length > 0) {
        const validSubcategories = filtersToUse.subcategory
          .filter(s => s && typeof s === 'string' && s !== '[object Object]')
          .sort();
        if (validSubcategories.length > 0) {
          params.set('subcategory', validSubcategories.join(','));
        }
      }

      // Tag filters
      if (filtersToUse.tags.length > 0) {
        params.set('tags', [...filtersToUse.tags].sort().join(','));
      }

      // Price range (only if not default)
      if (rangeToUse[0] > 0) {
        params.set('minPrice', rangeToUse[0].toString());
      }
      if (rangeToUse[1] < 20000) {
        params.set('maxPrice', rangeToUse[1].toString());
      }

      // Status filters
      if (filtersToUse.sale.includes('sale')) {
        params.set('sale', 'true');
      }
      if (filtersToUse.bestSelling.includes('bestseller')) {
        params.set('bestseller', 'true');
      }
      if (filtersToUse.isNew.includes('new')) {
        params.set('new', 'true');
      }
      if (filtersToUse.isFeatured.includes('featured')) {
        params.set('featured', 'true');
      }

      // Rating filters
      if (filtersToUse.rating.length > 0) {
        params.set('rating', [...filtersToUse.rating].sort().join(','));
      }

      // Build URL string
      params.sort(); // Sort for consistent URLs
      const paramsString = params.toString();
      const newURL = paramsString ? `${pathname}?${paramsString}` : (pathname || '/shop');

      // Get current URL for comparison
      const currentURL = window.location.pathname + window.location.search;
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;

      // Only update if URL actually changed
      if (newURL && newURL !== currentPath + currentSearch) {
        router.replace(newURL, { scroll: false });
      }
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }, [selectedFilters, priceRange, searchQuery, pathname, router]);

  // Handle filter application
  const handleApplyFilters = useCallback((filters: SelectedFiltersState, range: number[]) => {
    setSelectedFilters(filters);
    setPriceRange(range);
    setIsMobileFilterOpen(false);
    // Apply filters directly to avoid infinite loop
    skipURLUpdate.current = true;
    applyFilters(filters, range);
    // Update URL immediately with the new filters
    updateURL(filters, range);
  }, [applyFilters, updateURL]);

  // Handle filter clearing
  const handleClearFilters = () => {
    setSelectedFilters({
      category: [],
      subcategory: [],
      sale: [],
      tags: [],
      bestSelling: [],
      isNew: [],
      isFeatured: [],
      inStock: [],
      rating: [],
      price: [0, 20000] as [number, number], // Add missing price property
      color: [], // Add missing color property
      size: [], // Add missing size property
    });
    setPriceRange([0, 20000]);
    setSearchQuery('');
  };

  // Clear all filters (including search and direct products)
  const clearAllFilters = useCallback(() => {
    setSelectedFilters({
      category: [],
      subcategory: [],
      sale: [],
      tags: [],
      bestSelling: [],
      isNew: [],
      isFeatured: [],
      inStock: [],
      rating: [],
      price: [0, 20000] as [number, number], // Add missing price property
      color: [], // Add missing color property
      size: [], // Add missing size property
    });
    setPriceRange([0, 20000]);
    setSearchQuery('');

    // Navigate to the main shop page when clearing all filters
    if (pathname !== '/shop') {
      router.push('/shop');
    }
  }, [pathname, router]);

  // Remove individual filter
  const removeFilter = (type: keyof SelectedFiltersState, value: string) => {
    console.log(`Removing filter: ${type} with value: ${value}`);

    // Update our filter state
    setSelectedFilters(prev => {
      // Create a copy of the previous state
      const newFilters = { ...prev };

      // Check if the filter type exists in our state and handle different types
      if (type === 'price') {
        // Reset price to default range if removing price filter
        newFilters[type] = [0, 20000] as [number, number];
      } else if (Array.isArray(newFilters[type])) {
        // Remove the specific value from the array for other filter types
        (newFilters[type] as string[]) = (newFilters[type] as string[]).filter(v => v !== value);
      }

      return newFilters;
    });

    // If we're on a category or subcategory page and removing that specific filter,
    // we should navigate back to the main shop page
    if (
      (pageType === ShopPageType.CATEGORY && type === 'category') ||
      (pageType === ShopPageType.SUBCATEGORY && type === 'subcategory')
    ) {
      router.push('/shop');
    } else {
      // For all other cases, just update the URL parameters to reflect the filter removal
      updateURL();
    }
  };

  // Get display name for filter values
  const getDisplayName = (type: keyof SelectedFiltersState, value: string): string => {
    try {
      switch (type) {
        case 'category':
          return categories.find(c => c._id === value)?.name || value;
        case 'tags':
          return value;
        case 'subcategory':
          return value;
        case 'sale':
          return 'On Sale';
        case 'bestSelling':
          return 'Best Selling';
        case 'isNew':
          return 'New Arrivals';
        case 'isFeatured':
          return 'Featured';
        default:
          return value;
      }
    } catch (error) {
      console.error('Error getting display name:', error);
      return value;
    }
  };

  // Get active filters for display
  const getActiveFilters = () => {
    try {
      const activeFilters: Array<{ type: keyof SelectedFiltersState; value: string; displayName: string }> = [];

      Object.entries(selectedFilters).forEach(([type, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach((value: string) => {
            activeFilters.push({
              type: type as keyof SelectedFiltersState,
              value,
              displayName: getDisplayName(type as keyof SelectedFiltersState, value)
            });
          });
        }
      });

      return activeFilters;
    } catch (error) {
      console.error('Error getting active filters:', error);
      return [];
    }
  };

  const shopContextValue: ShopContextType = {
    filteredProducts,
    loading,
    selectedFilters,
    priceRange,
    searchQuery,
    totalProducts: allProducts.length,
    setSearchQuery,
    setSelectedFilters,
    setPriceRange,
    clearAllFilters,
    categories,
    subcategories,
    tags,
    allSubCategoryDetails,
    pageType,
    currentCategorySlug,
    currentSubCategoryId,
    currentSubCategoryName,
    setDirectProducts, // Add the setDirectProducts function to the context
    setPageType, // Add setPageType to context
    setCurrentSubCategoryName, // Add setCurrentSubCategoryName to context
    setLoading, // Add setLoading to context
    setCurrentCategorySlug, // Add setCurrentCategorySlug to context
    removeFilter, // Add removeFilter to context
  };

  return (
    <ShopContext.Provider value={shopContextValue}>
      <div className="min-h-screen bg-white">
        <div className="max-w-full mx-auto px-4 py-6">
          {/* Search Bar - Top Level */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Input
                placeholder="Search products, categories, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-base"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar filters - hidden on mobile */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <SidebarFilters
                  categories={categories}
                  subCategoryNames={subcategories}
                  tags={tags}
                  subCategoryDetails={allSubCategoryDetails}
                  onApplyFilters={handleApplyFilters}
                  onClearFilters={handleClearFilters}
                  initialFilters={selectedFilters}
                  initialPriceRange={priceRange}
                  className="sticky top-24"
                  isLoading={loading}
                  hasProductsWithRatings={hasProductsWithRatings}
                  // Disable the current category filter if we're on a category page
                  disabledCategories={pageType === ShopPageType.CATEGORY && currentCategorySlug
                    ? (() => {
                      const category = categories.find(c => c.slug === currentCategorySlug);
                      return category ? [category._id] : [];
                    })()
                    : []
                  }
                  // Disable the current subcategory filter if we're on a subcategory page
                  disabledSubcategories={pageType === ShopPageType.SUBCATEGORY && currentSubCategoryName
                    ? [currentSubCategoryName]
                    : []
                  }
                />
              </div>
            </div>

            {/* Mobile filter button - visible only on mobile */}
            <div className="lg:hidden sticky top-0 z-30 bg-white pt-2 pb-2 mb-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Button
                  id="mobileFilterButton"
                  onClick={() => {
                    const filterDrawer = document.getElementById('mobileFilterDrawer');
                    const overlay = document.getElementById('filterOverlay');
                    if (filterDrawer && overlay) {
                      filterDrawer.style.transform = 'translateX(0)';
                      overlay.style.display = 'block';
                      setTimeout(() => {
                        overlay.style.opacity = '1';
                      }, 10);
                    }
                  }}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all bg-white"
                  size="sm"
                  variant="outline"
                >
                  <Filter size={16} />
                  Filters
                  {getActiveFilters().length > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                      {getActiveFilters().length}
                    </Badge>
                  )}
                </Button>

                <div className="text-sm text-gray-600 font-medium">
                  {loading ? 'Loading...' : `${filteredProducts.length} products`}
                </div>
              </div>
            </div>

            {/* Mobile filter drawer using direct DOM manipulation */}
            <div
              id="filterOverlay"
              className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
              style={{ display: 'none', opacity: 0, transition: 'opacity 0.3s ease' }}
              onClick={(e) => {
                const filterDrawer = document.getElementById('mobileFilterDrawer');
                const overlay = document.getElementById('filterOverlay');
                if (filterDrawer && overlay) {
                  filterDrawer.style.transform = 'translateX(-100%)';
                  overlay.style.opacity = '0';
                  setTimeout(() => {
                    overlay.style.display = 'none';
                  }, 300);
                }
              }}
            >
              <div
                id="mobileFilterDrawer"
                className="fixed inset-y-0 left-0 w-[85%] max-w-[350px] bg-white shadow-xl z-[101] overflow-hidden"
                style={{ transform: 'translateX(-100%)', transition: 'transform 0.3s ease' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b sticky top-0 bg-white z-10">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const filterDrawer = document.getElementById('mobileFilterDrawer');
                        const overlay = document.getElementById('filterOverlay');
                        if (filterDrawer && overlay) {
                          filterDrawer.style.transform = 'translateX(-100%)';
                          overlay.style.opacity = '0';
                          setTimeout(() => {
                            overlay.style.display = 'none';
                          }, 300);
                        }
                      }}
                      className="rounded-full hover:bg-gray-100"
                    >
                      <X size={18} />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 pb-24 overflow-y-auto max-h-[calc(100vh-130px)]">
                  <SidebarFilters
                    categories={categories}
                    subCategoryNames={subcategories}
                    tags={tags}
                    subCategoryDetails={allSubCategoryDetails}
                    onApplyFilters={(filters, range) => {
                      handleApplyFilters(filters, range);
                      // Do not close the drawer automatically on individual filter changes
                      // This allows users to select multiple filters before closing
                    }}
                    onClearFilters={handleClearFilters}
                    initialFilters={selectedFilters}
                    initialPriceRange={priceRange}
                    isLoading={loading}
                    hasProductsWithRatings={hasProductsWithRatings}
                    disabledCategories={pageType === ShopPageType.CATEGORY && currentCategorySlug
                      ? (() => {
                        const category = categories.find(c => c.slug === currentCategorySlug);
                        return category ? [category._id] : [];
                      })()
                      : []
                    }
                    disabledSubcategories={pageType === ShopPageType.SUBCATEGORY && currentSubCategoryName
                      ? [currentSubCategoryName]
                      : []
                    }
                  />
                </div>

                <div className="p-4 border-t fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 max-w-[350px]">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drawer from closing
                        handleClearFilters();
                      }}
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drawer from closing
                        handleApplyFilters(selectedFilters, priceRange);
                        // Close drawer after applying all filters
                        const filterDrawer = document.getElementById('mobileFilterDrawer');
                        const overlay = document.getElementById('filterOverlay');
                        if (filterDrawer && overlay) {
                          filterDrawer.style.transform = 'translateX(-100%)';
                          overlay.style.opacity = '0';
                          setTimeout(() => {
                            overlay.style.display = 'none';
                          }, 300);
                        }
                      }}
                      className="flex-1"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 bg-white">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ShopContext.Provider>
  );
}
