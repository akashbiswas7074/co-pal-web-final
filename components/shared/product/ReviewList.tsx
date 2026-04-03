import React from 'react';
import { Star, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AllReviewsModal from './AllReviewsModal';

interface ReviewListProps {
  reviews: Array<{
    _id: string;
    rating: number;
    comment: string;
    user: string;
    name: string;
    createdAt: string;
    userImage?: string;
    verified?: boolean;
    images?: Array<{ url: string; public_id: string }>;
    videos?: Array<{ url: string; public_id: string }>;
  }>;
  productName: string;
}

const ReviewList = ({ reviews, productName }: ReviewListProps) => {
  // Sort reviews to show newest first
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-gray-400 font-medium tracking-tight">No reviews yet for this product.</p>
      </div>
    );
  }

  // Initial display limit removed for the masonry grid to work better, 
  // but we can still use the modal for "View All" if there are many.
  const displayedReviews = sortedReviews;

  return (
    <div className="mt-12">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {displayedReviews.map((review) => (
          <div
            key={review._id}
            className="break-inside-avoid bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Media Content */}
            {(review.images?.length || 0) > 0 || (review.videos?.length || 0) > 0 ? (
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                {review.videos && review.videos.length > 0 ? (
                  <div className="relative w-full h-full">
                    <video
                      src={review.videos[0].url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors">
                      <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-sm">
                        <Play size={20} className="text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : review.images && review.images.length > 0 ? (
                  <img
                    src={review.images[0].url}
                    alt="Customer review image"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
            ) : null}

            {/* Content Section */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "fill-[#ffcc00] text-[#ffcc00]" : "text-gray-200"}
                    />
                  ))}
                </div>
                {review.verified && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00b67a]">Verified</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{review.name}</p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </p>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{review.comment}"
              </p>

              {/* Multiple Images Indicator if any */}
              {((review.images?.length || 0) > 1 || (review.videos?.length || 0) > 1) && (
                <div className="flex gap-2 pt-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[...(review.images || []), ...(review.videos || [])].slice(1).map((media, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={media.url} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 12 && (
        <div className="mt-12 text-center">
          <AllReviewsModal productName={productName} reviews={reviews} />
        </div>
      )}
    </div>
  );
};

export default ReviewList;