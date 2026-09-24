"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Play } from "lucide-react";

const TikTokIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface Influencer {
    _id: string;
    name: string;
    handle: string;
    platform: "TikTok" | "Instagram";
    mediaUrl: string;
    thumbnailUrl?: string;
    productName?: string;
}

interface InfluencerSpotlightProps {
    influencers: Influencer[];
}

const InfluencerCard: React.FC<{ influencer: Influencer }> = ({ influencer }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || url.includes('video/upload');
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current && isVideo(influencer.mediaUrl)) {
            videoRef.current.play().catch(err => console.log("Video play error:", err));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current && isVideo(influencer.mediaUrl)) {
            videoRef.current.pause();
            // videoRef.current.currentTime = 0; // Optional: Reset video on leave
        }
    };

    const isMediaVideo = isVideo(influencer.mediaUrl);

    return (
        <div
            className="group relative aspect-[9/16] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Media (Image or Thumbnail) */}
            <Image
                src={influencer.thumbnailUrl || influencer.mediaUrl}
                alt={influencer.name}
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-700 ${isHovered && isMediaVideo ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Video Player (Plays on Hover) */}
            {isMediaVideo && (
                <video
                    ref={videoRef}
                    src={influencer.mediaUrl}
                    loop
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Play Button Overlay (Show only if video and NOT playing/hovered, or according to user design) */}
            {!isHovered && isMediaVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center transform transition-all duration-300">
                        <Play className="fill-white text-white w-6 h-6 md:w-8 md:h-8 ml-1" />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        {influencer.platform === "TikTok" ? (
                            <TikTokIcon className="text-white w-4 h-4" />
                        ) : (
                            <Instagram className="text-white w-4 h-4" />
                        )}
                    </div>
                    <span className="text-xs font-medium tracking-wider uppercase opacity-80">
                        {influencer.handle}
                    </span>
                </div>

                <h3 className="font-bold text-sm md:text-base leading-tight mb-1">
                    {influencer.name}
                </h3>
                {influencer.productName && (
                    <p className="text-xs text-white/70 line-clamp-1">{influencer.productName}</p>
                )}
            </div>

            {/* CTA Link (Full Card) - Only active if not video, or maybe always active? 
                Usually for hover play we don't want the link to interfere with the hover interaction if it's meant to be watched.
                But if we want a link to the original content, we keep it. 
                Using z-index 10 for the link.
            */}
            {!isMediaVideo && (
                <Link href={influencer.mediaUrl} target="_blank" className="absolute inset-0 z-10" aria-label={`View ${influencer.name}'s content`} />
            )}
        </div>
    );
};

const InfluencerSpotlight: React.FC<InfluencerSpotlightProps> = ({ influencers }) => {
    if (!influencers || influencers.length === 0) return null;

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Influencer Spotlight: Feel The DUA Love!</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Watch as influencers share their favorite Dua fragrances and bring our scents to life in their own style.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {influencers.map((influencer) => (
                        <InfluencerCard key={influencer._id} influencer={influencer} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InfluencerSpotlight;
