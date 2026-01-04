import axios from 'axios';

// B2C API (Regular e-commerce)
const DELHIVERY_B2C_URL = 'https://track.delhivery.com';
const B2C_AUTH_TOKEN = process.env.DELHIVERY_AUTH_TOKEN;

// B2B API (LTL/Heavy Shipments)
const DELHIVERY_B2B_URL = 'https://ltl-clients-api.delhivery.com';
const B2B_USERNAME = process.env.DELHIVERY_B2B_USERNAME;
const B2B_PASSWORD = process.env.DELHIVERY_B2B_PASSWORD;

interface PincodeServiceResponse {
  serviceability: boolean;
  message?: string;
  error?: any;
  delivery_codes?: string[];
}

interface B2BFreightEstimateRequest {
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
  freight_mode: 'surface' | 'express' | 'fod';
  cheque_payment?: boolean;
  rov_insurance?: boolean;
}

interface B2CFreightEstimateRequest {
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
}

interface FreightEstimateResponse {
  total: number;
  base_freight: number;
  fuel_surcharge?: number;
  cod_charges?: number;
  rov_charges?: number;
  other_charges?: number;
  gst?: number;
  error?: string;
}

interface DeliveryResponse {
  serviceability: boolean;
  message?: string;
  error?: any;
  delivery_codes?: string[];
  charges?: {
    total: number;
    freight: number;
    cod: number;
    handling: number;
    tax: number;
    delivery_charge: number;
  };
}

let b2bAuthToken: string | null = null;
let b2bTokenExpiry: number | null = null;

