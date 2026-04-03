"use client";

import { useCartStore } from "@/store/cart";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Helper to safely convert to string for display
const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // Avoid rendering complex objects directly
  if (typeof value === 'object') {
    // Check for empty objects first
    if (Object.keys(value).length === 0) {
      return ""; // Return empty string for empty objects
    }
    // Attempt to get a meaningful string representation if possible
    if (value.toString && value.toString !== Object.prototype.toString) {
      try {
        return value.toString();
      } catch (err) {
        console.error("Error calling toString():", err);
        return "[Object]";
      }
    }
    // Fallback for generic objects - log error and return placeholder
    console.error("Attempted to render non-primitive value:", value);
    return "[Object]";
  }
  return ""; // Fallback for other types
};

const CartSheetItems = ({ product }: { product: any }) => {
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const updateCart = useCartStore((state: any) => state.updateCart);
  const cartItems = useCartStore((state: any) => state.cart.cartItems);

  const updateQty = (type: string) => {
    setIsUpdating(true);
    const currentQty = Number(product.qty || product.quantity || 0);
    const newQty = type === "plus" ? currentQty + 1 : currentQty - 1;

    if (newQty < 1) {
      setIsUpdating(false);
      return;
    }

    const updatedCartItems = cartItems.map((p: any) => {
      if (p._uid === product._uid) {
        return { ...p, qty: newQty, quantity: newQty };
      }
      return p;
    });

    updateCart(updatedCartItems);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const removeProduct = async () => {
    setIsRemoving(true);
    const updatedCartItems = cartItems.filter((p: any) => p._uid !== product._uid);
    updateCart(updatedCartItems);
    toast.success("Item removed");
    setIsRemoving(false);
  };

  const currentQuantity = Number(product.qty || product.quantity || 0);
  const productName = safeToString(product.name);
  const productSize = product.size ? safeToString(product.size) : null;
  const productPrice = typeof product.price === 'number' ? product.price :
    typeof product.price === 'string' ? parseFloat(product.price) : 0;
  const formattedPrice = `₹${(productPrice * currentQuantity).toLocaleString('en-IN')}`;
  const imageUrl = product.image || "/placeholder.png";

  return (
    <div className={cn(
      "relative py-4 border-b border-gray-100 transition-opacity duration-300",
      (isUpdating || isRemoving) && "opacity-50 pointer-events-none"
    )}>
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-[#f9f9f9] overflow-hidden">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-1 leading-tight">
                {productName}
              </h3>
              {productSize && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Volume: {productSize}
                </p>
              )}
            </div>
            <button
              onClick={removeProduct}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-200 h-9 px-2">
              <button
                onClick={() => updateQty("minus")}
                disabled={currentQuantity <= 1}
                className="w-6 h-full flex items-center justify-center text-gray-400 hover:text-black disabled:opacity-30"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-8 text-center text-[11px] font-bold text-gray-900">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQty("plus")}
                className="w-6 h-full flex items-center justify-center text-gray-400 hover:text-black"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>

            {/* Total Price for this item */}
            <span className="text-sm font-bold text-gray-900 tracking-tighter">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSheetItems;
