import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, CheckCircle2, XCircle, AlertCircle, IndianRupee } from 'lucide-react';
import { useDelivery } from '@/hooks/use-delivery';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeliveryCheckProps {
  productWeight?: number;
  productPrice?: number;
}

type DeliveryOption = 'standard' | 'express' | 'cod-standard' | 'cod-express';

export function DeliveryCheck({ 
  productWeight = 1000,
  productPrice = 0
}: DeliveryCheckProps) {
  const [pincode, setPincode] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('standard');
  const { checkServiceability, isCheckingServiceability, serviceability } = useDelivery();
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    try {
      setError(null);

      if (!pincode || pincode.length !== 6) {
        setError('Please enter a valid 6-digit pincode');
        return;
      }

      const isExpress = deliveryOption.includes('express');
      const isCod = deliveryOption.includes('cod');

      console.log('Checking delivery for pincode:', pincode, 'weight:', productWeight);
      const result = await checkServiceability(pincode, productWeight, isExpress, isCod);
      console.log('Serviceability result:', result);

      if (result.error) {
        console.error('Serviceability check error:', result.error);
        if (result.error.response?.status === 401) {
          toast.error('Authentication error. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Error in handleCheck:', err);
      setError('Failed to check delivery availability. Please try again.');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleOptionChange = async (value: DeliveryOption) => {
    setDeliveryOption(value);
    if (pincode && pincode.length === 6) {
      const isExpress = value.includes('express');
      const isCod = value.includes('cod');
      await checkServiceability(pincode, productWeight, isExpress, isCod);
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="h-4 w-4" />
        <span>Check Delivery Availability</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) setPincode(value);
              setError(null);
            }}
            className="w-32"
            maxLength={6}
          />
          <Button 
            onClick={handleCheck}
            disabled={!pincode || pincode.length !== 6 || isCheckingServiceability}
            variant="outline"
            size="default"
          >
            {isCheckingServiceability ? 'Checking...' : 'Check'}
          </Button>
        </div>

        {serviceability && serviceability.serviceability && (
          <Select value={deliveryOption} onValueChange={handleOptionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select delivery option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Delivery</SelectItem>
              <SelectItem value="express">Express Delivery</SelectItem>
              <SelectItem value="cod-standard">Standard Delivery (Cash on Delivery)</SelectItem>
              <SelectItem value="cod-express">Express Delivery (Cash on Delivery)</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {(serviceability || error) && (
        <div className="flex flex-col gap-2">
          {error ? (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <span className="text-yellow-600">{error}</span>
            </div>
          ) : serviceability?.serviceability ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="text-green-600">
                  <div>{serviceability.message}</div>
                </div>
              </div>

              {serviceability.charges && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="font-medium">Delivery Charges:</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="text-muted-foreground">Base Charge:</div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>{formatPrice(serviceability.charges.freight)}</span>
                    </div>

                    {serviceability.charges.cod > 0 && (
                      <>
                        <div className="text-muted-foreground">COD Charge:</div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span>{formatPrice(serviceability.charges.cod)}</span>
                        </div>
                      </>
                    )}

                    {serviceability.charges.handling > 0 && (
                      <>
                        <div className="text-muted-foreground">Handling:</div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span>{formatPrice(serviceability.charges.handling)}</span>
                        </div>
                      </>
                    )}

                    <div className="text-muted-foreground">GST:</div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>{formatPrice(serviceability.charges.tax)}</span>
                    </div>

                    <div className="font-medium">Total:</div>
                    <div className="flex items-center gap-1 font-medium">
                      <IndianRupee className="h-3 w-3" />
                      <span>{formatPrice(serviceability.charges.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <span className="text-red-600">{serviceability?.message || 'Delivery not available'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 