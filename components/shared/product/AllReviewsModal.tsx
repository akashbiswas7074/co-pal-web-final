import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/StarRating";
import { Play } from "lucide-react";

interface AllReviewsModalProps {
  productName: string;
  reviews: any[];
}

const AllReviewsModal = ({ productName, reviews }: AllReviewsModalProps) => {
  const [sortedReviews, setSortedReviews] = useState<any[]>([]);
  const [sortMethod, setSortMethod] = useState<string>("newest");

  useEffect(() => {
    sortReviews(sortMethod);
  }, [reviews, sortMethod]);

  const sortReviews = (method: string) => {
    let sorted = [...reviews];

    switch (method) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        // Default to newest
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setSortedReviews(sorted);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="mt-4">
          View All Reviews
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[80vh] w-full overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>All Reviews for {productName}</SheetTitle>
          <SheetDescription>
            {reviews.length} customer reviews
          </SheetDescription>

          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              className="text-sm border border-gray-300 rounded-md p-1"
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <div key={review._id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src={review.userImage || ""}
                      alt={review.name}
                    />
                    <AvatarFallback>
                      {review.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{review.name}</span>
                      {review.verified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                      <span className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <StarRating rating={review.rating} size={16} />

                    <p className="mt-2 text-gray-700 leading-relaxed italic">"{review.comment}"</p>

                    {/* Review Media */}
                    {(review.images?.length > 0 || review.videos?.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.videos?.map((video: any, idx: number) => (
                          <div key={`v-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden bg-black border border-gray-100 flex-shrink-0">
                            <video src={video.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play size={16} className="text-white fill-white" />
                            </div>
                          </div>
                        ))}
                        {review.images?.map((image: any, idx: number) => (
                          <div key={`i-${idx}`} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src={image.url} className="w-full h-full object-cover" alt="Review" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews yet for this product.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AllReviewsModal;