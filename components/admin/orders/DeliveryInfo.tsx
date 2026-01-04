import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface DeliveryInfoProps {
  order: any;
  onRefresh?: () => void;
}

export function DeliveryInfo({ order, onRefresh }: DeliveryInfoProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeliveryAction = async (action: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          orderId: order._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process action');
      }

      toast({
        title: 'Success',
        description: `Delivery ${action} processed successfully`,
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'in_transit':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge className={getStatusColor(order.deliveryStatus)}>
              {order.deliveryStatus}
            </Badge>
          </div>

          {order.trackingNumber && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Tracking Number:</span>
              <span>{order.trackingNumber}</span>
            </div>
          )}

          {order.deliveryCharge && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Delivery Charge:</span>
              <span>₹{order.deliveryCharge}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!order.manifestId && (
              <Button
                onClick={() => handleDeliveryAction('create_manifest')}
                disabled={isLoading}
              >
                Create Shipping Label
              </Button>
            )}

            {order.trackingNumber && order.deliveryStatus !== 'cancelled' && (
              <Button
                variant="destructive"
                onClick={() => handleDeliveryAction('cancel_shipment')}
                disabled={isLoading}
              >
                Cancel Shipment
              </Button>
            )}

            {order.trackingNumber && (
              <Button
                variant="outline"
                onClick={() => handleDeliveryAction('track_shipment')}
                disabled={isLoading}
              >
                Track Shipment
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 