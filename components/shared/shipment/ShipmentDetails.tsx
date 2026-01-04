'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Weight, 
  Ruler, 
  MapPin,
  CreditCard,
  User,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface OrderDetails {
  _id: string;
  orderItems: any[];
  shippingAddress: any;
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
}

interface ShipmentDetailsProps {
  orderDetails: OrderDetails;
  className?: string;
}

export const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({
  orderDetails,
  className = ''
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateWeight = () => {
    // Calculate estimated weight based on items
    const baseWeight = orderDetails.orderItems.length * 200; // 200g per item
    return `${baseWeight}g (estimated)`;
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cod':
        return { label: 'Cash on Delivery', color: 'text-orange-600' };
      case 'online':
      case 'prepaid':
        return { label: 'Prepaid', color: 'text-green-600' };
      default:
        return { label: method, color: 'text-gray-600' };
    }
  };

  const paymentDisplay = getPaymentMethodDisplay(orderDetails.paymentMethod);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Order Details
          </h3>
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            {showFullDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show Details
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-1" />
              Order Information
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-mono">{orderDetails._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  orderDetails.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                  orderDetails.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {orderDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Date:</span>
                <span className="text-sm">{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="text-sm">{orderDetails.orderItems.length} item(s)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Payment Information
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Method:</span>
                <span className={`text-sm font-medium ${paymentDisplay.color}`}>
                  {paymentDisplay.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-sm font-medium">{formatCurrency(orderDetails.total)}</span>
              </div>
              {orderDetails.paymentMethod === 'cod' && (
                <div className="flex items-center mt-2 p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-sm text-orange-800">COD Amount: {formatCurrency(orderDetails.total)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Shipping Address
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">
                  {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">{orderDetails.shippingAddress.phoneNumber}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                <div className="text-sm">
                  <div>{orderDetails.shippingAddress.address1}</div>
                  {orderDetails.shippingAddress.address2 && (
                    <div>{orderDetails.shippingAddress.address2}</div>
                  )}
                  <div>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.zipCode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Details */}
        {showFullDetails && (
          <div className="space-y-6">
            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
              <div className="space-y-3">
                {orderDetails.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          Qty: {item.qty || item.quantity || 1}
                          {item.size && ` • Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color.color || item.color}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Specifications */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Weight className="h-4 w-4 mr-1" />
                Package Specifications
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Weight</div>
                  <div className="text-sm font-medium">{calculateWeight()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Dimensions</div>
                  <div className="text-sm font-medium">10 x 10 x 10 cm</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Fragile</div>
                  <div className="text-sm font-medium">No</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Insurance</div>
                  <div className="text-sm font-medium">Standard</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
