import { CheckCircle, Truck, AlertCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShippingInfoProps {
  shippingCost: number;
  isCalculating: boolean;
  error?: string | null;
  destinationPincode?: string;
  paymentMethod?: 'cod' | 'razorpay';
}

export default function ShippingInfo({ 
  shippingCost, 
  isCalculating, 
  error, 
  destinationPincode,
  paymentMethod = 'razorpay'
}: ShippingInfoProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isCalculating && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Calculating shipping charges...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {!isCalculating && !error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Shipping calculated successfully</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Destination:</span>
                <span className="text-sm font-medium">{destinationPincode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium">
                  {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay (Prepaid)'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shipping Charge:</span>
                <span className={`text-lg font-bold ${shippingCost === 0 ? 'text-blue-600' : 'text-green-600'}`}>
                  {shippingCost === 0 ? '₹ 0.00 (Free)' : `₹${shippingCost.toFixed(2)}`}
                  {paymentMethod === 'cod' && shippingCost > 0 && (
                    <span className="text-xs text-muted-foreground ml-1">(incl. COD charges)</span>
                  )}
                </span>
              </div>
            </div>
            
            {shippingCost > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                * Shipping charges vary based on destination, package weight, and payment method
                {paymentMethod === 'cod' && (
                  <span className="block mt-1 text-amber-600">
                    COD orders may have additional charges compared to prepaid orders
                  </span>
                )}
              </div>
            )}
            
            {shippingCost === 0 && (
              <div className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                <Star className="w-3 h-3 fill-blue-600" />
                Your order qualifies for Free Shipping!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
