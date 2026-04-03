import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateDelhiveryShipping } from '@/lib/utils/shipping';
import { calculateChargeableWeight } from '@/lib/utils/shippingCalculator';

interface CheckoutSummaryProps {
  cart: {
    items: any[];
    total: number;
    totalWeight?: number;
  };
  shippingAddress: {
    pincode: string;
  };
}

export function CheckoutSummary({ cart, shippingAddress }: CheckoutSummaryProps) {
  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean>(true);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState<boolean>(false);

  useEffect(() => {
    const calculateDeliveryCharge = async () => {
      if (!shippingAddress?.pincode) {
        setDeliveryCharge(0);
        return;
      }

      // If no items, charge is 0
      if (!cart?.items?.length) {
        setDeliveryCharge(0);
        return;
      }

      setIsCalculatingShipping(true);
      try {
        let totalWeight = 0;

        // Calculate volumetric weight if items have dimensions
        // We use the greater of actual weight vs volumetric weight for each item
        if (cart?.items?.length) {
          const weightInKg = cart.items.reduce((acc: number, item: any) => {
            let itemChargeableWeight = 0;

            if (item.shippingDimensions) {
              itemChargeableWeight = calculateChargeableWeight(item.shippingDimensions);
            } else {
              // Fallback: use item.weight (if available in kg) or default 0.5kg
              // Assuming item.weight is in kg if present (standard for this app based on schema)
              itemChargeableWeight = item.weight || 0.5;
            }

            return acc + (itemChargeableWeight * (item.quantity || 1));
          }, 0);

          // Convert kg to grams for Delhivery API which expects grams
          totalWeight = Math.round(weightInKg * 1000);
        } else {
          // Fallback if no items array (legacy support)
          totalWeight = cart.totalWeight || 1000;
        }

        console.log(`[CheckoutSummary] Calculated total weight: ${totalWeight}g`);

        const result = await calculateDelhiveryShipping(
          shippingAddress.pincode,
          totalWeight,
          'Pre-paid' // Default payment mode
        );

        if (result.error) {
          setDeliveryCharge(0);
          setIsDeliveryAvailable(false);
        } else {
          setDeliveryCharge(result.cost);
          setIsDeliveryAvailable(true);
        }
      } catch (error) {
        console.error('Failed to calculate delivery charge:', error);
        setIsDeliveryAvailable(false);
        setDeliveryCharge(0);
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    calculateDeliveryCharge();
  }, [shippingAddress?.pincode, cart?.items, cart?.total, cart?.totalWeight]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span>Delivery Charge:</span>
        {isCalculatingShipping ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <span>
            {isDeliveryAvailable
              ? deliveryCharge
                ? `₹${deliveryCharge}`
                : 'Calculating...'
              : 'Not available'}
          </span>
        )}
      </div>

      {!isDeliveryAvailable && (
        <div className="text-sm text-red-500">
          Delivery is not available to this pincode
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between font-medium">
          <span>Total:</span>
          <span>₹{((cart?.total || 0) + (deliveryCharge || 0)).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}