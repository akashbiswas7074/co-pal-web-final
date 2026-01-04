"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Table, Ruler, Lightbulb } from "lucide-react";

interface SizeGuideTabContentProps {
  className?: string;
  categoryName?: string;
  categoryId?: string;
}

interface SizeChartEntry {
  size: string;
  measurements: { [key: string]: string };
  order: number;
}

interface SizeChart {
  categoryName: string;
  categoryId?: string;
  description?: string;
  measurements: SizeChartEntry[];
  measurementUnits: string;
  isActive: boolean;
  order: number;
}

interface SizeGuideSection {
  title: string;
  content: string;
  icon: string;
  isActive: boolean;
  order: number;
}

interface SizeGuideConfig {
  title: string;
  subtitle?: string;
  heroIcon?: string;
  sections: SizeGuideSection[];
  sizeCharts: SizeChart[];
  howToMeasure?: {
    enabled: boolean;
    content: string;
    images?: string[];
  };
  fitTips?: {
    enabled: boolean;
    content: string;
  };
  customCSS?: string;
}

export default function SizeGuideTabContent({ 
  className = "", 
  categoryName,
  categoryId 
}: SizeGuideTabContentProps) {
  const [config, setConfig] = useState<SizeGuideConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSizeGuide = async () => {
      try {
        setLoading(true);
        let url = "/api/size-guide";
        
        if (categoryName) {
          url += `?category=${encodeURIComponent(categoryName)}`;
        } else if (categoryId) {
          url += `?categoryId=${encodeURIComponent(categoryId)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.config) {
          setConfig(data.config);
        } else {
          setError(data.message || "Failed to load size guide");
        }
      } catch (err) {
        setError("Failed to load size guide");
        console.error("Error fetching size guide:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSizeGuide();
  }, [categoryName, categoryId]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Size Guide</h3>
          <p className="text-gray-600">Loading size guide...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Size Guide</h3>
          <p className="text-gray-600 mb-4">{error || "Size guide information is currently unavailable"}</p>
          <a 
            href="/size-guide" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full Size Guide <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Custom CSS injection */}
      {config.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: config.customCSS }} />
      )}

      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200">
        <div className="text-3xl mb-2">{config.heroIcon || "📐"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {categoryName ? `${categoryName} Size Guide` : config.title}
        </h2>
        {config.subtitle && (
          <p className="text-gray-600">{config.subtitle}</p>
        )}
        {categoryName && (
          <p className="text-sm text-blue-600 mt-1">
            Specific size guide for {categoryName} products
          </p>
        )}
      </div>

      {/* Content Sections */}
      {config.sections
        .filter(section => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">{section.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}

      {/* Size Charts */}
      {config.sizeCharts && config.sizeCharts.length > 0 && (
        config.sizeCharts
          .filter(chart => chart.isActive)
          .sort((a, b) => a.order - b.order)
          .map((chart, chartIndex) => (
            <div key={chartIndex} className="space-y-4">
              <div className="flex items-center gap-3">
                <Table className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {chart.categoryName} Size Chart
                </h3>
              </div>
              
              {chart.description && (
                <p className="text-sm text-gray-600">{chart.description}</p>
              )}
              
              <div className="text-xs text-gray-500">
                Measurements in {chart.measurementUnits}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-900">
                        Size
                      </th>
                      {chart.measurements.length > 0 && 
                        Object.keys(chart.measurements[0].measurements).map((label, index) => (
                          <th key={index} className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-900">
                            {label}
                          </th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {chart.measurements
                      .sort((a, b) => a.order - b.order)
                      .slice(0, 5) // Show only first 5 sizes in tab content
                      .map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">
                            {entry.size}
                          </td>
                          {Object.keys(entry.measurements).map((label, labelIndex) => (
                            <td key={labelIndex} className="border border-gray-200 px-3 py-2 text-gray-700">
                              {entry.measurements[label] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {chart.measurements.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  Showing first 5 sizes. <a href="/size-guide" className="text-blue-600 hover:underline">View complete chart</a>
                </p>
              )}
            </div>
          ))
      )}

      {/* How to Measure */}
      {config.howToMeasure?.enabled && config.howToMeasure && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">How to Measure</h3>
          </div>
          
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: config.howToMeasure.content }}
          />
        </div>
      )}

      {/* Fit Tips */}
      {config.fitTips?.enabled && config.fitTips && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fit Tips</h3>
          </div>
          
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: config.fitTips.content }}
          />
        </div>
      )}

      {/* View Full Guide Link */}
      <div className="pt-4 border-t border-gray-200">
        <a 
          href={`/size-guide${categoryName ? `?category=${encodeURIComponent(categoryName)}` : ''}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          View Complete Size Guide <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}