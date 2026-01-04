'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  Weight, 
  Ruler, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Send,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Edit,
  Settings,
  Eye,
  Calendar,
  User,
  Phone,
  CreditCard,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { ShipmentEditManager } from './ShipmentEditManager';
import { ShipmentTracking } from './ShipmentTracking';
import { ShipmentDetails } from './ShipmentDetails';
import { StatusUpdateManager } from './StatusUpdateManager';

interface ShipmentDetailsType {
  waybillNumbers: string[];
  pickupLocation: string;
  shippingMode: 'Surface' | 'Express';
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  delhiveryResponse?: any;
}

interface ShipmentData {
  orderId: string;
  status: string;
  shipmentCreated: boolean;
  shipmentDetails?: ShipmentDetailsType;
  canCreateShipment: boolean;
  nextStatuses?: string[];
  canUpdateStatus?: boolean;
  orderDetails?: any;
}

interface ShipmentCreateData {
  shippingMode: 'Surface' | 'Express';
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  pickupLocation: string;
}

interface ShipmentManagerProps {
  orderId: string;
  onShipmentCreated?: (data: any) => void;
  className?: string;
  showOrderDetails?: boolean;
  showTracking?: boolean;
  mode?: 'admin' | 'vendor' | 'customer';
}

const ShipmentManager: React.FC<ShipmentManagerProps> = ({
  orderId,
  onShipmentCreated,
  className = '',
  showOrderDetails = true,
  showTracking = true,
  mode = 'admin'
}) => {
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'tracking' | 'create'>('overview');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [createData, setCreateData] = useState<ShipmentCreateData>({
    shippingMode: 'Surface',
    weight: 500,
    dimensions: {
      length: 10,
      width: 10,
      height: 10
    },
    pickupLocation: 'Default Warehouse'
  });

  // Fetch shipment data and order details
  const fetchShipmentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/shipment?orderId=${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        setShipmentData(result.data);
        
        // Fetch order details if needed
        if (showOrderDetails) {
          try {
            const orderResponse = await fetch(`/api/orders/${orderId}`);
            const orderResult = await orderResponse.json();
            
            if (orderResult.success) {
              setShipmentData(prev => ({
                ...prev!,
                orderDetails: orderResult.data
              }));
            }
          } catch (orderErr) {
            console.warn('Failed to fetch order details:', orderErr);
          }
        }
        
        // Fetch available status updates
        const statusResponse = await fetch(`/api/shipment/status?orderId=${orderId}`);
        const statusResult = await statusResponse.json();
        
        if (statusResult.success) {
          setShipmentData(prev => ({
            ...prev!,
            nextStatuses: statusResult.data.nextStatuses,
            canUpdateStatus: statusResult.data.canUpdateStatus
          }));
        }
      } else {
        setError(result.error || 'Failed to fetch shipment data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create shipment
  const createShipment = async () => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          ...createData
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShipmentData(prev => ({
          ...prev!,
          shipmentCreated: true,
          shipmentDetails: result.data.delhiveryResponse,
          canCreateShipment: false,
          status: 'Dispatched'
        }));
        setShowCreateModal(false);
        setActiveTab('overview');
        
        if (onShipmentCreated) {
          onShipmentCreated(result.data);
        }
        
        // Refresh data
        await fetchShipmentData();
      } else {
        setError(result.error || 'Failed to create shipment');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setCreating(false);
    }
  };

  // Handle status update
  const handleStatusUpdated = (newStatus: string) => {
    setShipmentData(prev => ({
      ...prev!,
      status: newStatus
    }));
    setShowStatusModal(false);
    fetchShipmentData(); // Refresh to get latest data
  };

  // Handle shipment edit completion
  const handleShipmentEdited = () => {
    setShowEditModal(false);
    fetchShipmentData(); // Refresh to get latest data
  };

  // Check if shipment can be edited
  const canEditShipment = () => {
    if (!shipmentData?.shipmentCreated || !shipmentData?.status) return false;
    
    const editableStatuses = [
      'Confirmed',
      'PickedUp', 
      'Dispatched',
      'InTransit',
      'OutForDelivery'
    ];
    
    return editableStatuses.includes(shipmentData.status);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Dispatched': return 'bg-purple-100 text-purple-800';
      case 'InTransit': return 'bg-blue-100 text-blue-800';
      case 'OutForDelivery': return 'bg-orange-100 text-orange-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchShipmentData();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading shipment data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={fetchShipmentData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!shipmentData) {
    return (
      <div className={`text-gray-500 text-center p-4 ${className}`}>
        No shipment data available
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Shipment Management</h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(shipmentData.status)}`}>
              {shipmentData.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              shipmentData.shipmentCreated 
                ? 'bg-green-100 text-green-800' 
                : shipmentData.canCreateShipment 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {shipmentData.shipmentCreated ? 'Shipped' : shipmentData.canCreateShipment ? 'Ready to Ship' : 'Not Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          {showOrderDetails && shipmentData.orderDetails && (
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'details' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Order Details
            </button>
          )}
          {showTracking && shipmentData.shipmentCreated && shipmentData.shipmentDetails && (
            <button
              onClick={() => setActiveTab('tracking')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'tracking' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Tracking
            </button>
          )}
          {!shipmentData.shipmentCreated && shipmentData.canCreateShipment && mode === 'admin' && (
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'create' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Create Shipment
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Shipment Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(shipmentData.status)}`}>
                  {shipmentData.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Package className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Shipment Status</span>
                </div>
                <span className="text-sm">
                  {shipmentData.shipmentCreated ? 'Created' : 'Not Created'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Created Date</span>
                </div>
                <span className="text-sm">
                  {shipmentData.shipmentDetails?.createdAt 
                    ? new Date(shipmentData.shipmentDetails.createdAt).toLocaleDateString()
                    : 'Not available'
                  }
                </span>
              </div>
            </div>

            {/* Waybill Numbers */}
            {shipmentData.shipmentCreated && shipmentData.shipmentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Shipment Created Successfully</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Waybill Numbers:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {shipmentData.shipmentDetails.waybillNumbers.map((waybill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-mono"
                        >
                          {waybill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Shipping Mode:</span>
                      <p className="text-sm text-gray-600">{shipmentData.shipmentDetails.shippingMode}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Pickup Location:</span>
                      <p className="text-sm text-gray-600">{shipmentData.shipmentDetails.pickupLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Track Shipment */}
              {shipmentData.shipmentCreated && shipmentData.shipmentDetails && (
                <button
                  onClick={() => {
                    const waybill = shipmentData.shipmentDetails?.waybillNumbers[0];
                    if (waybill) {
                      window.open(`https://www.delhivery.com/track/package/${waybill}`, '_blank');
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track Shipment
                </button>
              )}
              
              {/* Edit Shipment */}
              {canEditShipment() && mode === 'admin' && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Shipment
                </button>
              )}
              
              {/* Update Status */}
              {shipmentData.canUpdateStatus && shipmentData.nextStatuses && shipmentData.nextStatuses.length > 0 && mode === 'admin' && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </button>
              )}

              {/* Create Shipment */}
              {shipmentData.canCreateShipment && !shipmentData.shipmentCreated && mode === 'admin' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Create Shipment
                </button>
              )}
            </div>

            {/* Status Messages */}
            {shipmentData.canCreateShipment && !shipmentData.shipmentCreated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Ready for Shipment</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Order is ready to be shipped. {mode === 'admin' ? 'Create a shipment to proceed.' : 'Waiting for admin to create shipment.'}
                </p>
              </div>
            )}

            {!shipmentData.canCreateShipment && !shipmentData.shipmentCreated && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Not Ready for Shipment</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Order is not yet ready for shipment. Please ensure the order status is "Confirmed".
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Details Tab */}
        {activeTab === 'details' && shipmentData.orderDetails && (
          <ShipmentDetails 
            orderDetails={shipmentData.orderDetails} 
          />
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && shipmentData.shipmentCreated && shipmentData.shipmentDetails && (
          <ShipmentTracking 
            waybillNumbers={shipmentData.shipmentDetails.waybillNumbers}
            currentStatus={shipmentData.status}
          />
        )}

        {/* Create Shipment Tab */}
        {activeTab === 'create' && shipmentData.canCreateShipment && !shipmentData.shipmentCreated && mode === 'admin' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Create New Shipment</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Mode
                </label>
                <select
                  value={createData.shippingMode}
                  onChange={(e) => setCreateData(prev => ({
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
                  Weight (grams)
                </label>
                <input
                  type="number"
                  value={createData.weight}
                  onChange={(e) => setCreateData(prev => ({
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
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Length</label>
                    <input
                      type="number"
                      value={createData.dimensions.length}
                      onChange={(e) => setCreateData(prev => ({
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
                      value={createData.dimensions.width}
                      onChange={(e) => setCreateData(prev => ({
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
                      value={createData.dimensions.height}
                      onChange={(e) => setCreateData(prev => ({
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
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={createData.pickupLocation}
                  onChange={(e) => setCreateData(prev => ({
                    ...prev,
                    pickupLocation: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter pickup location"
                />
              </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-end">
              <button
                onClick={createShipment}
                disabled={creating}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {creating ? 'Creating...' : 'Create Shipment'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Status Update Modal */}
      {showStatusModal && shipmentData.nextStatuses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Update Shipment Status</h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <StatusUpdateManager
                orderId={orderId}
                currentStatus={shipmentData.status}
                nextStatuses={shipmentData.nextStatuses}
                onStatusUpdated={handleStatusUpdated}
                onCancel={() => setShowStatusModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Shipment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Shipment Details</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ShipmentEditManager
                orderId={orderId}
                onEditComplete={handleShipmentEdited}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create Shipment</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Mode
                    </label>
                    <select
                      value={createData.shippingMode}
                      onChange={(e) => setCreateData(prev => ({
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
                      Weight (grams)
                    </label>
                    <input
                      type="number"
                      value={createData.weight}
                      onChange={(e) => setCreateData(prev => ({
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
                      Dimensions (cm)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Length</label>
                        <input
                          type="number"
                          value={createData.dimensions.length}
                          onChange={(e) => setCreateData(prev => ({
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
                          value={createData.dimensions.width}
                          onChange={(e) => setCreateData(prev => ({
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
                          value={createData.dimensions.height}
                          onChange={(e) => setCreateData(prev => ({
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
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={createData.pickupLocation}
                      onChange={(e) => setCreateData(prev => ({
                        ...prev,
                        pickupLocation: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pickup location"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createShipment}
                    disabled={creating}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {creating ? 'Creating...' : 'Create Shipment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManager;
