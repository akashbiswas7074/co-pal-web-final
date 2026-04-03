import React from 'react';
import { Star } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface ReviewBreakdown {
  stars: number;
  percentage: number;
}

interface ReviewSummaryProps {
  rating: number;
  totalReviews: number;
  breakdown: ReviewBreakdown[];
}

const ReviewSummary = ({ rating, totalReviews, breakdown }: ReviewSummaryProps) => {
  if (totalReviews === 0) return null;

  return (
    <div className="py-8 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center gap-12">
        {/* Left: Big Rating */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-bold tracking-tighter text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-xl font-medium text-gray-400">/ 5.0</span>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.floor(rating) ? "fill-[#ffcc00] text-[#ffcc00]" : "text-gray-200"}
              />
            ))}
          </div>
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
            Based on {totalReviews.toLocaleString()} {totalReviews === 1 ? 'Review' : 'Reviews'}
          </p>
        </div>

        {/* Right: Detailed Breakdown */}
        <div className="flex-grow max-w-xl space-y-3">
          {breakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-4 group cursor-default">
              <div className="flex items-center gap-1 w-12 shrink-0">
                <span className="text-sm font-bold text-gray-900">{item.stars}</span>
                <Star size={12} className="fill-gray-900 text-gray-900" />
              </div>
              <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500 ease-out group-hover:bg-gray-800"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="w-12 text-right shrink-0">
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action: Optional secondary info/button */}
        <div className="hidden lg:block lg:ml-auto">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p className="text-sm font-bold text-gray-900 mb-1 italic">"Authentic feedback from verified customers"</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Transparency Guaranteed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;