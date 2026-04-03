import { ReactNode, Suspense, lazy } from 'react';

const Navbar = lazy(() => import('@/components/shared/navbar/Navbar.new'));
import LayoutFooter from '@/components/layout/LayoutFooter';
import GlobalSpacer from '@/components/layout/GlobalSpacer';
const Chatbot = lazy(() => import('@/components/shared/chatbot/Chatbot'));
import Preloader from '@/components/shared/Preloader';


// Enhanced loading fallback components with better skeletons
const NavbarSkeleton = () => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
    {/* Top bar skeleton */}
    <div className="bg-gray-100 h-8 animate-pulse">
      <div className="container mx-auto px-2 sm:px-4 h-full flex items-center justify-center">
        <div className="h-3 w-32 sm:w-48 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Main navbar skeleton */}
    <div className="px-2 sm:px-4 lg:px-6 mx-auto max-w-7xl h-14 sm:h-16 flex items-center justify-between animate-pulse">
      <div className="h-6 w-20 sm:h-8 sm:w-32 bg-gray-200 rounded flex-shrink-0"></div>

      {/* Desktop navigation links */}
      <div className="hidden md:flex space-x-4 lg:space-x-6">
        <div className="h-4 w-12 lg:w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 lg:w-20 bg-gray-200 rounded"></div>
        <div className="h-4 w-10 lg:w-12 bg-gray-200 rounded"></div>
        <div className="h-4 w-12 lg:w-16 bg-gray-200 rounded"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="hidden lg:flex flex-1 justify-center px-2 xl:px-4 max-w-md mx-auto">
        <div className="w-full h-8 lg:h-10 bg-gray-200 rounded-full"></div>
      </div>

      {/* Right section icons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full md:hidden"></div>
      </div>
    </div>
  </div>
);

// Error boundary component for lazy loaded components
const LazyLoadErrorBoundary = ({ children, fallback }: { children: ReactNode; fallback: ReactNode }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Preloader />

      {/* Lazy loaded Navbar with enhanced skeleton */}
      <LazyLoadErrorBoundary fallback={<NavbarSkeleton />}>
        <Navbar />
      </LazyLoadErrorBoundary>

      {/* Main content area with proper conditional top padding */}
      <main className="flex-grow w-full">
        <GlobalSpacer />
        {children}
      </main>

      {/* Client component that conditionally imports footer */}
      <LayoutFooter />

      {/* AI Chatbot - Available on all pages */}
      <LazyLoadErrorBoundary fallback={null}>
        <Chatbot />
      </LazyLoadErrorBoundary>
    </div>
  );
}