export const delhiveryApi = {
  // B2B Authentication
  async getB2BAuthToken() {
    // Check if we have a valid cached token
    if (b2bAuthToken && b2bTokenExpiry && Date.now() < b2bTokenExpiry) {
      return b2bAuthToken;
    }

    if (!B2B_USERNAME || !B2B_PASSWORD) {
      throw new Error('B2B credentials not configured');
    }

    try {
      const response = await axios.post(
        `${DELHIVERY_B2B_URL}/ums/login`,
        {
          username: B2B_USERNAME,
          password: B2B_PASSWORD
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.token) {
        b2bAuthToken = response.data.token;
        // Set token expiry to 23 hours from now (to be safe)
        b2bTokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
        return b2bAuthToken;
      }

      throw new Error('Invalid response from B2B login API');
    } catch (error: any) {
      console.error('B2B Authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with B2B API');
    }
  },

  // Check delivery serviceability and get shipping charges
  async checkDeliveryAvailability(
    pincode: string, 
    weight: number,
    isExpress: boolean = false,
    isCod: boolean = false
  ): Promise<DeliveryResponse> {
    console.log('Delhivery API - Checking delivery:', { pincode, weight, isExpress, isCod });

    if (!B2C_AUTH_TOKEN) {
      console.error('Delhivery API - No auth token found');
      return {
        serviceability: false,
        message: 'Configuration error: Missing authentication token',
        error: { type: 'auth_missing' }
      };
    }

    try {
      // First check pincode serviceability
      const serviceabilityUrl = `${DELHIVERY_B2C_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`;
      console.log('Delhivery API - Checking serviceability:', serviceabilityUrl);

      const serviceabilityResponse = await axios.get(serviceabilityUrl, {
        headers: {
          'Authorization': `Token ${B2C_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: null
      });

      console.log('Delhivery API - Serviceability response:', {
        status: serviceabilityResponse.status,
        data: serviceabilityResponse.data
      });

      // Handle authentication errors
      if (serviceabilityResponse.status === 401) {
        console.error('Delhivery API - Authentication failed');
        return {
          serviceability: false,
          message: 'Authentication failed. Please verify API token.',
          error: { type: 'auth_failed', response: serviceabilityResponse.data }
        };
      }

      // Handle other errors
      if (serviceabilityResponse.status !== 200) {
        console.error('Delhivery API - Request failed:', serviceabilityResponse.status, serviceabilityResponse.data);
        return {
          serviceability: false,
          message: serviceabilityResponse.data?.message || 'Unable to check delivery availability',
          error: { type: 'api_error', status: serviceabilityResponse.status, response: serviceabilityResponse.data }
        };
      }

      const isServiceable = serviceabilityResponse.data?.delivery_codes?.length > 0;

      // If not serviceable, return early
      if (!isServiceable) {
        return {
          serviceability: false,
          message: 'Delivery not available for this pincode',
          error: { type: 'not_serviceable', response: serviceabilityResponse.data }
        };
      }

      // If serviceable, get shipping charges
      const chargesUrl = `${DELHIVERY_B2C_URL}/api/kinko/v1/invoice/charges/.json`;
      const params = {
        md: isExpress ? 'E' : 'S', // E for Express, S for Surface
        ss: 'Delivered',
        d_pin: pincode,
        o_pin: process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || '110001', // Default to Delhi if not set
        cgm: weight.toString(), // Weight in grams
        pt: isCod ? 'COD' : 'Pre-paid'
      };

      console.log('Delhivery API - Getting charges:', { url: chargesUrl, params });

      const chargesResponse = await axios.get(chargesUrl, {
        params,
        headers: {
          'Authorization': `Token ${B2C_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: null
      });

      console.log('Delhivery API - Charges response:', {
        status: chargesResponse.status,
        data: chargesResponse.data
      });

      // Handle charges API errors
      if (chargesResponse.status !== 200 || !chargesResponse.data?.[0]) {
        return {
          serviceability: true,
          message: 'Delivery available but unable to calculate charges',
          delivery_codes: serviceabilityResponse.data?.delivery_codes,
          error: { type: 'charges_error', status: chargesResponse.status, response: chargesResponse.data }
        };
      }

      const chargeData = chargesResponse.data[0];
      const grossAmount = chargeData.gross_amount || 0;
      const totalAmount = chargeData.total_amount || 0;

      // Return success response with both serviceability and charges
      return {
        serviceability: true,
        message: 'Delivery available',
        delivery_codes: serviceabilityResponse.data?.delivery_codes,
        charges: {
          total: totalAmount,
          freight: chargeData.charge_DL || 0, // DL is delivery charge
          cod: chargeData.charge_COD || 0,
          handling: chargeData.charge_DPH || 0, // DPH is handling charge
          tax: totalAmount - grossAmount, // Tax is the difference between total and gross
          delivery_charge: grossAmount // Base delivery charge before tax
        }
      };

    } catch (error: any) {
      console.error('Delhivery API - Request error:', error);
      return {
        serviceability: false,
        message: 'Unable to check delivery availability. Please try again later.',
        error: { type: 'unknown_error', message: error.message, details: error.response?.data || error }
      };
    }
  },

  // Get B2C delivery charge estimate
  async getB2CFreightEstimate(params: B2CFreightEstimateRequest): Promise<FreightEstimateResponse> {
    console.log('Delhivery B2C API - Getting freight estimate:', params);

    if (!B2C_AUTH_TOKEN) {
      throw new Error('Configuration error: Missing B2C authentication token');
    }

    try {
      // Use the serviceability endpoint to get delivery charges
      const response = await axios.get(
        `${DELHIVERY_B2C_URL}/api/kinko/v1/invoice/charges/.json`,
        {
          params: {
            md: 'S', // Mode: Surface
            ss: 'Delivered', // Status
            o_pin: params.source_pin,
            d_pin: params.consignee_pin,
            cgm: Math.ceil(params.weight_g / 1000) * 1000, // Convert to charged weight in grams
            pt: params.payment_mode === 'cod' ? 'COD' : 'Pre-paid',
            cod: params.payment_mode === 'cod' ? 1 : 0
          },
          headers: {
            'Authorization': `Token ${B2C_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Delhivery B2C API - Response:', response.data);

      // Extract the total and breakup from the response
      const charges = response.data?.[0] || {};
      return {
        total: charges.total_amount || 0,
        base_freight: charges.charge_DL || 0,
        fuel_surcharge: charges.charge_FSC || 0,
        cod_charges: charges.charge_COD || 0,
        other_charges: charges.charge_DPH || 0,
        gst: (charges.tax_data?.CGST || 0) + (charges.tax_data?.SGST || 0) + (charges.tax_data?.IGST || 0)
      };
    } catch (error: any) {
      console.error('Delhivery B2C API - Freight estimate error:', error);
      throw error;
    }
  },

  // Get B2B delivery charge estimate
  async getB2BFreightEstimate(params: B2BFreightEstimateRequest): Promise<FreightEstimateResponse> {
    console.log('Delhivery B2B API - Getting freight estimate:', params);

    try {
      const token = await this.getB2BAuthToken();

      const response = await axios.post(
        `${DELHIVERY_B2B_URL}/freight/estimate`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          validateStatus: null
        }
      );

      console.log('Delhivery B2B API - Freight estimate response:', {
        status: response.status,
        data: response.data
      });

      if (response.status === 401) {
        // Clear cached token and try once more
        b2bAuthToken = null;
        b2bTokenExpiry = null;
        const newToken = await this.getB2BAuthToken();
        
        const retryResponse = await axios.post(
          `${DELHIVERY_B2B_URL}/freight/estimate`,
          params,
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        return {
          total: retryResponse.data.total || 0,
          base_freight: retryResponse.data.base_freight || 0,
          fuel_surcharge: retryResponse.data.fuel_surcharge,
          cod_charges: retryResponse.data.cod_charges,
          rov_charges: retryResponse.data.rov_charges,
          other_charges: retryResponse.data.other_charges,
          gst: retryResponse.data.gst
        };
      }

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to get B2B freight estimate');
      }

      return {
        total: response.data.total || 0,
        base_freight: response.data.base_freight || 0,
        fuel_surcharge: response.data.fuel_surcharge,
        cod_charges: response.data.cod_charges,
        rov_charges: response.data.rov_charges,
        other_charges: response.data.other_charges,
        gst: response.data.gst
      };
    } catch (error: any) {
      console.error('Delhivery B2B API - Freight estimate error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get B2B freight estimate');
    }
  },

  // Create shipping manifest
  async createManifest(orderData: any) {
    try {
      const formData = new FormData();
      formData.append('pickup_location_name', orderData.warehouseName);
      formData.append('payment_mode', orderData.paymentMode);
      formData.append('weight', orderData.weight.toString());
      formData.append('dropoff_location', JSON.stringify({
        consignee_name: orderData.shippingAddress.name,
        address: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        zip: orderData.shippingAddress.pincode,
        phone: orderData.shippingAddress.phone,
        email: orderData.shippingAddress.email || ''
      }));

      const response = await axios.post(
        `${DELHIVERY_B2C_URL}/api/kinko/v1/manifest/upload/`,
        formData,
        {
          headers: {
            'Authorization': `Token ${B2C_AUTH_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create manifest');
    }
  },

  // Cancel shipping request
  async cancelShipment(lrNumber: string) {
    try {
      const response = await axios.delete(
        `${DELHIVERY_B2C_URL}/api/kinko/v1/packages/${lrNumber}/cancel/`,
        {
          headers: {
            'Authorization': `Token ${B2C_AUTH_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel shipment');
    }
  },

  // Track shipment
  async trackShipment(lrNumber: string) {
    try {
      const response = await axios.get(
        `${DELHIVERY_B2C_URL}/api/kinko/v1/packages/${lrNumber}/track/`,
        {
          headers: {
            'Authorization': `Token ${B2C_AUTH_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to track shipment');
    }
  }
}; 