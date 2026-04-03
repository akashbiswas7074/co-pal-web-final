"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, User, X, Heart, Search, ChevronDown, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useAtom, useStore } from "jotai";
import { hamburgerMenuState } from "./store";
import { useCartStore } from "@/store/cart";

import { useWebsiteLogo } from "@/hooks/use-website-logo";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useNavbarLinks } from "@/hooks/use-navbar-links";
import { useNavbarSettings } from "@/hooks/use-navbar-settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


// Lazy load heavy components that aren't critical for initial render
const CartDrawer = lazy(() => import("./CartDrawer"));
const TopBarComponent = lazy(() => import("../TopBar"));
const NavbarInput = lazy(() => import("./NavbarInput"));
const MobileSpecificHeader = lazy(() => import("./MobileSpecificHeader"));
const BottomNavigationBar = lazy(() => import("./BottomNavigationBar"));
const SearchModal = lazy(() => import("../SearchModal"));

// Loading skeletons for lazy components
const CartDrawerSkeleton = () => (
  <div className="fixed inset-0 z-50 bg-black/50 opacity-0 pointer-events-none" />
);

const TopBarSkeleton = () => (
  <div className="bg-gray-100 h-8 animate-pulse">
    <div className="container mx-auto px-4 h-full flex items-center justify-center">
      <div className="h-3 w-48 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const NavbarInputSkeleton = () => (
  <div className="w-full max-w-xl h-10 bg-gray-200 rounded-full animate-pulse"></div>
);

