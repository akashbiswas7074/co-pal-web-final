'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Lazy load the Footer component
const Footer = lazy(() => import('@/components/shared/Footer'));

const FooterSkeleton = () => (
    <div className="bg-gray-50 border-t border-gray-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                <div className="space-y-4">
                    <div className="h-8 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="flex space-x-3">
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    </div>
                </div>

                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="h-4 w-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded mt-4 md:mt-0"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function LayoutFooter() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid hydration mismatch by waiting for mount
    // const isAuthPage = mounted && pathname?.startsWith('/auth');

    return (
        <Suspense fallback={<FooterSkeleton />}>
            <Footer />
        </Suspense>
    );
}
