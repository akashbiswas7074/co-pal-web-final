# Expected TAT (Turnaround Time) Integration Documentation

## Overview
This integration provides estimated delivery times using Delhivery's Expected TAT API. The feature shows customers when they can expect their orders to be delivered based on origin and destination pincodes.

## Features Implemented

### 1. API Endpoint
- **Location**: `/app/api/delivery/expected-tat/route.ts`
- **Method**: GET
- **Purpose**: Fetches estimated delivery time from Delhivery API

#### Parameters
- `origin_pin` (required): Origin pincode (default: 122003)
- `destination_pin` (required): Destination pincode
- `mot` (optional): Mode of Transport ('S' for Surface, 'E' for Express, default: 'S')
- `pdt` (optional): Product Type ('B2C' or 'B2B', default: 'B2C')
- `expected_pickup_date` (optional): Pickup date (default: today)

#### Response Format
```json
{
  "success": true,
  "data": {
    "expected_tat": "3-5 business days",
    "expected_delivery_date": "2024-07-10",
    "pickup_date": "2024-07-05",
    "fallback": false
  }
}
```

### 2. React Hook
- **Location**: `/hooks/use-expected-tat.ts`
- **Purpose**: Custom hook for fetching and managing expected TAT data

#### Usage
```typescript
const { data, loading, error, refetch } = useExpectedTat({
  origin_pin: '122003',
  destination_pin: '136118',
  mot: 'S',
  pdt: 'B2C',
  enabled: true
});
```

### 3. UI Components
- **Location**: `/components/shared/delivery/ExpectedDelivery.tsx`

#### Components Available
1. **ExpectedDelivery** - Full component with detailed information
2. **ExpectedDeliverySimple** - Compact version for checkout
3. **ExpectedDeliveryOrder** - Version for order pages with pickup date

#### Usage Examples
```tsx
// Product page
<ExpectedDeliverySimple 
  destination_pin={userPincode}
  className="w-full"
/>

// Checkout page
<ExpectedDeliverySimple
  destination_pin={address.zipCode}
  className="mt-3"
/>

// Order page
<ExpectedDeliveryOrder
  destination_pin={deliveryAddress.zipCode}
  pickup_date={order.createdAt}
  className="w-full"
/>
```

## Integration Points

### 1. Product Page (`/app/product/[slug]/page.tsx`)
- Shows expected delivery time when user enters pincode
- Integrated with PincodeServiceability component
- Updates automatically when pincode changes

### 2. Checkout Page (`/components/shared/checkout/index.tsx`)
- Displays expected delivery time in shipping section
- Shows alongside shipping cost information
- Updates when delivery address changes

### 3. Order Page (`/app/order/[id]/page.tsx`)
- Shows expected delivery based on order's delivery address
- Uses order creation date as pickup date for accurate estimation
- Displays alongside delivery address information

## Environment Variables

```env
# Delhivery Configuration
DELHIVERY_AUTH_TOKEN=your_production_delhivery_token
NEXT_PUBLIC_WAREHOUSE_PINCODE=your_warehouse_pincode
```

## Production & Fallback Logic

### Production Mode
The integration uses production Delhivery API:
- Always uses `https://track.delhivery.com/api/dc/expected_tat`
- Requires valid production authentication token
- Returns actual delivery estimates from Delhivery

### Fallback Logic
The integration includes robust fallback mechanisms:
1. **API Errors**: Returns standard "3-7 business days" estimate
2. **Network Issues**: Graceful degradation with fallback data
3. **Invalid Responses**: Default to standard delivery time
4. **Missing Configuration**: Returns fallback estimates

## Testing

### Manual Testing Script
Run the test script to verify API functionality:
```bash
node test-expected-tat.js
```

### Test Cases Covered
1. ✅ Valid pincode combinations
2. ✅ Missing required parameters
3. ✅ Express vs Surface mode
4. ✅ Fallback scenarios
5. ✅ Dev mode responses

## Error Handling

### Client-Side
- Loading states while fetching data
- Error messages for failed requests
- Graceful fallback to standard delivery text

### Server-Side
- Input validation for required parameters
- API error handling with fallback responses
- Proper HTTP status codes and error messages

## Performance Considerations

1. **Caching**: Responses can be cached based on pincode combinations
2. **Lazy Loading**: Components load only when needed
3. **Debouncing**: Pincode changes are debounced to reduce API calls
4. **Fallback Speed**: Immediate fallback for better user experience

## Future Enhancements

1. **Caching Layer**: Implement Redis/memory caching for frequent pincode combinations
2. **Batch Requests**: Support multiple pincode checks in single API call
3. **Real-time Updates**: WebSocket updates for delivery time changes
4. **Analytics**: Track delivery time accuracy and user engagement
5. **Holidays Integration**: Account for holidays in delivery estimates

## Troubleshooting

### Common Issues

1. **"Missing required parameters" Error**
   - Ensure origin_pin and destination_pin are provided
   - Check pincode format (6 digits)

2. **API Returns Fallback Data**
   - Check DELHIVERY_AUTH_TOKEN is valid
   - Verify network connectivity
   - Check Delhivery API status

3. **Component Not Showing**
   - Verify destination pincode is available
   - Check component import paths
   - Ensure proper props are passed

### Debug Steps
1. Check browser console for errors
2. Verify API endpoint responds at `/api/delivery/expected-tat`
3. Test with known working pincode combinations
4. Check environment variables are loaded

## Support
For issues or questions regarding the Expected TAT integration, check:
1. API logs in server console
2. Network tab for API requests
3. Component props and state values
4. Environment variable configuration
