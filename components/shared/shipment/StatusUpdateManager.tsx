'use client';

import React, { useState } from 'react';
import { 
  Edit,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Home,
  User
} from 'lucide-react';

interface StatusUpdateManagerProps {
  orderId: string;
  currentStatus: string;
  nextStatuses: string[];
  onStatusUpdated: (newStatus: string) => void;
  onCancel: () => void;
}

export const StatusUpdateManager: React.FC<StatusUpdateManagerProps> = ({
  orderId,
  currentStatus,
  nextStatuses,
  onStatusUpdated,
  onCancel
}) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusReason, setStatusReason] = useState<string>('');
  const [waybillNumber, setWaybillNumber] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { icon: React.ReactNode; color: string; description: string } } = {
      'Pending': { 
        icon: <Clock className="h-4 w-4" />, 
        color: 'text-yellow-600', 
        description: 'Order is pending confirmation'
      },
      'Confirmed': { 
        icon: <CheckCircle className="h-4 w-4" />, 
        color: 'text-green-600', 
        description: 'Order confirmed and ready for processing'
      },
      'Processing': { 
        icon: <Package className="h-4 w-4" />, 
        color: 'text-blue-600', 
        description: 'Order is being prepared'
      },
      'Dispatched': { 
        icon: <Truck className="h-4 w-4" />, 
        color: 'text-purple-600', 
        description: 'Package has been dispatched'
      },
      'InTransit': { 
        icon: <Truck className="h-4 w-4" />, 
        color: 'text-blue-600', 
        description: 'Package is in transit'
      },
      'OutForDelivery': { 
        icon: <Truck className="h-4 w-4" />, 
        color: 'text-orange-600', 
        description: 'Package is out for delivery'
      },
      'Delivered': { 
        icon: <Home className="h-4 w-4" />, 
        color: 'text-green-600', 
        description: 'Package has been delivered'
      },
      'Cancelled': { 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'text-red-600', 
        description: 'Order has been cancelled'
      },
      'Returned': { 
        icon: <ArrowRight className="h-4 w-4" />, 
        color: 'text-gray-600', 
        description: 'Package has been returned'
      }
    };

    return statusMap[status] || { 
      icon: <Package className="h-4 w-4" />, 
      color: 'text-gray-600', 
      description: status 
    };
  };

  const updateStatus = async () => {
    if (!selectedStatus) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shipment/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          newStatus: selectedStatus,
          waybillNumber: waybillNumber || undefined,
          trackingUrl: trackingUrl || undefined,
          reason: statusReason || undefined,
          deliveryDate: deliveryDate || undefined,
          deliveryNotes: deliveryNotes || undefined,
          updatedBy: 'admin'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        onStatusUpdated(selectedStatus);
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const needsWaybill = ['Dispatched', 'InTransit', 'OutForDelivery'].includes(selectedStatus);
  const needsDeliveryInfo = selectedStatus === 'Delivered';

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
        <div className="flex items-center">
          <div className={`${getStatusInfo(currentStatus).color} mr-2`}>
            {getStatusInfo(currentStatus).icon}
          </div>
          <span className="font-medium">{currentStatus}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{getStatusInfo(currentStatus).description}</p>
      </div>

      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Status *
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select new status</option>
          {nextStatuses.map((status) => {
            const statusInfo = getStatusInfo(status);
            return (
              <option key={status} value={status}>
                {status}
              </option>
            );
          })}
        </select>
        {selectedStatus && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-800">
              <div className="mr-2">{getStatusInfo(selectedStatus).icon}</div>
              <span className="font-medium">{selectedStatus}</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">{getStatusInfo(selectedStatus).description}</p>
          </div>
        )}
      </div>

      {/* Conditional Fields */}
      {selectedStatus && (
        <div className="space-y-4">
          {/* Waybill Number - Required for shipping statuses */}
          {needsWaybill && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waybill Number {needsWaybill ? '*' : '(optional)'}
              </label>
              <input
                type="text"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter waybill/tracking number"
                required={needsWaybill}
              />
            </div>
          )}

          {/* Tracking URL */}
          {needsWaybill && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking URL (optional)
              </label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://track.delhivery.com/..."
              />
            </div>
          )}

          {/* Delivery Information */}
          {needsDeliveryInfo && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date *
                </label>
                <input
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes (optional)
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add any delivery notes (e.g., delivered to neighbor, left at door, etc.)"
                />
              </div>
            </>
          )}

          {/* Reason/Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason/Notes (optional)
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add reason for status update or additional notes"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={updating}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={updateStatus}
          disabled={updating || !selectedStatus || (needsWaybill && !waybillNumber) || (needsDeliveryInfo && !deliveryDate)}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          {updating ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </div>
  );
};
