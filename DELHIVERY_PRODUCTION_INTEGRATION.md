# Delhivery Integration - Production Ready

## Overview
This document outlines the production-ready Delhivery integration for shipping, pincode serviceability, and expected delivery (TAT) features.

## API Endpoints

### 1. Check Pincode Serviceability
- **Endpoint**: `/api/delivery/check-pincode`
- **Method**: GET
- **Parameters**: `pincode` (6-digit pincode)
- **Production URL**: `https://track.delhivery.com/c/api/pin-codes/json/`

### 2. Expected TAT (Delivery Timeline)
- **Endpoint**: `/api/delivery/expected-tat`
- **Method**: GET
- **Parameters**: 
  - `origin_pin` (warehouse pincode)
  - `destination_pin` (customer pincode)
  - `mot` (mode of transport, default: 'S' for surface)
  - `pdt` (product type, default: 'B2C')
  - `expected_pickup_date` (optional, format: YYYY-MM-DD)
- **Production URL**: `https://track.delhivery.com/api/dc/expected_tat`

## Environment Variables

```env
# Delivery Configuration (Production)
DELHIVERY_AUTH_TOKEN=your_production_token
DELHIVERY_B2B_USERNAME=your_b2b_username
DELHIVERY_B2B_PASSWORD=your_b2b_password
NEXT_PUBLIC_WAREHOUSE_PINCODE=your_warehouse_pincode
```

## Features

### 1. Pincode Serviceability Check
- Validates 6-digit pincode format
- Checks if delivery is available to the pincode
- Provides fallback responses for API failures or authentication issues
- Returns serviceable delivery codes

### 2. Expected Delivery Timeline
- Calculates expected delivery date based on origin and destination pincodes
- Supports different modes of transport and product types
- Provides fallback delivery estimates (3-7 business days) for API failures
- Handles various date formats and edge cases

### 3. UI Integration
- **ExpectedDelivery**: Full delivery information component
- **ExpectedDeliverySimple**: Simplified delivery date display
- **ExpectedDeliveryOrder**: Order-specific delivery information
- **use-expected-tat**: React hook for TAT data fetching

## Production Configuration

### API URLs
- **Pincode Check**: `https://track.delhivery.com/c/api/pin-codes/json/`
- **Expected TAT**: `https://track.delhivery.com/api/dc/expected_tat`

### Authentication
- Uses `Authorization: Token {DELHIVERY_AUTH_TOKEN}` header
- Token is obtained from Delhivery production dashboard

### Error Handling
- Graceful fallback for API failures
- Authentication error handling with fallback data
- JSON parsing error handling
- Network timeout handling

### Fallback Behavior
- When Delhivery API is unavailable: Returns generic serviceable pincodes and 3-7 day delivery estimates
- When authentication fails: Returns fallback serviceability data
- When invalid responses: Returns safe default values

## Implementation Files

### API Routes
- `/app/api/delivery/check-pincode/route.ts` - Pincode serviceability check
- `/app/api/delivery/expected-tat/route.ts` - Expected delivery timeline

### Components
- `/components/shared/delivery/ExpectedDelivery.tsx` - Full delivery component
- `/components/shared/delivery/ExpectedDeliverySimple.tsx` - Simple delivery display
- `/components/shared/delivery/ExpectedDeliveryOrder.tsx` - Order delivery info

### Hooks
- `/hooks/use-expected-tat.ts` - TAT data fetching hook

### Integration Points
- Product pages: Show expected delivery for specific pincode
- Checkout flow: Display delivery estimates during purchase
- Order pages: Show delivery timeline for placed orders

## Testing

### Production Testing
1. Test with valid pincodes (110001, 400001, 560001, etc.)
2. Test with invalid pincodes
3. Test API failure scenarios
4. Test authentication failure scenarios
5. Test network timeout scenarios

### Key Test Cases
- Valid serviceable pincode returns correct delivery information
- Invalid pincode returns appropriate error message
- API failure returns fallback data
- Missing authentication returns fallback data
- Network issues return fallback data

## Security Considerations

1. **API Token Security**: Delhivery auth token is stored in environment variables
2. **Input Validation**: All pincode inputs are validated for format and length
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **Error Handling**: Errors are logged but sensitive information is not exposed to users

## Monitoring

### Logging
- All API requests and responses are logged
- Authentication failures are specifically logged
- Fallback mode activations are logged
- Error cases are logged with context

### Key Metrics to Monitor
- API response times
- Success/failure rates
- Fallback mode activation frequency
- Authentication failure rates

## Maintenance

### Regular Tasks
1. Monitor API response times and success rates
2. Update fallback pincode lists based on actual serviceability
3. Review and update fallback delivery estimates
4. Monitor authentication token expiration
5. Update documentation as needed

### Troubleshooting
- Check environment variables are set correctly
- Verify Delhivery auth token is valid and not expired
- Check API endpoint URLs are correct
- Monitor network connectivity to Delhivery servers
- Review application logs for error patterns

## Production Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Authentication token is production token
- [ ] All API URLs point to production endpoints
- [ ] Fallback data is appropriate for production
- [ ] Error handling is production-ready
- [ ] Logging is configured properly
- [ ] Rate limiting is in place (if needed)
- [ ] Monitoring is set up
- [ ] Documentation is updated
