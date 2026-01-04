'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  Package,
  AlertCircle
} from 'lucide-react';

interface TrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
  description: string;
}

interface ShipmentTrackingProps {
  waybillNumbers: string[];
  currentStatus: string;
  className?: string;
}

export const ShipmentTracking: React.FC<ShipmentTrackingProps> = ({
  waybillNumbers,
  currentStatus,
  className = ''
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openTrackingUrl = (waybill: string) => {
    window.open(`https://www.delhivery.com/track/package/${waybill}`, '_blank');
  };

  const fetchTrackingDetails = async () => {
    setLoading(true);
    try {
      // This would be an API call to fetch tracking details
      // For now, we'll show a mock response
      setTimeout(() => {
        setTrackingData({
          events: [
            { status: 'Confirmed', timestamp: new Date().toISOString(), description: 'Order confirmed and ready for pickup' },
            { status: 'Dispatched', timestamp: new Date().toISOString(), description: 'Package dispatched from warehouse' },
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-blue-600" />
          Shipment Tracking
        </h3>
        <button
          onClick={fetchTrackingDetails}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Waybill Numbers */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-700">Waybill Numbers:</h4>
        {waybillNumbers.map((waybill, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-gray-500 mr-2" />
              <span className="font-mono text-sm">{waybill}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(waybill)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Copy waybill number"
              >
                {copied === waybill ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => openTrackingUrl(waybill)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Track on Delhivery"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status:</h4>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            currentStatus === 'Delivered' ? 'bg-green-500' :
            currentStatus === 'InTransit' || currentStatus === 'Dispatched' ? 'bg-blue-500' :
            currentStatus === 'OutForDelivery' ? 'bg-orange-500' :
            'bg-gray-400'
          }`} />
          <span className="text-sm font-medium">{currentStatus}</span>
        </div>
      </div>

      {/* Tracking Timeline */}
      {trackingData?.events && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tracking History:</h4>
          <div className="space-y-3">
            {trackingData.events.map((event: TrackingEvent, index: number) => (
              <div key={index} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{event.status}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track External Link */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => openTrackingUrl(waybillNumbers[0])}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Track on Delhivery Website
        </button>
      </div>
    </div>
  );
};
