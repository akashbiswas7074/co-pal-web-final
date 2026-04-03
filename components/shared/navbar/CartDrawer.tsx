"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose, // Make sure SheetClose is imported
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X, Truck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CartSheetItems from "../CartSheetItems";
import { useCartStore } from "@/store/cart";
import { getSavedCartForUser } from "@/lib/database/actions/cart.actions";

// Define cart item type
type ColorType = {
  color?: string;
  name?: string;
};

type CartItem = {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  qty?: number; // Add optional qty property
  size?: string;
  color?: string | ColorType;
  style?: any; // Add style property
  _uid?: string; // Make _uid optional
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const cartItems = useCartStore((state: any) => state.cart.cartItems || []);
  const setCartDrawerOpen = useCartStore((state: any) => state.setCartDrawerOpen);

  const subtotal = cartItems.reduce((acc: number, item: CartItem) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity || item.qty || 0);
    return acc + price * quantity;
  }, 0);

  const handleCheckout = () => {
    if (!session) {
      toast.error("Please sign in to proceed to checkout.");
      setCartDrawerOpen(false); // Close drawer
      router.push("/auth/signin?callbackUrl=/checkout");
    } else {
      setCartDrawerOpen(false); // Close drawer
      router.push("/checkout");
    }
  };

  // Close drawer function using store action
  const handleClose = () => {
    setCartDrawerOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="sm:max-w-md w-full flex flex-col z-[100] bg-white p-0 border-l border-gray-100 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <SheetTitle className="text-[14px] font-bold uppercase tracking-[0.2em] text-gray-900">
            Your Shopping Bag
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-transparent">
            <X size={20} className="text-gray-400" />
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-gray-200" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Your bag is empty</h3>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest leading-loose mb-8">
              Items remain in your bag for 30 days. Don't let them fly away.
            </p>
            <Button
              onClick={() => { onClose(); router.push('/shop'); }}
              className="w-full bg-black text-white rounded-none h-12 uppercase text-[11px] font-bold tracking-[0.2em]"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 py-4 bg-[#f9f9f9]">
              {subtotal < 999 ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-2 text-center">
                    You're <span className="text-[#e41e26]">₹{(999 - subtotal).toLocaleString('en-IN')}</span> away from FREE SHIPPING!
                  </p>
                  <div className="h-1 w-full bg-gray-200">
                    <div
                      className="h-full bg-black transition-all duration-500"
                      style={{ width: `${(subtotal / 999) * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Truck size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    You've unlocked FREE SHIPPING!
                  </p>
                </div>
              )}
            </div>

            {/* Scrollable Items */}
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y divide-gray-100">
                {cartItems.map((item: CartItem) => (
                  <CartSheetItems key={item._uid || item._id} product={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Subtotal</span>
                <span className="text-lg font-bold text-gray-900 tracking-tighter">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
                Taxes and shipping calculated at checkout
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-black hover:bg-gray-900 text-white rounded-none h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl"
                >
                  Checkout Securely
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { onClose(); router.push('/cart'); }}
                  className="w-full border-gray-200 hover:border-black text-gray-900 rounded-none h-14 uppercase text-[11px] font-bold tracking-[0.2em]"
                >
                  View Bag
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
