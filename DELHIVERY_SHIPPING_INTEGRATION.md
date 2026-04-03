# Delhivery Shipping Integration

## Overview
This document describes the implementation of real-time shipping cost calculation using Delhivery's Kinko API and the simplified checkout flow.

## Features Implemented

### 1. Real-Time Shipping Cost Calculation
- **API Endpoint**: `/api/delivery/shipping-cost`
- **Method**: POST
- **Purpose**: Calculate accurate shipping charges using Delhivery's Kinko API

### 2. Simplified Checkout Flow
- Removed complex delivery options and partner selection
- Automatic shipping cost calculation based on:
  - Destination pincode
  - Order weight
  - Payment method (Prepaid vs COD)
  - Express delivery service

### 3. Payment Method Impact
- **Prepaid Orders**: Lower shipping costs (e.g., ₹135.39 for 1kg)
- **COD Orders**: Higher costs due to COD charges (e.g., ₹182.59 for 1kg)
- Automatic recalculation when payment method changes

## API Endpoints

### Shipping Cost Calculation
```
POST /api/delivery/shipping-cost
```

**Request Body:**
```json
{
  "destinationPincode": "110001",
  "originPincode": "700001",
  "weight": 1000,
  "paymentMode": "Pre-paid|COD",
  "shippingService": "E"
}
```

**Response:**
```json
{
  "success": true,
  "cost": 135.39,
  "service": "E",
  "paymentMode": "Pre-paid",
  "raw_response": {
    "charge_DL": 113,
    "charge_COD": 0,
    "total_amount": 135.39,
    "zone": "C",
    "charged_weight": 1000,
    "tax_data": {
      "CGST": 10.33,
      "SGST": 10.33
    }
  }
}
```

### Pincode Serviceability Check
```
GET /api/delivery/check-pincode?pincode=110001
```

**Response:**
```json
{
  "serviceability": true,
  "message": "Delivery available for this pincode",
  "delivery_codes": ["D", "E"],
  "pincode": "110001"
}
```

## Implementation Details

### 1. Shipping Cost Calculation Logic
- Uses Delhivery's Kinko API (`/api/kinko/v1/invoice/charges/.json`)
- Calculates based on actual weight and dimensions
- Includes all applicable charges (delivery, COD, taxes)
- Supports both staging and production environments

### 2. Error Handling & Fallbacks
- **Authentication Issues**: Falls back to calculated rates
- **API Unavailable**: Uses weight-based fallback calculation
- **Development Mode**: Mock responses for testing

### 3. Weight Calculation
- Default: 500g per product
- Multiplied by quantity for total weight
- Can be customized per product in the future

## Configuration

### Environment Variables
```bash
# Delhivery API Configuration
DELHIVERY_AUTH_TOKEN=your_token_here
DELHIVERY_B2B_USERNAME=your_username
DELHIVERY_B2B_PASSWORD=your_password
NEXT_PUBLIC_WAREHOUSE_PINCODE=700001
```

### Shipping Service Configuration
```typescript
export const SHIPPING_CONFIG = {
  DEFAULT_SHIPPING_CHARGE: 48,
  WAREHOUSE_PINCODE: '700001',
  DEFAULT_WEIGHT_GRAMS: 500,
  DEFAULT_DIMENSIONS: {
    length_cm: 20,
    width_cm: 15,
    height_cm: 10,
    box_count: 1
  }
} as const;
```

## User Experience

### 1. Pincode Serviceability
- Users can check if their pincode is serviceable on product pages
- Clear feedback on delivery availability
- Fallback mode indicators for transparency

### 2. Checkout Flow
1. **Address Selection**: Choose delivery address
2. **Payment Method**: Select prepaid or COD
3. **Shipping Calculation**: Automatic cost calculation
4. **Review & Place Order**: Final confirmation

### 3. Shipping Information Display
- Real-time shipping cost updates
- Payment method impact explanation
- Loading states during calculation
- Clear error messages

## Cost Comparison Examples

### Weight: 1kg, Route: Kolkata to Delhi

| Payment Method | Cost | Breakdown |
|---------------|------|-----------|
| Prepaid | ₹135.39 | Base: ₹113, Tax: ₹20.66, COD: ₹0 |
| COD | ₹182.59 | Base: ₹113, Tax: ₹27.86, COD: ₹40 |

### Benefits of Prepaid Orders
- Lower shipping costs
- Faster processing
- No COD collection charges
- Better delivery success rates

## Testing

### Manual Testing
```bash
# Test shipping cost API
node test-shipping-cost.js

# Test pincode serviceability
node test-pincode.js
```

### API Testing
```bash
# Test shipping cost calculation
curl -X POST http://localhost:3000/api/delivery/shipping-cost \
  -H "Content-Type: application/json" \
  -d '{
    "destinationPincode": "110001",
    "originPincode": "700001",
    "weight": 1000,
    "paymentMode": "Pre-paid"
  }'
```

## Troubleshooting

### Common Issues
1. **401 Authentication Error**: Check DELHIVERY_AUTH_TOKEN
2. **Invalid Pincode**: Ensure 6-digit format
3. **High Shipping Costs**: Verify weight calculation
4. **API Timeout**: Fallback mode will activate

### Debugging
- Check console logs for API responses
- Use development mode for testing
- Verify environment variables
- Test with known serviceable pincodes

## Future Enhancements

### Planned Features
1. **Product-specific weights**: Individual product weight configuration
2. **Shipping zones**: Zone-based pricing display
3. **Delivery time estimates**: ETA calculation
4. **Multi-package optimization**: Smart packaging algorithms
5. **Bulk order discounts**: Volume-based shipping rates

### Performance Optimizations
1. **Caching**: Cache shipping costs for common routes
2. **Rate limiting**: Prevent API abuse
3. **Batch calculations**: Multiple addresses at once
4. **Webhook updates**: Real-time rate updates

## Security Considerations

### API Security
- Environment variables for sensitive data
- Token-based authentication
- Rate limiting on API endpoints
- Input validation for all parameters

### Data Protection
- No storage of sensitive shipping data
- Secure transmission of API calls
- Minimal data exposure in responses
- Audit trails for shipping calculations

## Monitoring & Analytics

### Key Metrics
- Shipping cost calculation success rate
- Average shipping costs by payment method
- API response times
- Fallback mode usage frequency

### Alerts
- High API error rates
- Unusual shipping cost spikes
- Authentication failures
- Service unavailability

---

**Last Updated**: July 3, 2025
**Version**: 1.0.0
**Status**: Production Ready
