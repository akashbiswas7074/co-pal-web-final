"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  RefreshCcw, 
  ChevronRight,
  Package,
  Info
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CartItem from "@/components/shared/cart/CartItem";
import RecentlyViewedProducts from "@/components/shared/RecentlyViewedProducts";
import YouMightAlsoLike from "@/components/shared/YouMightAlsoLike";
import { Separator } from "@/components/ui/separator";

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const cartItems = useCartStore((state: any) => state.cart.cartItems || []);
  const isInitialized = useCartStore((state: any) => state.isInitialized);
  const initializeCart = useCartStore((state: any) => state.initializeCart);
  
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeCart();
      setIsMounting(false);
    };
    init();
  }, [initializeCart]);

  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity || item.qty || 0);
    return acc + price * quantity;
  }, 0);

  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const total = subtotal + shippingPrice;

  const handleCheckout = () => {
    if (status !== "authenticated") {
      toast.error("Please sign in to proceed with checkout");
      router.push("/auth/signin?callbackUrl=/checkout");
    } else if (cartItems.length === 0) {
      toast.error("Your bag is empty");
    } else {
      router.push("/checkout");
    }
  };

  if (!isInitialized || isMounting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Loading your bag...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-12"
        >
          {/* Header */}
          <div className="text-center sm:text-left border-b border-gray-100 pb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 uppercase tracking-tight mb-2">
              Your Shopping Bag
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in your bag
            </p>
          </div>

          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-[#fafafa] rounded-full flex items-center justify-center mb-8">
                <ShoppingBag size={40} className="text-gray-200" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Your bag is empty</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed text-sm">
                Looks like you haven't added anything to your bag yet. 
                Start exploring our handcrafted collections and find something extraordinary.
              </p>
              <Button 
                onClick={() => router.push('/shop')}
                className="bg-black hover:bg-gray-900 text-white rounded-none h-14 px-12 uppercase text-[11px] font-bold tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                Go To Shop
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-8 space-y-2">
                <div className="hidden sm:grid grid-cols-12 pb-4 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Price</div>
                </div>

                <div className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item: any) => (
                      <motion.div 
                        key={item._uid}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CartItem product={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="pt-8">
                  <Link 
                    href="/shop" 
                    className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
                  >
                    <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className="bg-[#fafafa] border border-gray-100 p-8 sm:p-10 space-y-8">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 border-b border-gray-200 pb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-gray-400">Shipping</span>
                      <span className={shippingPrice === 0 ? "text-green-600" : "text-gray-900"}>
                        {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                      </span>
                    </div>

                    {shippingPrice > 0 && (
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed italic">
                        Free shipping on orders above ₹{FREE_SHIPPING_THRESHOLD.toLocaleString('en-IN')}
                      </p>
                    )}
                    
                    <Separator className="bg-gray-200" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900">Grand Total</span>
                      <span className="text-2xl font-bold text-gray-900 tracking-tighter">
                        ₹{total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button 
                      onClick={handleCheckout}
                      className="w-full h-16 bg-black hover:bg-gray-900 text-white rounded-none uppercase text-[11px] font-bold tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all"
                    >
                      Checkout Securely
                    </Button>
                    
                    <div className="flex flex-col items-center gap-3 pt-6">
                      <div className="flex items-center gap-2 group cursor-help">
                        <ShieldCheck size={16} className="text-green-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">
                          Secure Payment Guarantee
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium text-center leading-relaxed">
                        Taxes and additional shipping charges (if any) will be calculated at the checkout stage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promotional Badges */}
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-4 p-4 bg-white border border-gray-100">
                    <Truck size={20} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Complimentary Shipping</p>
                      <p className="text-[9px] text-gray-400 font-medium">On all orders over ₹{FREE_SHIPPING_THRESHOLD}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white border border-gray-100">
                    <RefreshCcw size={20} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Easy Returns</p>
                      <p className="text-[9px] text-gray-400 font-medium">30-day hassle-free return policy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Sections */}
        <div className="mt-32 space-y-24">
          <RecentlyViewedProducts />
          
          {cartItems.length > 0 && cartItems[0].product && (
            <YouMightAlsoLike 
              productId={cartItems[0].product}
              title="Pairs Well With"
              subtitle="Curated suggestions based on your bag"
            />
          )}
        </div>
      </div>
    </div>
  );
}
