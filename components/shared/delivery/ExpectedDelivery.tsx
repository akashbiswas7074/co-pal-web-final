'use client';

import { Truck, Clock, CalendarDays, AlertCircle, CheckCircle } from 'lucide-react';
import { useExpectedTat, formatExpectedTat, formatDeliveryDate, getDeliveryTypeText, getDeliveryMessage } from '@/hooks/use-expected-tat';

interface ExpectedDeliveryProps {
  origin_pin?: string;
  destination_pin?: string;
  mot?: 'S' | 'E';
  pdt?: 'B2C' | 'B2B';
  expected_pickup_date?: string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
  showDeliveryType?: boolean;
}

export const ExpectedDelivery = ({
  origin_pin = process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || '700001',
  destination_pin,
  mot = 'S',
  pdt = 'B2C',
  expected_pickup_date,
  className = '',
  showIcon = true,
  compact = false,
  showDeliveryType = true
}: ExpectedDeliveryProps) => {
  const { data, loading, error } = useExpectedTat({
    origin_pin,
    destination_pin,
    mot,
    pdt,
    expected_pickup_date,
    enabled: !!destination_pin
  });

  if (!destination_pin) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center text-gray-600 ${className}`}>
        {showIcon && <Clock className="h-4 w-4 mr-2 animate-spin" />}
        <span className="text-sm">Calculating delivery time...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`flex items-center text-red-600 ${className}`}>
        {showIcon && <AlertCircle className="h-4 w-4 mr-2" />}
        <span className="text-sm">Unable to calculate delivery time</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formattedTat = formatExpectedTat(data.expected_tat);
  const formattedDate = data.expected_delivery_date ? formatDeliveryDate(data.expected_delivery_date) : '';
  const deliveryMessage = getDeliveryMessage(data);
  const deliveryType = getDeliveryTypeText(mot);
  const isFallback = data.fallback;

  if (compact) {
    return (
      <div className={`flex items-center ${isFallback ? 'text-amber-600' : 'text-green-600'} ${className}`}>
        {showIcon && (
          isFallback ? 
            <AlertCircle className="h-4 w-4 mr-2" /> :
            <CheckCircle className="h-4 w-4 mr-2" />
        )}
        <span className="text-sm font-medium">
          {showDeliveryType && mot === 'E' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">
              Express
            </span>
          )}
          {formattedDate ? deliveryMessage : `Expected delivery: ${formattedTat}`}
          {isFallback && <span className="text-gray-500 ml-1">(estimated)</span>}
        </span>
      </div>
    );
  }

  return (
    <div className={`${isFallback ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} border rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            {isFallback ? (
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            ) : (
              <Truck className="h-5 w-5 text-green-600 mt-0.5" />
            )}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${isFallback ? 'text-amber-800' : 'text-green-800'}`}>
              {deliveryType}
            </h4>
            {isFallback && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Estimated
              </span>
            )}
            {!isFallback && mot === 'E' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Express
              </span>
            )}
          </div>
          <p className={`text-sm ${isFallback ? 'text-amber-700' : 'text-green-700'} mb-2`}>
            {formattedDate ? deliveryMessage : `Expected delivery: ${formattedTat}`}
          </p>
          {formattedDate && (
            <div className={`flex items-center gap-1 text-xs ${isFallback ? 'text-amber-600' : 'text-green-600'}`}>
              <CalendarDays className="h-3 w-3" />
              <span>Expected by {formattedDate}</span>
            </div>
          )}
          {isFallback && error && (
            <div className="mt-2 text-xs text-amber-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simplified version for use in checkout
export const ExpectedDeliverySimple = ({
  destination_pin,
  mot = 'S',
  className = ''
}: {
  destination_pin?: string;
  mot?: 'S' | 'E';
  className?: string;
}) => {
  return (
    <ExpectedDelivery
      destination_pin={destination_pin}
      mot={mot}
      className={className}
      compact={true}
      showIcon={true}
      showDeliveryType={true}
    />
  );
};

// Version for order pages (with known pickup date)
export const ExpectedDeliveryOrder = ({
  destination_pin,
  pickup_date,
  mot = 'S',
  className = ''
}: {
  destination_pin?: string;
  pickup_date?: string;
  mot?: 'S' | 'E';
  className?: string;
}) => {
  return (
    <ExpectedDelivery
      destination_pin={destination_pin}
      expected_pickup_date={pickup_date}
      mot={mot}
      className={className}
      compact={false}
      showIcon={true}
      showDeliveryType={true}
    />
  );
};

// Express delivery version
export const ExpectedDeliveryExpress = ({
  destination_pin,
  className = ''
}: {
  destination_pin?: string;
  className?: string;
}) => {
  return (
    <ExpectedDelivery
      destination_pin={destination_pin}
      mot="E"
      className={className}
      compact={true}
      showIcon={true}
      showDeliveryType={true}
    />
  );
};
