import { useState } from 'react';

interface DeliveryCharges {
  total: number;
  freight: number;
  cod: number;
  handling: number;
  tax: number;
  delivery_charge: number;
}

interface DeliveryServiceability {
  serviceability: boolean;
  message?: string;
  error?: any;
  delivery_codes?: string[];
  charges?: DeliveryCharges;
}

interface FreightEstimate {
  total: number;
  base_freight: number;
  fuel_surcharge?: number;
  cod_charges?: number;
  rov_charges?: number;
  other_charges?: number;
  gst?: number;
  error?: string;
}

export function useDelivery() {
  const [isCheckingServiceability, setIsCheckingServiceability] = useState(false);
  const [isCalculatingFreight, setIsCalculatingFreight] = useState(false);
  const [serviceability, setServiceability] = useState<DeliveryServiceability | null>(null);
  const [freightEstimate, setFreightEstimate] = useState<FreightEstimate | null>(null);

  const checkServiceability = async (
    pincode: string, 
    weight: number,
    isExpress: boolean = false,
    isCod: boolean = false
  ): Promise<DeliveryServiceability> => {
    setIsCheckingServiceability(true);
    setServiceability(null);

    try {
      const params = new URLSearchParams({
        pincode,
        weight: weight.toString(),
        express: isExpress.toString(),
        cod: isCod.toString()
      });

      const response = await fetch(`/api/delivery/check-serviceability?${params}`);
      const data = await response.json();

      setServiceability(data);
      return data;
    } catch (error: any) {
      console.error('Failed to check serviceability:', error);
      const errorResponse = {
        serviceability: false,
        message: error.message || 'Failed to check delivery availability',
        error: error
      };
      setServiceability(errorResponse);
      return errorResponse;
    } finally {
      setIsCheckingServiceability(false);
    }
  };

  const getFreightEstimate = async (params: {
    dimensions: Array<{
      length_cm: number;
      width_cm: number;
      height_cm: number;
      box_count: number;
    }>;
    weight_g: number;
    source_pin: string;
    consignee_pin: string;
    payment_mode: 'prepaid' | 'cod';
    inv_amount: number;
  }) => {
    try {
      setIsCalculatingFreight(true);
      console.log('Making freight estimate request:', params);

      const response = await fetch('/api/delivery/freight-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      console.log('Freight estimate response:', data);

      if (!response.ok) {
        console.error('Freight estimate error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || 'Failed to get freight estimate');
      }

      const estimate: FreightEstimate = {
        total: data.total || 0,
        base_freight: data.base_freight || 0,
        fuel_surcharge: data.fuel_surcharge,
        cod_charges: data.cod_charges,
        rov_charges: data.rov_charges,
        other_charges: data.other_charges,
        gst: data.gst
      };

      setFreightEstimate(estimate);
      return estimate;
    } catch (error: any) {
      console.error('Failed to get freight estimate:', error);
      throw new Error(error.message || 'Failed to calculate delivery charges');
    } finally {
      setIsCalculatingFreight(false);
    }
  };

  return {
    isCheckingServiceability,
    isCalculatingFreight,
    serviceability,
    freightEstimate,
    checkServiceability,
    getFreightEstimate,
  };
} 