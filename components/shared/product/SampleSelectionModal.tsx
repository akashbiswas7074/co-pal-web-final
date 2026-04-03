"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Sample {
  _id: string;
  name: string;
  price: number;
  variant: string;
  image?: string;
  status: string;
  productId: string;
}

interface SampleSelectionModalProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    subProducts?: any[];
  };
  samples: Sample[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SampleSelectionModal: React.FC<SampleSelectionModalProps> = ({
  product,
  samples,
  isOpen,
  onOpenChange,
}) => {
  const { addItem } = useCart();

  const handleSelectSample = (sample: Sample) => {
    const itemToAdd = {
      _id: sample._id,
      _uid: `sample_${sample._id}`,
      name: `${product.name} (${sample.variant || 'Sample'})`,
      image: sample.image || (product.subProducts?.[0]?.images?.[0]?.url) || "/placeholder.png",
      price: sample.price,
      slug: product.slug,
      product: product._id,
      quantity: 1,
      qty: 1,
      originalPrice: sample.price,
      discount: 0,
      availableQty: 99,
      isSample: true,
    };

    try {
      addItem(itemToAdd);
      toast.success(`${product.name} (${sample.variant || 'Sample'}) added to cart!`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding sample to cart:", error);
      toast.error("Failed to add sample to cart.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-none border-0 p-0">
        <div className="bg-white p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold uppercase tracking-widest text-gray-900 border-b border-black pb-2">
              Select Sample
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-gray-500 font-medium pt-2">
              {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {samples
              .filter((s) => s.status === "available")
              .map((sample, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-100 hover:border-black transition-all cursor-pointer group bg-[#fafafa]"
                  onClick={() => handleSelectSample(sample)}
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-900">
                      {sample.variant || "Standard"}
                    </p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-tight mt-1">
                      Ready to ship
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-bold text-gray-900">
                      ₹{sample.price}
                    </p>
                    <span className="text-[10px] font-bold text-black uppercase tracking-widest mt-2 px-3 py-1 bg-white border border-black group-hover:bg-black group-hover:text-white transition-colors">
                      Select
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 italic text-[10px] text-gray-400 text-center uppercase tracking-widest">
            Experience the essence of {product.name}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
