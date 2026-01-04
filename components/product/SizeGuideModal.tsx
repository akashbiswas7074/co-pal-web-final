"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ruler, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SizeGuideModalProps {
    category: string;
    subCategory: string;
    trigger?: React.ReactNode;
}

export function SizeGuideModal({ category, subCategory, trigger }: SizeGuideModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");
    const [title, setTitle] = useState("Size Guide");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && !htmlContent) {
            fetchSizeGuide();
        }
    }, [open, category, subCategory]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const fetchSizeGuide = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/category-size-guide?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`
            );

            const data = await response.json();

            if (data.success && data.sizeGuide) {
                setHtmlContent(data.sizeGuide.htmlContent);
                setTitle(data.sizeGuide.title || "Size Guide");
            } else {
                setError(data.error || "Size guide not available for this product");
            }
        } catch (err) {
            console.error("Error fetching size guide:", err);
            setError("Failed to load size guide");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Ruler className="h-4 w-4" />
                    Size Guide
                </Button>
            )}

            {/* Full Page Overlay */}
            {open && (
                <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b shadow-sm z-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Ruler className="h-6 w-6 text-gray-700" />
                                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-6 w-6 text-gray-600" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-1">Find your perfect fit</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <span className="text-gray-600">Loading size guide...</span>
                            </div>
                        ) : error ? (
                            <Alert variant="destructive" className="max-w-2xl mx-auto">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : htmlContent ? (
                            <div
                                className="prose prose-lg max-w-none size-guide-content"
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                        ) : (
                            <Alert className="max-w-2xl mx-auto">
                                <AlertDescription>
                                    No size guide available for this product category.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
        .size-guide-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .size-guide-content th,
        .size-guide-content td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .size-guide-content th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .size-guide-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .size-guide-content h1,
        .size-guide-content h2,
        .size-guide-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .size-guide-content ul,
        .size-guide-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .size-guide-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
      `}</style>
        </>
    );
}
