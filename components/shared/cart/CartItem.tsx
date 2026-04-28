"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CartItemProps {
  product: any;
}

const CartItem = ({ product }: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const updateCart = useCartStore((state: any) => state.updateCart);
  const cartItems = useCartStore((state: any) => state.cart.cartItems);

  const updateQuantity = (newQty: number) => {
    if (newQty < 1) return;
    
    // Check stock if available
    if (product.availableQty && newQty > product.availableQty) {
      toast.error(`Only ${product.availableQty} items available in stock`);
      return;
    }

    setIsUpdating(true);
    const updatedCartItems = cartItems.map((item: any) => {
      if (item._uid === product._uid) {
        return { ...item, qty: newQty, quantity: newQty };
      }
      return item;
    });

    updateCart(updatedCartItems);
    setTimeout(() => setIsUpdating(true), 300); // UI delay for smoother feel
    setIsUpdating(false);
  };

  const removeProduct = () => {
    setIsRemoving(true);
    const updatedCartItems = cartItems.filter((item: any) => item._uid !== product._uid);
    updateCart(updatedCartItems);
    toast.success("Item removed from bag");
    setIsRemoving(false);
  };

  const currentQuantity = Number(product.qty || product.quantity || 1);
  const price = Number(product.price || 0);
  const totalItemPrice = price * currentQuantity;

  return (
    <div className={cn(
      "group relative flex flex-col sm:flex-row gap-6 py-8 border-b border-gray-100 transition-all duration-300",
      (isUpdating || isRemoving) && "opacity-50 pointer-events-none"
    )}>
      {/* Product Image */}
      <div className="relative w-full sm:w-40 aspect-square bg-[#fafafa] rounded-none overflow-hidden flex-shrink-0 group-hover:bg-[#f5f5f5] transition-colors">
        <Image
          src={product.image || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-contain p-4 mix-blend-multiply"
          sizes="(max-width: 640px) 100vw, 160px"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 leading-tight">
              {product.name}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {product.size && (
                <span>Volume: <span className="text-gray-900">{product.size}</span></span>
              )}
              {product.isSample && (
                <span className="text-blue-600">Sample Pack</span>
              )}
            </div>
            {product.availableQty !== undefined && product.availableQty < 10 && (
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest pt-1">
                Only {product.availableQty} left in stock
              </p>
            )}
          </div>
          
          <button 
            onClick={removeProduct}
            className="text-gray-300 hover:text-black transition-colors"
            title="Remove item"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-8 sm:mt-0 flex flex-wrap items-end justify-between gap-6">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Qty</p>
            <div className="flex items-center border border-gray-200 h-12 bg-white">
              <button 
                onClick={() => updateQuantity(currentQuantity - 1)}
                disabled={currentQuantity <= 1}
                className={cn(
                  "px-4 h-full flex items-center justify-center transition-colors",
                  currentQuantity <= 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-black hover:bg-gray-50"
                )}
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <div className="w-10 h-full flex items-center justify-center text-xs font-bold border-x border-gray-200 text-gray-900">
                {currentQuantity}
              </div>
              <button 
                onClick={() => updateQuantity(currentQuantity + 1)}
                className="px-4 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total</p>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-gray-900 tracking-tighter">
                ₹{totalItemPrice.toLocaleString('en-IN')}
              </span>
              {currentQuantity > 1 && (
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  ₹{price.toLocaleString('en-IN')} each
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isUpdating && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <Loader2 className="animate-spin text-black" size={24} />
        </div>
      )}
    </div>
  );
};

export default CartItem;
