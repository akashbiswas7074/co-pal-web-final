'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/shared/Logo';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-white sticky top-0 z-50 border-b border-gray-100 ${className}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">


          {/* Logo (Left) */}
          <div className="flex-shrink-0">
            <Logo size="lg" />
          </div>

          {/* Navigation (Center - Desktop) - Simplified list for now */}
          <nav className="hidden md:flex items-center space-x-8 uppercase tracking-widest text-[11px] font-semibold">
            <Link href="/shop" className="nav-link">Shop All</Link>
            <Link href="/categories" className="nav-link">Collections</Link>
            <Link href="/new-arrivals" className="nav-link">New Arrivals</Link>
            <Link href="/about" className="nav-link">Our Story</Link>
            <Link href="/support" className="nav-link">Support</Link>
          </nav>

          {/* Actions (Right) */}
          <div className="flex items-center space-x-2 md:space-x-5">
            {/* Search - Icon only for clean look, could trigger modal */}
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[hsl(var(--primary))]">
              <Search size={22} strokeWidth={1.5} />
            </Button>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[hsl(var(--primary))]">
                <Heart size={22} strokeWidth={1.5} />
              </Button>
            </Link>

            {/* Account */}
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[hsl(var(--primary))]">
                <User size={22} strokeWidth={1.5} />
              </Button>
            </Link>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-[hsl(var(--primary))]">
              <ShoppingCart size={22} strokeWidth={1.5} />
              <span className="absolute top-1 -right-1 bg-[hsl(var(--accent))] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
