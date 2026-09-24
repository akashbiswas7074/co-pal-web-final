'use client';

import React, { useState, useEffect } from 'react';
import { getStatsTickerData } from '@/lib/database/actions/stats-ticker.actions';

interface TickerItem {
    emoji: string;
    label: string;
    iconColor?: string;
    textColor?: string;
}

const defaultItems: TickerItem[] = [
    { emoji: '⚡', label: 'Pro Athletic Gears' },
    { emoji: '🇮🇳', label: 'Handcrafted In India' },
    { emoji: '🚚', label: 'Shipping Nationwide' },
    { emoji: '⭐', label: 'Uncompromised Quality' },
    { emoji: '🏃', label: 'Engineered For Performance' },
    { emoji: '✨', label: '100% Authentic Products' },
    { emoji: '🥇', label: 'Athlete Grade Standards' },
];

export default function StatsTicker() {
    const [items, setItems] = useState<TickerItem[]>(defaultItems);
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
        <div
            className="relative w-full overflow-hidden select-none shadow-sm z-10"
            style={{
                background: backgroundColor,
            }}
        >
            <div className="py-3 md:py-4">
                <style>{`
                    @keyframes tickerMarquee {
                        0% { transform: translate3d(0, 0, 0); }
                        100% { transform: translate3d(-33.333%, 0, 0); }
                    }
                `}</style>
                <div
                    className="flex gap-8 md:gap-12 whitespace-nowrap"
                    style={{
                        animation: `tickerMarquee ${speed}s linear infinite`,
                        willChange: 'transform'
                    }}
                >
                    {duplicated.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 font-bold tracking-widest uppercase"
                            style={{ fontSize: '13px' }}
                        >
                            <span
                                className="text-base md:text-lg"
                                style={{ color: item.iconColor || '#ffffff' }}
                            >
                                {item.emoji}
                            </span>
                            <span
                                className="text-[11px] md:text-[14px]"
                                style={{ color: item.textColor || '#1f2937' }}
                            >
                                {item.label}
                            </span>
                            <span style={{ marginLeft: '16px', opacity: 0.4, color: item.textColor || '#1f2937' }}>•</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
