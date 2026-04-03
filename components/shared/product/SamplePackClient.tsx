"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";

import { motion } from "framer-motion";

interface Sample {
  _id: string;
  name: string;
  price: number;
  status: "available" | "unavailable";
  image?: string;
  productId?: string;
}

interface SampleSettings {
  bannerImage: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
}

interface SamplePackClientProps {
  samples: Sample[];
  settings: SampleSettings | null;
}

export default function SamplePackClient({ samples, settings }: SamplePackClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { addItem } = useCart();

  const activeSettings = settings || {
    bannerImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1920",
    title: "Sample Packs",
    subtitle: "Curate your own sample pack.",
    titleColor: "#ffffff",
    subtitleColor: "#ea580c"
  };

  // Group samples by productId
  const groupedSamples = useMemo(() => {
    const groups: Record<string, {
      name: string;
      image: string;
      productId: string;
      variants: Sample[];
    }> = {};

    samples.forEach(sample => {
      const pid = sample.productId || sample._id;
      if (!groups[pid]) {
        // Find a representative name (strip - 5ml/- 10ml)
        const baseName = sample.name.replace(/\s*-\s*\d+ml$/i, "").trim();
        groups[pid] = {
          name: baseName,
          image: sample.image || "",
          productId: pid,
          variants: []
        };
      }
      groups[pid].variants.push(sample);
    });

    return Object.values(groups);
  }, [samples]);

  const toggleSample = (id: string, status: string) => {
    if (status === "unavailable") return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedIds.reduce((acc, id) => {
      const sample = samples.find((s) => s._id === id);
      return acc + (sample?.price || 0);
    }, 0);
  }, [selectedIds, samples]);

  const handleAddToCart = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one sample");
      return;
    }

    selectedIds.forEach((id) => {
      const sample = samples.find((s) => s._id === id);
      if (sample) {
        addItem({
          _id: sample._id,
          _uid: `sample_${sample._id}`,
          name: sample.name,
          price: sample.price,
          quantity: 1,
          image: (sample.image?.startsWith('http') ? sample.image : null) || activeSettings.bannerImage || "/placeholder-sample.png",
          availableQty: 100,
          isSample: true,
          sample: sample._id,
          product: sample.productId, // required by checkout for product lookup
        });
      }
    });

    toast.success("Samples added to cart");
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Width */}
      <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden">
        <Image
          src={activeSettings.bannerImage || "/sample-banner-bg.jpg"}
          alt={activeSettings.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-end pt-24 sm:pt-32 pb-12 md:pb-20 text-white gap-8">
          <div className="flex flex-col text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: activeSettings.titleColor }}
              className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none"
            >
              {activeSettings.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ color: activeSettings.subtitleColor }}
              className="text-2xl md:text-4xl font-bold uppercase mt-2"
            >
              {activeSettings.subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupedSamples.map((group) => (
            <div
              key={group.productId}
              className="border-2 rounded-xl overflow-hidden flex flex-col transition-all duration-300 shadow-sm hover:shadow-md bg-white border-gray-100 hover:border-gray-300"
            >
              {/* Product Image */}
              <div className="relative w-full h-40 bg-gray-100">
                {group.image ? (
                  <Image
                    src={group.image}
                    alt={group.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                    🧴
                  </div>
                )}
              </div>
              {/* Sample Info */}
              <div className="p-4 flex flex-col gap-3">
                <span className="font-bold text-base uppercase tracking-tight line-clamp-2">
                  {group.name}
                </span>
                
                <div className="flex flex-col gap-2">
                  {group.variants.map((variant) => (
                    <div 
                      key={variant._id}
                      onClick={() => toggleSample(variant._id, variant.status)}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedIds.includes(variant._id) 
                          ? "bg-slate-100 border-black" 
                          : "bg-gray-50 border-gray-200 hover:border-gray-400"
                      } ${variant.status === "unavailable" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedIds.includes(variant._id)}
                          disabled={variant.status === "unavailable"}
                          onCheckedChange={() => toggleSample(variant._id, variant.status)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-bold uppercase">{variant.name.split('-').pop()?.trim()}</span>
                      </div>
                      <span className="text-sm font-semibold">Rs. {variant.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-gray-100 pt-10 sticky bottom-0 bg-white/80 backdrop-blur-md p-6 rounded-t-3xl shadow-lg md:relative md:bg-transparent md:backdrop-blur-none md:shadow-none md:rounded-none">
          <div className="flex flex-col md:flex-row gap-4 md:gap-12 text-xl md:text-2xl font-black uppercase">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Total units:</span>
              <span>{selectedIds.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Total price:</span>
              <span className="text-orange-600">Rs. {totalPrice}</span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
            <Button
              onClick={handleAddToCart}
              className="w-full md:w-80 h-16 text-xl font-black uppercase bg-black hover:bg-gray-800 text-white rounded-none tracking-widest transition-transform active:scale-95"
            >
              Add to Cart
            </Button>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Inclusive of all taxes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
