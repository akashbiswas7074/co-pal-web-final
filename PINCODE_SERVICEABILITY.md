# Pincode Serviceability Feature

This document outlines the implementation of the simplified pincode serviceability feature for product pages.

## Overview

The pincode serviceability feature allows customers to check if delivery is available to their location before placing an order. This helps improve user experience by providing upfront delivery information.

## Components

### 1. PincodeServiceability Component

**Location**: `/components/shared/product/PincodeServiceability.tsx`

**Features**:
- Clean, minimal UI focused only on pincode checking
- Real-time validation of 6-digit pincodes
- Visual feedback with success/error states
- Keyboard navigation support (Enter key to check)
- Toast notifications for better UX

**Usage**:
```tsx
import { PincodeServiceability } from '@/components/shared/product/PincodeServiceability';

<PincodeServiceability className="optional-custom-class" />
```

### 2. API Endpoint

**Location**: `/app/api/delivery/check-pincode/route.ts`

**Endpoint**: `GET /api/delivery/check-pincode?pincode=XXXXXX`

**Features**:
- Validates 6-digit pincode format
- Integrates with Delhivery API for serviceability check
- Returns clean JSON response with serviceability status
- Proper error handling for API failures

**Example API Response**:
```json
{
  "serviceability": true,
  "message": "Delivery available for this pincode",
  "delivery_codes": ["D", "E"],
  "pincode": "110001"
}
```

## Implementation Details

### Delhivery API Integration

The system uses Delhivery's staging API to check pincode serviceability:

```
**Production URL**: `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=PINCODE`
Authorization: Token YOUR_TOKEN
```

### UI States

1. **Initial State**: Empty input field with check button
2. **Loading State**: "Checking..." text while API call is in progress
3. **Success State**: Green checkmark with confirmation message
4. **Error State**: Red X with error message or warning for invalid input

### Error Handling

- **Client Side**: Input validation, network error handling
- **Server Side**: API failure handling, token validation
- **User Feedback**: Toast notifications and inline error messages

## Environment Variables

Make sure to set the following environment variable:

```env
DELHIVERY_AUTH_TOKEN=your_delhivery_token_here
```

## Integration in Product Page

The component is integrated into the product page at `/app/product/[slug]/page.tsx` and appears:
- Below the product pricing information
- Above the size selection (if applicable)
- Before the "Add to Cart" button

This positioning ensures customers can check delivery availability before making purchase decisions.

## Testing

Use the provided test script (`test-pincode.js`) to test the functionality:

```javascript
// In browser console
testPincode('110001'); // Delhi
testPincode('400001'); // Mumbai
testPincode('194103'); // Your example pincode
```

## Customization

The component accepts a `className` prop for custom styling:

```tsx
<PincodeServiceability className="my-custom-styles" />
```

## Benefits

1. **Improved UX**: Customers know delivery availability upfront
2. **Reduced Cart Abandonment**: No surprises at checkout
3. **Clean Implementation**: Focused, lightweight component
4. **Responsive Design**: Works well on all device sizes
5. **Accessible**: Keyboard navigation and screen reader friendly

## Future Enhancements

1. **Caching**: Cache frequently checked pincodes for faster response
2. **Delivery Estimates**: Show estimated delivery time for serviceable pincodes
3. **Auto-detection**: Use geolocation to suggest pincode
4. **Bulk Check**: Allow checking multiple pincodes at once

## Troubleshooting

**Common Issues**:

1. **API Token Error**: Ensure `DELHIVERY_AUTH_TOKEN` is set correctly
2. **CORS Issues**: Check if staging API allows your domain
3. **Rate Limiting**: Implement debouncing for rapid API calls

**Debugging**:
- Check browser console for API responses
- Verify environment variables are loaded
- Test with known serviceable pincodes first
