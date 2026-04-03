'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStatsTickerData } from '@/lib/database/actions/stats-ticker.actions';

const defaultItems = [
    { emoji: '🌿', label: 'Vegan & Cruelty-Free' },
    { emoji: '💧', label: 'Long-Lasting Formula' },
    { emoji: '🤝', label: 'Handcrafted In The USA' },
    { emoji: '❌', label: 'Free Of Harmful Chemicals' },
    { emoji: '🌍', label: 'Shipping Worldwide' },
    { emoji: '⭐', label: 'Premium Quality' },
    { emoji: '🎁', label: 'Exclusive Collections' },
    { emoji: '✨', label: '100% Authentic Products' },
];

export default function StatsTicker() {
    const [items, setItems] = useState(defaultItems);
    const [backgroundColor, setBackgroundColor] = useState('linear-gradient(90deg, #22c9a0 0%, #7c3aed 50%, #e879f9 100%)');
    const [speed, setSpeed] = useState(28);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getStatsTickerData();
                if (res?.success && res.data) {
                    setItems(res.data.items?.length > 0 ? res.data.items : defaultItems);
                    setBackgroundColor(res.data.backgroundColor || 'linear-gradient(90deg, #22c9a0 0%, #7c3aed 50%, #e879f9 100%)');
                    setSpeed(res.data.speed || 28);
                }
            } catch (error) {
                console.error("Failed to fetch stats ticker", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const duplicated = [...items, ...items, ...items];

    if (loading) return null; // Avoid flashing default UI if you want, or render default

    return (
        /**
         * Outer wrapper:
         *  - overflow-hidden clips the extra width of the rotated band
         *  - negative marginTop overlaps the bottom of the carousel
         *  - z-[1000] sits above all other sections
         *  - height is generous so the angled band fills fully
         */
        <div
            className="relative w-full max-w-[100vw] z-[1000] overflow-hidden -mt-16 md:-mt-24"
            style={{ height: '250px' }}
        >
            {/* Rotated band — extra wide so clipped edges don't show white */}
            <div
                className="absolute left-[-10%] right-[-10%] top-[20px] md:top-[35px]"
                style={{
                    transform: 'rotate(-2deg)',
                    transformOrigin: 'center center',
                    background: backgroundColor,
                }}
            >
                {/* Text tilts with the band — same angle */}
                <div className="py-6 md:py-10">
                    <motion.div
                        className="flex gap-8 md:gap-12 whitespace-nowrap"
                        animate={{ x: [0, '-33.33%'] }}
                        transition={{
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: speed,
                            ease: 'linear',
                        }}
                    >
                        {duplicated.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-white font-bold tracking-widest uppercase"
                                style={{ fontSize: '13px' }}
                            >
                                <span className="text-base md:text-lg">{item.emoji}</span>
                                <span className="text-[11px] md:text-[14px]">{item.label}</span>
                                <span style={{ marginLeft: '16px', opacity: 0.4 }}>•</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
