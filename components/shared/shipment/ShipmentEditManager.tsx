'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Weight, 
  Ruler, 
  MapPin,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ShipmentEditData {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingMode: 'Surface' | 'Express';
  pickupLocation: string;
}

interface ShipmentEditManagerProps {
  orderId: string;
  onEditComplete: () => void;
}

export const ShipmentEditManager: React.FC<ShipmentEditManagerProps> = ({
  orderId,
  onEditComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [editData, setEditData] = useState<ShipmentEditData>({
    weight: 500,
    dimensions: {
      length: 10,
      width: 10,
      height: 10
    },
    shippingMode: 'Surface',
    pickupLocation: 'Default Warehouse'
  });

  // Fetch current shipment details
  const fetchShipmentDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/shipment?orderId=${orderId}`);
      const result = await response.json();
      
      if (result.success && result.data.shipmentDetails) {
        const details = result.data.shipmentDetails;
        setEditData({
          weight: details.weight || 500,
          dimensions: details.dimensions || { length: 10, width: 10, height: 10 },
          shippingMode: details.shippingMode || 'Surface',
          pickupLocation: details.pickupLocation || 'Default Warehouse'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shipment details');
    } finally {
      setLoading(false);
    }
  };

  // Save shipment edits
  const saveShipmentEdits = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/shipment/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          ...editData
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Shipment details updated successfully');
        setTimeout(() => {
          onEditComplete();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update shipment details');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchShipmentDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading shipment details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="inline h-4 w-4 mr-1" />
            Shipping Mode
          </label>
          <select
            value={editData.shippingMode}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              shippingMode: e.target.value as 'Surface' | 'Express'
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Surface">Surface</option>
            <option value="Express">Express</option>
          </select>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Weight className="inline h-4 w-4 mr-1" />
            Weight (grams)
          </label>
          <input
            type="number"
            value={editData.weight}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              weight: Number(e.target.value)
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>

        {/* Dimensions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Ruler className="inline h-4 w-4 mr-1" />
            Dimensions (cm)
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Length</label>
              <input
                type="number"
                value={editData.dimensions.length}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  dimensions: {
                    ...prev.dimensions,
                    length: Number(e.target.value)
                  }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input
                type="number"
                value={editData.dimensions.width}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  dimensions: {
                    ...prev.dimensions,
                    width: Number(e.target.value)
                  }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input
                type="number"
                value={editData.dimensions.height}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  dimensions: {
                    ...prev.dimensions,
                    height: Number(e.target.value)
                  }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Pickup Location
          </label>
          <input
            type="text"
            value={editData.pickupLocation}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              pickupLocation: e.target.value
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter pickup location"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          onClick={onEditComplete}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={saveShipmentEdits}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
