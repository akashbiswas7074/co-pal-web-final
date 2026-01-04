"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, SearchIcon, Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";

const TrackOrderPage = () => {  const router = useRouter();

  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [searchedOnce, setSearchedOnce] = useState<boolean>(false);
  
  // Check for order ID in URL query params on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryOrderId = queryParams.get('id');
    if (queryOrderId) {
      setOrderId(queryOrderId);
      // Auto-fetch the order details when ID is provided in URL
      fetchOrderDetails(queryOrderId);
    }
  }, []);
  const fetchOrderDetails = async (id: string) => {
    setLoading(true);
    setError("");
    setOrderData(null);
    
    try {
      // Use the track parameter to indicate this is a public tracking request
      const response = await fetch(`/api/orders/${id}?track=true`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderData(data.order);
        setSearchedOnce(true);
      } else {
        setError(data.message || "Could not find your order. Please check the order ID and try again.");
      }
    } catch (err: any) {
      setError(
        "An error occurred while looking up your order. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim() || orderId.length < 24 || orderId.length > 24) {
      setError("Please enter a valid order ID (24 characters)");
      return;
    }

    fetchOrderDetails(orderId);
  };  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    
    switch(lowerStatus) {
      case "processing": 
        return "text-gray-700 bg-gray-50 border border-gray-200";
      case "confirmed": 
        return "text-gray-700 bg-gray-50 border border-gray-200";
      case "dispatched":
      case "shipped": 
        return "text-gray-700 bg-gray-50 border border-gray-200";
      case "delivered":
      case "completed": 
        return "text-green-700 bg-green-50 border border-green-200";
      case "cancelled": 
        return "text-red-700 bg-red-50 border border-red-200";
      default: 
        return "text-gray-700 bg-gray-50 border border-gray-200";
    }
  };
  
  return (
    <div className="min-h-[85vh] bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        {/* Search Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="bg-white h-10"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="bg-[#2B2B2B] hover:bg-gray-800 text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Track Order
                </span>
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            You can find your order ID in the confirmation email we sent you.
          </p>
        </div>
        
        {/* Order Details */}
        {searchedOnce && orderData && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order #{orderData._id.toString()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(orderData.createdAt)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
                      {orderData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Timeline */}
            <div className="p-6">
              <h3 className="font-medium mb-4">Tracking Progress</h3>
              
              <div className="relative">
                {(() => {
                  const lowerStatus = orderData.status?.toLowerCase() || '';
                  const steps = [
                    { 
                      label: 'Order Placed', 
                      date: formatDate(orderData.createdAt),
                      completed: true, 
                      icon: <Clock className="h-5 w-5" />
                    },
                    { 
                      label: 'Confirmed', 
                      date: lowerStatus === 'confirmed' || lowerStatus === 'shipped' || lowerStatus === 'dispatched' || lowerStatus === 'delivered' || lowerStatus === 'completed' ? 'Processing completed' : 'Awaiting confirmation', 
                      completed: lowerStatus === 'confirmed' || lowerStatus === 'shipped' || lowerStatus === 'dispatched' || lowerStatus === 'delivered' || lowerStatus === 'completed', 
                      icon: <PackageCheck className="h-5 w-5" />
                    },
                    { 
                      label: 'Shipped', 
                      date: lowerStatus === 'shipped' || lowerStatus === 'dispatched' || lowerStatus === 'delivered' || lowerStatus === 'completed' ? 'On the way to you' : 'Not dispatched yet', 
                      completed: lowerStatus === 'shipped' || lowerStatus === 'dispatched' || lowerStatus === 'delivered' || lowerStatus === 'completed', 
                      icon: <Truck className="h-5 w-5" /> 
                    },
                    { 
                      label: 'Delivered', 
                      date: lowerStatus === 'delivered' || lowerStatus === 'completed' ? 'Package delivered' : 'Awaiting delivery', 
                      completed: lowerStatus === 'delivered' || lowerStatus === 'completed', 
                      icon: <CheckCircle className="h-5 w-5" /> 
                    }
                  ];
                  
                  // Calculate how many steps are completed
                  const completedSteps = steps.filter(s => s.completed).length;
                  const totalSteps = steps.length;
                  const progressPercentage = (completedSteps / totalSteps) * 100;
                  
                  // Timeline line with progress - blue for progress, green for delivered
                  const lineColor = lowerStatus === 'delivered' || lowerStatus === 'completed' ? 'bg-green-300' : 'bg-blue-500';
                  
                  // If cancelled, show only one step
                  if (lowerStatus === 'cancelled') {
                    return (
                      <div className="flex items-center pl-8 relative mb-4">
                        <div className="absolute left-0 flex items-center justify-center w-7 h-7 rounded-full bg-red-100 border-2 border-red-500">
                          <XCircle className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-red-700">Order Cancelled</p>
                          <p className="text-sm text-gray-500">Your order has been cancelled</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Otherwise show all steps
                  return (
                    <>
                      {/* Timeline line with progress */}
                      <div className="absolute left-3 top-1 bottom-1 w-[2px] bg-gray-200">
                        <div 
                          className={`absolute top-0 left-0 w-full transition-all duration-500 ${lineColor}`}
                          style={{ height: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      {steps.map((step, index) => (
                        <div key={index} className={`flex items-center pl-8 relative mb-6 ${index === steps.length - 1 ? '' : ''}`}>
                          <div className={`absolute left-0 flex items-center justify-center w-7 h-7 rounded-full 
                            ${step.completed ? 
                              (step.label === 'Delivered' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border-2 border-gray-500') : 
                              'bg-gray-100 border-2 border-gray-300'}`}>
                            <div className={step.completed ? 
                              (step.label === 'Delivered' ? 'text-green-500' : 'text-gray-500') : 
                              'text-gray-400'}>
                              {step.icon}
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className={`font-medium ${step.completed ? 
                              (step.label === 'Delivered' ? 'text-green-700' : 'text-gray-700') : 
                              'text-gray-500'}`}>
                              {step.label}
                            </p>
                            <p className="text-sm text-gray-500">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
              
              <Separator className="my-6" />
              
              {/* Order Items */}
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-4">
                {(orderData.orderItems?.length > 0 ? orderData.orderItems : orderData.products || []).map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.image || (item.product?.images && item.product?.images[0]?.url) || '/placeholder-product.jpg'}
                        alt={item.name || (item.product && item.product.name) || "Product"}
                        width={64}
                        height={64}
                        className="object-cover rounded border border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name || (item.product && item.product.name)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.qty || item.quantity || 1} × ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              {/* Order Summary Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  {orderData.itemsPrice !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Price:</span>
                      <span className="font-medium">₹{orderData.itemsPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {orderData.discountAmount !== undefined && orderData.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">-₹{orderData.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {orderData.shippingPrice !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">₹{orderData.shippingPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {orderData.taxPrice !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">₹{orderData.taxPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {orderData.couponApplied && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupon Applied:</span>
                      <span className="font-medium text-gray-600">{orderData.couponApplied}</span>
                    </div>
                  )}
                  <Separator />
                  {orderData.totalAmount !== undefined && (
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-green-600">₹{orderData.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Payment Details */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">
                      {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       orderData.paymentMethod === 'razorpay' ? 'Razorpay' : 
                       orderData.paymentMethod === 'stripe' ? 'Stripe' : 
                       orderData.paymentMethod || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${orderData.isPaid ? "text-green-600" : "text-amber-600"}`}>
                      {orderData.isPaid ? "Paid" : orderData.paymentStatus || "Pending"}
                    </span>
                  </div>
                  {orderData.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid On:</span>
                      <span className="font-medium">{formatDate(orderData.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">                <Button 
                  onClick={() => router.push(`/order/${orderData._id.toString()}`)}
                  className="bg-[#2B2B2B] hover:bg-gray-800 text-white"
                >
                  View Full Order Details
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {searchedOnce && !orderData && !error && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <SearchIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No order found</h3>
              <p className="text-gray-500 mb-4">We couldn't find an order with that ID.</p>
              <Button 
                variant="outline"
                onClick={() => setSearchedOnce(false)}
                className="mt-2"
              >
                Try Another Order ID
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
