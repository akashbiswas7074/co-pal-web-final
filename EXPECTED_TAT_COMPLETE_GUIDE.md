# Expected TAT API - Complete Implementation Guide

## Overview
This implementation provides a complete Expected TAT (Turn Around Time) API integration with Delhivery's shipping service. The API calculates expected delivery times between origin and destination pin codes.

## Features
- ✅ Complete Delhivery API integration
- ✅ **Default pickup date**: Automatically sets pickup date to 1 day from now
- ✅ Fallback handling for API failures
- ✅ Support for both Standard and Express delivery
- ✅ Comprehensive error handling
- ✅ Rate limiting awareness
- ✅ TypeScript support
- ✅ React hooks for easy integration
- ✅ Multiple UI components for different use cases

## API Specifications

### Endpoint
- **URL**: `/api/delivery/expected-tat`
- **Method**: GET
- **Rate Limit**: 750 requests per 5 minutes per IP
- **Average Latency**: 158.41ms
- **P99 Latency**: 366.49ms

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin_pin` | String | Yes | Pin code of shipment's origin location |
| `destination_pin` | String | Yes | Pin code of shipment's destination location |
| `mot` | String | Yes | Mode of Transport: 'S' for Surface, 'E' for Express |
| `pdt` | String | No | Product Type: 'B2B', 'B2C' (defaults to B2C) |
| `expected_pickup_date` | String | No | Pickup date in YYYY-MM-DD format (automatically converted to YYYY-MM-DD HH:MM for Delhivery, defaults to 1 day from now) |

### Response Structure
```json
{
  "success": true,
  "data": {
    "expected_tat": "3-5 business days",
    "expected_delivery_date": "2024-12-20",
    "pickup_date": "2024-12-15",
    "fallback": false,
    "error": null,
    "raw_response": {...}
  }
}
```

## Environment Setup

### Required Environment Variables
```env
# Delhivery API Configuration
DELHIVERY_AUTH_TOKEN=your_delhivery_auth_token_here

# Warehouse Configuration
NEXT_PUBLIC_WAREHOUSE_PINCODE=700001
```

## Usage Examples

### 1. Using the React Hook
```tsx
import { useExpectedTat } from '@/hooks/use-expected-tat';

function DeliveryInfo({ userPincode }) {
  const { data, loading, error } = useExpectedTat({
    origin_pin: '700001',
    destination_pin: userPincode,
    mot: 'S', // Standard delivery
    pdt: 'B2C',
    enabled: !!userPincode
  });

  if (loading) return <div>Calculating...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <p>Expected TAT: {data.expected_tat}</p>
      <p>Delivery Date: {data.expected_delivery_date}</p>
      {data.fallback && <p>⚠️ Estimated delivery time</p>}
    </div>
  );
}
```

### 2. Using the UI Components

#### Simple Delivery Display
```tsx
import { ExpectedDeliverySimple } from '@/components/shared/delivery/ExpectedDelivery';

<ExpectedDeliverySimple 
  destination_pin="400001"
  mot="S"
  className="my-4"
/>
```

#### Express Delivery Display
```tsx
import { ExpectedDeliveryExpress } from '@/components/shared/delivery/ExpectedDelivery';

<ExpectedDeliveryExpress 
  destination_pin="400001"
  className="my-4"
/>
```

#### Order Page Display (with pickup date)
```tsx
import { ExpectedDeliveryOrder } from '@/components/shared/delivery/ExpectedDelivery';

<ExpectedDeliveryOrder 
  destination_pin="400001"
  pickup_date="2024-12-15"
  mot="S"
  className="my-4"
/>
```

### 3. Direct API Call
```javascript
const response = await fetch('/api/delivery/expected-tat?origin_pin=700001&destination_pin=400001&mot=S&pdt=B2C');
const data = await response.json();
console.log(data);
```

## Component Variants

### ExpectedDelivery (Main Component)
- Full-featured component with all options
- Supports both compact and expanded layouts
- Handles fallback scenarios gracefully

### ExpectedDeliverySimple
- Compact version for checkout pages
- Shows essential delivery information
- Supports both standard and express delivery

### ExpectedDeliveryExpress
- Specialized for express delivery
- Highlights express shipping benefits
- Compact layout optimized for quick display

### ExpectedDeliveryOrder
- Designed for order confirmation pages
- Shows pickup date and delivery timeline
- Includes detailed delivery information

## Error Handling

The implementation includes comprehensive error handling:

1. **API Token Missing**: Returns fallback delivery estimate
2. **Invalid Parameters**: Returns 400 error with details
3. **Delhivery API Error**: Returns fallback estimate with error info
4. **Network Issues**: Returns fallback estimate
5. **Rate Limiting**: Handled with appropriate backoff

## Fallback Behavior

When the Delhivery API is unavailable, the system provides:
- Standard delivery estimate: "3-7 business days"
- Calculated delivery date based on current date + 5 days
- Clear indication that the estimate is a fallback
- Error message explaining the situation

## Testing

### Run All Tests
```javascript
// In browser console
window.testExpectedTat.runAllTests();
```

### Test Custom Parameters
```javascript
// Test specific pin codes
window.testExpectedTat.testCustomParameters('110001', '400001', 'S', 'B2C');
```

### Test Cases Included
- Delhi to Mumbai (Standard & Express)
- Kolkata to Bangalore
- Delhi to Chennai with pickup date
- Invalid pin code handling

## Rate Limiting

The Delhivery API has a rate limit of 750 requests per 5 minutes per IP. The implementation:
- Includes proper error handling for rate limit responses
- Provides fallback data when rate limited
- Logs rate limit incidents for monitoring

## Best Practices

1. **Always provide fallback data** to ensure UI remains functional
2. **Cache responses** on the client side when possible
3. **Handle loading states** appropriately
4. **Show clear indicators** when using fallback data
5. **Monitor API usage** to stay within rate limits

## Troubleshooting

### Common Issues

1. **400 Bad Request from Delhivery API**
   - **Same origin and destination pin codes**: The API now handles this by returning same-day delivery
   - **Invalid date format**: Dates must be in YYYY-MM-DD format and in the future (automatically converted to YYYY-MM-DD HH:MM for Delhivery)
   - **Invalid pin code format**: Pin codes must be exactly 6 digits
   - **Invalid MOT parameter**: Must be 'S' for Surface or 'E' for Express
   - **API token issues**: Verify your Delhivery token is valid and has proper permissions
   - **Parameter name issues**: The API automatically converts `expected_pickup_date` to `expected_pd` for Delhivery
   
   **Debug steps:**
   ```javascript
   // Run diagnostics in browser console
   window.diagnosticExpectedTat.runFullDiagnostics();
   ```

2. **405 Method Not Allowed**
   - Check if the API route file exists
   - Verify the route exports a GET function
   - Ensure proper Next.js App Router structure

3. **Missing Environment Variables**
   - Check .env.local file
   - Verify DELHIVERY_AUTH_TOKEN is set
   - Ensure NEXT_PUBLIC_WAREHOUSE_PINCODE is configured

4. **Rate Limiting**
   - Implement client-side caching
   - Add delays between requests
   - Monitor API usage patterns

5. **Fallback Data Always Shown**
   - Check Delhivery API token validity
   - Verify API endpoint accessibility
   - Review server logs for detailed errors

## Monitoring

Monitor the following metrics:
- API response times
- Error rates
- Fallback usage percentage
- Rate limit hits
- User experience impact

## Support

For additional support:
1. Check the test file for debugging
2. Review server logs for detailed error information
3. Verify Delhivery API documentation for updates
4. Test with known working pin codes first