// New skeleton components for logo and navigation links
const LogoSkeleton = () => (
  <div className="flex items-center relative z-10 flex-shrink-0">
    <div className="relative h-8 w-24 sm:h-10 sm:w-32 lg:w-36 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

const NavLinksSkeleton = () => (
  <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
    {[...Array(5)].map((_, index) => (
      <div
        key={index}
        className="h-4 lg:h-5 bg-gray-200 rounded animate-pulse"
        style={{ width: `${Math.random() * 60 + 60}px` }}
      ></div>
    ))}
  </div>
);

const MobileNavLinksSkeleton = () => (
  <div className="overflow-y-auto flex-1 py-4 sm:py-6">
    {[...Array(5)].map((_, index) => (
      <div
        key={index}
        className="px-4 sm:px-6 py-3 border-b border-gray-50 last:border-b-0"
      >
        <div
          className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 100 + 100}px` }}
        ></div>
      </div>
    ))}
  </div>
);

const BottomNavSkeleton = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 lg:hidden animate-pulse">
    <div className="flex items-center justify-around h-full px-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-center flex-1 py-2">
          <div className="h-6 w-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

const Navbar = () => {
  const { data: session, status } = useSession();
  const { removeItem, updateItemQuantity, isCartDrawerOpen, setCartDrawerOpen } = useCart();
  const { wishlist, isLoading: isWishlistLoading } = useWishlist();
  const { logo, isLoading: isLogoLoading } = useWebsiteLogo();
  const siteConfig = useSiteConfig();

  const { links: navbarLinks, loading: navLinksLoading } = useNavbarLinks();
  const { settings: navbarSettings, loading: navSettingsLoading } = useNavbarSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useAtom(hamburgerMenuState, {
    store: useStore(),
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [show, setShow] = useState("translate-y-0");
  const [lastScrollY, setLastScrollY] = useState(0);
  const cartItems = useCartStore((state: any) => state.cart?.cartItems || []);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const pathname = usePathname();
  const [categories, setCategories] = useState<any[]>([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories-nav');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/auth/');

  const hexToRgba = (hex: string, opacity: number) => {
    let r = 0, g = 0, b = 0;
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (window.scrollY > 200) {
        if (window.scrollY > lastScrollY && !isMobileMenuOpen) {
          setShow("-translate-y-full");
        } else {
          setShow("shadow-lg");
        }
      } else {
        setShow("translate-y-0");
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isMobileMenuOpen]);

  // Effect to handle body scroll lock when mobile menu, cart drawer, or search modal is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isAnyOpen = isMobileMenuOpen || isCartDrawerOpen || openSearchModal;
      
      if (isAnyOpen) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
      }
    };
  }, [isMobileMenuOpen, isCartDrawerOpen, openSearchModal]);

  const toggleSearch = () => {
    setOpenSearchModal(true);
  };

  const navItems = navbarLinks.length > 0
    ? navbarLinks
    : [
      { label: "Fragrances", href: "/shop" },
      { label: "Sample Packs", href: "/products/order-samples" },
      { label: "Classifications", href: "/categories" },
      { label: "Support", href: "/support" },
      { label: "Our Story", href: "/about" },
    ];

  const logoUrl = logo?.logoUrl || siteConfig.logo.imagePath;
  const altText = logo?.altText || siteConfig.name;
  const logoText = logo?.name || siteConfig.logo.text;
  const showLogoImage = logo?.logoUrl || siteConfig.logo.useImage;

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${show}`}>
        {!isAuthPage && (
          <Suspense fallback={<TopBarSkeleton />}>
            <TopBarComponent />
          </Suspense>
        )}

        {(() => {
          let navStyle: React.CSSProperties = {};
          let navBgClass = '';
          
          if (!navSettingsLoading && navbarSettings) {
            if (navbarSettings.backgroundType === 'solid') {
              navStyle.backgroundColor = navbarSettings.backgroundColorValue;
              navBgClass = isScrolled || isAuthPage ? 'py-2 sm:py-4 shadow-2xl' : 'py-2 sm:py-5 shadow-lg';
            } else if (navbarSettings.backgroundType === 'gradient') {
              navStyle.background = navbarSettings.backgroundGradientValue;
              navBgClass = isScrolled || isAuthPage ? 'py-2 sm:py-4 shadow-2xl' : 'py-2 sm:py-5 shadow-lg';
            } else if (navbarSettings.backgroundType === 'blur') {
              const isOpaque = isAuthPage || isScrolled;
              const opacityVal = isOpaque ? Math.min((navbarSettings.blurOpacity + 20) / 100, 1) : navbarSettings.blurOpacity / 100;
              
              navStyle.backgroundColor = hexToRgba(navbarSettings.backgroundColorValue, opacityVal);
              navBgClass = isOpaque ? 'backdrop-blur-2xl py-2 sm:py-4 shadow-2xl' : 'backdrop-blur-xl py-2 sm:py-5 shadow-lg';
            }
            if (navbarSettings.textColor) {
               navStyle.color = navbarSettings.textColor;
            }
          } else {
            // Default styling (while loading)
            navBgClass = isAuthPage || isScrolled ? 'bg-[#1a0a2c]/60 backdrop-blur-2xl py-2 sm:py-4 shadow-2xl' : 'bg-[#1a0a2c]/40 backdrop-blur-xl py-2 sm:py-5 shadow-lg';
          }

          const dynamicTextColor = navStyle.color || 'white';
          const dynamicBgColor = navbarSettings?.backgroundColorValue || '#1a0a2c';

          return (
            <nav 
              className={`w-full transition-all duration-1000 ease-in-out ${navBgClass} border-b border-white/5`}
              style={navStyle}
            >
              <div className="px-3 sm:px-6 lg:px-10 xl:px-20 mx-auto max-w-[1920px]">
                <div className="flex items-center justify-between h-auto gap-1 sm:gap-4 md:gap-6 lg:gap-12 w-full">
                  <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0 min-w-0">
                    {/* Logo */}
                    {isLogoLoading ? (
                      <LogoSkeleton />
                    ) : (

                      <Link href="/" className="flex items-center relative z-10 group flex-shrink-0 animate-in fade-in slide-in-from-left duration-1000 w-auto">
                        {showLogoImage && logoUrl ? (
                          <div className="relative h-8 sm:h-12 md:h-16 w-[120px] sm:w-[180px] md:w-[220px] transition-transform duration-500 group-hover:scale-105">
                            <Image
                              src={logoUrl}
                              alt={altText}
                              fill
                              className="object-contain"
                              priority
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-start leading-tight" style={{ color: dynamicTextColor }}>
                            <span className="text-3xl sm:text-5xl md:text-7xl font-serif font-black tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2 drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                              {logoText || "THE DUA BRAND"}
                            </span>
                            <span className="text-[9px] sm:text-[12px] md:text-[14px] opacity-90 tracking-[0.4em] sm:tracking-[0.6em] font-bold uppercase pl-1 drop-shadow-md">
                              Handcrafted in Los Angeles
                            </span>
                          </div>
                        )}
                      </Link>
                    )}
                  </div>

                  {/* Desktop Navigation Links - Centered */}
                  {(navLinksLoading || navSettingsLoading) ? (
                    <NavLinksSkeleton />
                  ) : navbarSettings?.desktopLayout === 'inline' ? (
                    <div className="hidden lg:flex items-center gap-6 lg:gap-8 justify-center flex-1">
                      {/* CATEGORIES Dropdown */}
                      {categories.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-[11px] lg:text-[13px] font-bold transition-all duration-300 uppercase tracking-[0.1em] flex items-center gap-1 group whitespace-nowrap py-2 px-1 hover:opacity-100 opacity-90" style={{ color: dynamicTextColor }}>
                              Classifications
                              <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="center"
                            sideOffset={20}
                            style={{ backgroundColor: dynamicBgColor, color: dynamicTextColor, borderColor: hexToRgba(dynamicTextColor, 0.1) }}
                            className="w-[calc(100vw-40px)] max-w-6xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 lg:p-12 backdrop-blur-md shadow-2xl z-[1001] rounded-2xl animate-in fade-in zoom-in-95 duration-300 border"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-8 lg:gap-x-12 gap-y-12 lg:gap-y-16">
                              {categories.map((cat) => (
                                <div key={cat._id} className="flex flex-col space-y-4 lg:space-y-5 group/cat">
                                  <Link
                                    href={`/shop/category/${cat.slug}`}
                                    className="text-[14px] lg:text-[15px] font-extrabold tracking-widest border-b-2 transition-all duration-300 uppercase pb-2"
                                    style={{ 
                                      color: dynamicTextColor, 
                                      borderColor: hexToRgba(dynamicTextColor, 0.1)
                                    }}
                                  >
                                    {cat.name}
                                  </Link>
                                  <div className="flex flex-col space-y-2.5 lg:space-y-3">
                                    {cat.subCategories.map((sub: any) => (
                                      <Link
                                        key={sub._id}
                                        href={`/shop/category/${cat.slug}/${sub.slug}`}
                                        className="text-[13px] lg:text-[14px] hover:translate-x-1 transition-all duration-200 flex items-center group/sub"
                                        style={{ color: dynamicTextColor }}
                                      >
                                        <span 
                                          className="w-0 group-hover/sub:w-2 h-[1px] mr-0 group-hover/sub:mr-2 transition-all duration-200 opacity-0 group-hover/sub:opacity-100"
                                          style={{ backgroundColor: dynamicTextColor }}
                                        ></span>
                                        <span className="opacity-70 group-hover/sub:opacity-100 transition-opacity">
                                          {sub.name}
                                        </span>
                                      </Link>
                                    ))}
                                      {cat.subCategories.length > 5 && (
                                        <Link
                                          href={`/shop/category/${cat.slug}`}
                                          className="text-[12px] lg:text-[13px] font-semibold transition-colors pt-1 lg:pt-2 opacity-50 hover:opacity-100"
                                          style={{ color: dynamicTextColor }}
                                        >
                                          View All →
                                        </Link>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Optional Bottom Banner or Info */}
                            <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: hexToRgba(dynamicTextColor, 0.1) }}>
                              <p className="text-[10px] lg:text-xs tracking-widest uppercase text-center sm:text-left opacity-50">Explore our latest collections</p>
                              <Link href="/shop" className="text-[10px] lg:text-xs font-bold transition-all uppercase tracking-widest hover:opacity-70" style={{ color: dynamicTextColor }}>
                                Shop Full Catalog
                              </Link>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {navItems.map((item) => {
                        const isHashLink = item.href?.startsWith('#');
                        const linkClassName = "text-[11px] lg:text-[13px] font-bold transition-all duration-300 uppercase tracking-[0.1em] whitespace-nowrap py-2 px-1";

                        if (isHashLink) {
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              className={`${linkClassName} hover:opacity-100 opacity-90`}
                              style={{ color: dynamicTextColor }}
                            >
                              {item.label}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={item.href}
                            href={item.href || '/'}
                            className={`${linkClassName} hover:opacity-100 opacity-90`}
                            style={{ color: dynamicTextColor }}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Mobile Search (toggle) */}
                  <div className={`${isSearchVisible ? 'flex absolute top-14 sm:top-16 left-0 right-0 z-20 px-2 sm:px-4 py-3 bg-white shadow-lg border-b' : 'hidden'} md:hidden`}>
                    <Suspense fallback={<NavbarInputSkeleton />}>
                      <NavbarInput responsive={true} />
                    </Suspense>
                  </div>

                  {/* Right section - Action buttons */}
                  <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                    {/* Search Button */}
                    <button
                      onClick={toggleSearch}
                      className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 
                        active:scale-95 hover:shadow-sm opacity-90 hover:opacity-100 group"
                      style={{ color: dynamicTextColor }}
                      title="Search"
                    >
                      <Search className="h-[18px] w-[18px] transition-colors duration-300" />
                    </button>


                    {/* Wishlist Icon */}
                    <Link href="/wishlist" passHref>
                      <button
                        className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-300
                          active:scale-95 hover:shadow-sm opacity-90 hover:opacity-100"
                        style={{ color: dynamicTextColor }}
                        title="Wishlist"
                      >
                        <Heart className="h-[18px] w-[18px] transition-colors duration-300" />
                        {!isWishlistLoading && wishlist.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white 
                            text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center
                            shadow-sm ring-1 ring-[#1a0a2c] animate-in zoom-in min-w-[16px]"
                          >
                            {wishlist.length > 99 ? '99+' : wishlist.length}
                          </span>
                        )}
                      </button>
                    </Link>

                    {/* Cart */}
                    <button
                      onClick={() => setCartDrawerOpen(true)}
                      className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-300 
                        active:scale-95 hover:shadow-sm opacity-90 hover:opacity-100"
                      style={{ color: dynamicTextColor }}
                      title="Shopping Cart"
                    >
                      <ShoppingCart className="h-[18px] w-[18px] transition-colors duration-300" />
                      {Array.isArray(cartItems) && cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full 
                          h-4 w-4 flex items-center justify-center shadow-sm ring-1 ring-[#1a0a2c] 
                          animate-in zoom-in min-w-[16px]">
                          {cartItems.reduce((total, item) => {
                            const itemQty = Number(item?.quantity || item?.qty || 0);
                            return total + itemQty;
                          }, 0) > 99 ? '99+' : cartItems.reduce((total, item) => {
                            const itemQty = Number(item?.quantity || item?.qty || 0);
                            return total + itemQty;
                          }, 0)}
                        </span>
                      )}
                    </button>

                    {/* Auth Section */}
                    {status === "authenticated" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-gray-200 hover:ring-gray-300 
                            transition-all duration-300 hover:shadow-md flex-shrink-0 ml-1">
                            <AvatarImage src={session?.user?.image || ""} />
                            <AvatarFallback style={{ backgroundColor: hexToRgba(dynamicTextColor, 0.1), color: dynamicTextColor }} className="text-sm font-medium">
                              {session?.user?.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" style={{ backgroundColor: dynamicBgColor, color: dynamicTextColor, borderColor: hexToRgba(dynamicTextColor, 0.1) }} className="w-56 backdrop-blur-2xl border shadow-2xl z-[1002] rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] px-3 py-2 opacity-50">
                            Account Settings
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild className="focus:bg-white/10 rounded-lg transition-colors cursor-pointer">
                            <Link href="/profile" className="flex items-center w-full px-3 py-2.5 text-sm">
                              <User className="h-4 w-4 mr-3 opacity-70" />
                              My Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator style={{ backgroundColor: hexToRgba(dynamicTextColor, 0.1) }} className="my-1" />
                          <DropdownMenuItem
                            onClick={() => signOut()}
                            className="focus:bg-red-500/10 focus:text-red-400 text-red-500/80 rounded-lg transition-colors cursor-pointer px-3 py-2.5 text-sm flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-3 opacity-70" />
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link href="/auth/signin">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 text-xs px-3 py-2 ml-1 font-medium border"
                          style={{ 
                            backgroundColor: hexToRgba(dynamicTextColor, 0.1), 
                            borderColor: hexToRgba(dynamicTextColor, 0.2),
                            color: dynamicTextColor
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Sign In</span>
                          <span className="sm:hidden">Login</span>
                        </Button>
                      </Link>
                    )}

                    {/* Burger Menu Button (Far Right) */}
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className={`p-2 hover:opacity-100 opacity-90 transition-all duration-300 
                        active:scale-95 flex items-center gap-2 group ml-2 border border-white/20 rounded-md ${navbarSettings?.desktopLayout === 'inline' ? 'lg:hidden' : ''}`}
                      style={{ color: dynamicTextColor }}
                      aria-label="Open Menu"
                    >
                      <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="hidden lg:inline-block text-[11px] font-bold tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">Menu</span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          );
        })()}

        {/* Mobile menu - improved responsive design */}
        <div className={`
          fixed inset-0 z-[110] 
          transition-opacity duration-300
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `} suppressHydrationWarning>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
            suppressHydrationWarning
          />

          <div className={`
            absolute top-0 right-0 h-screen w-full max-w-xs sm:max-w-sm
            flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.3)] 
            transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `} 
          style={{ backgroundColor: navbarSettings?.backgroundColorValue || '#1a0a2c' }}
          suppressHydrationWarning>

            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-medium" style={{ color: navbarSettings?.textColor || 'white' }}>Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-black/5 rounded-full transition-all duration-300
                  active:scale-95 h-8 w-8 p-1.5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" style={{ color: navbarSettings?.textColor || 'white' }} />
              </Button>
            </div>


            <div className="overflow-y-auto flex-1 py-4 sm:py-6">
              {/* CATEGORIES Accordion for Mobile */}
              {categories.length > 0 && (
                <div className="px-4 sm:px-6 mb-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories" className="border-none">
                      <AccordionTrigger className="py-3 text-base sm:text-lg font-medium hover:no-underline" style={{ color: navbarSettings?.textColor || 'white' }}>
                        Classifications
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-1 mt-1">
                          {categories.map((cat) => (
                            <Accordion type="single" collapsible key={cat._id} className="w-full border-b border-white/10 last:border-0">
                              <AccordionItem value={cat._id} className="border-none">
                                <AccordionTrigger 
                                  className="py-4 pl-2 text-[15px] font-bold hover:no-underline hover:opacity-100 transition-all uppercase tracking-[0.05em]"
                                  style={{ color: navbarSettings?.textColor || 'white' }}
                                >
                                  {cat.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-col space-y-3 pl-6 py-2 pb-4">
                                    <Link
                                      href={`/shop/category/${cat.slug}`}
                                      className="text-sm font-extrabold flex items-center hover:opacity-100"
                                      style={{ color: navbarSettings?.textColor || 'white' }}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      <span className="w-2 h-[1px] mr-2" style={{ backgroundColor: navbarSettings?.textColor || 'white' }}></span>
                                      VIEW ALL {cat.name}
                                    </Link>
                                    {cat.subCategories.map((sub: any) => (
                                      <Link
                                        key={sub._id}
                                        href={`/shop/category/${cat.slug}/${sub.slug}`}
                                        className="text-sm opacity-70 hover:opacity-100 flex items-center py-0.5"
                                        style={{ color: navbarSettings?.textColor || 'white' }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        <span className="w-4 h-[1px] opacity-20 mr-3" style={{ backgroundColor: navbarSettings?.textColor || 'white' }}></span>
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Mobile Navigation Links */}
              {navLinksLoading ? (
                <MobileNavLinksSkeleton />
              ) : (
                <div className="overflow-y-auto flex-1 py-4 sm:py-6">
                  {navItems.map((item) => {
                    const isHashLink = item.href?.startsWith('#');
                    const linkClassName = "block px-4 sm:px-6 py-3 text-base sm:text-lg opacity-80 hover:opacity-100 hover:bg-white/5 transition-all duration-300 active:scale-[0.98] border-b border-white/5 last:border-b-0";

                    if (isHashLink) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className={linkClassName}
                          style={{ color: navbarSettings?.textColor || 'white' }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href || '/'}
                        className={linkClassName}
                        style={{ color: navbarSettings?.textColor || 'white' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  {/* Additional mobile menu items */}
                  <div className="border-t border-white/10 mt-4 sm:mt-6 pt-4 sm:pt-6">
                    <Link
                      href="/wishlist"
                      className="flex items-center px-4 sm:px-6 py-3 text-base sm:text-lg opacity-80 hover:opacity-100 hover:bg-white/5 
                        transition-all duration-300 active:scale-[0.98]"
                      style={{ color: navbarSettings?.textColor || 'white' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>Wishlist</span>
                      {!isWishlistLoading && wishlist.length > 0 && (
                        <span className="ml-2 bg-red-600 text-white text-xs font-medium rounded-full h-5 w-5 
                          flex items-center justify-center flex-shrink-0">
                          {wishlist.length > 99 ? '99+' : wishlist.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-4 sm:px-6 py-3 text-base sm:text-lg opacity-80 hover:opacity-100 hover:bg-white/5 
                        transition-all duration-300 active:scale-[0.98]"
                      style={{ color: navbarSettings?.textColor || 'white' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0">
                        <path d="M21 8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path>
                        <path d="M8 6h8"></path>
                        <path d="M8 10h8"></path>
                        <path d="M8 14h6"></path>
                      </svg>
                      My Orders
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User section in mobile menu */}
            <div className="p-4 sm:p-6 border-t border-white/10">
              {status === "authenticated" ? (
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback style={{ backgroundColor: hexToRgba(navbarSettings?.textColor || '#ffffff', 0.1), color: navbarSettings?.textColor || 'white' }}>
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate" style={{ color: navbarSettings?.textColor || 'white' }}>{session?.user?.name}</p>
                    <p className="text-xs opacity-50 truncate" style={{ color: navbarSettings?.textColor || 'white' }}>{session?.user?.email}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 flex-shrink-0"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <Button
                    className="w-full flex items-center justify-center py-3 sm:py-6 backdrop-blur-md transition-all duration-300"
                    style={{ 
                      backgroundColor: hexToRgba(navbarSettings?.textColor || '#ffffff', 0.1), 
                      color: navbarSettings?.textColor || 'white',
                      borderColor: hexToRgba(navbarSettings?.textColor || '#ffffff', 0.2),
                      borderWidth: '1px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Cart Drawer */}
        <Suspense fallback={<CartDrawerSkeleton />}>
          <CartDrawer
            isOpen={isCartDrawerOpen}
            onClose={() => {
              setCartDrawerOpen(false);
              try {
                const storeState = useCartStore.getState();
                if (storeState && typeof (storeState as any).setCartDrawerOpen === 'function') {
                  (storeState as any).setCartDrawerOpen(false);
                }
              } catch (error) {
                // handle error
              }
            }}
          />
        </Suspense>

        {/* Search Modal */}
        {openSearchModal && (
          <Suspense fallback={null}>
            <SearchModal
              isOpen={openSearchModal}
              onClose={() => setOpenSearchModal(false)}
            />
          </Suspense>
        )}
      </div>

      {/* Bottom Navigation Bar (only on mobile) */}
      <Suspense fallback={<BottomNavSkeleton />}>
        <BottomNavigationBar />
      </Suspense>
    </>
  );
};

export default Navbar;
