# Category-Specific Size Guide Implementation

## Overview

This implementation adds category-specific size guide functionality to the e-commerce platform. Each product category can now have its own dedicated size chart with specific measurements and sizing information.

## Features

- **Category-Specific Size Charts**: Each category can have its own size chart with unique measurements
- **Dynamic Size Guide Display**: Size guides automatically show category-specific information when accessed from product pages
- **Fallback to General Guide**: If no category-specific chart exists, the system falls back to the general size guide
- **Admin Management**: Admins can create and manage multiple size charts for different categories
- **API Support**: RESTful API endpoints for fetching category-specific size guides

## Database Schema Changes

### Size Guide Model Updates

The size guide model has been updated to support multiple category-specific charts:

```typescript
interface ISizeChart {
  categoryName: string;
  categoryId?: mongoose.Types.ObjectId; // Reference to category
  description?: string;
  measurements: ISizeChartEntry[];
  measurementUnits: string; // "inches", "cm", etc.
  isActive: boolean;
  order: number;
}

interface ISizeGuide extends Document {
  title: string;
  subtitle?: string;
  heroIcon?: string;
  sections: ISizeGuideSection[];
  sizeCharts: ISizeChart[]; // Array of category-specific charts
  howToMeasure?: {
    enabled: boolean;
    content: string;
    images?: string[];
  };
  fitTips?: {
    enabled: boolean;
    content: string;
  };
  // ... other fields
}
```

## API Endpoints

### Get Size Guide by Category

**Endpoint**: `GET /api/size-guide?category={categoryName}`

**Example**:
```javascript
// Get size guide for "Clothing" category
const response = await fetch('/api/size-guide?category=Clothing');
const data = await response.json();
```

### Get Size Guide by Category ID

**Endpoint**: `GET /api/size-guide?categoryId={categoryId}`

**Example**:
```javascript
// Get size guide for category ID
const response = await fetch('/api/size-guide?categoryId=507f1f77bcf86cd799439011');
const data = await response.json();
```

### Get General Size Guide

**Endpoint**: `GET /api/size-guide`

**Example**:
```javascript
// Get general size guide
const response = await fetch('/api/size-guide');
const data = await response.json();
```

## Frontend Implementation

### Size Guide Page

The size guide page (`/size-guide`) now supports category-specific display:

```typescript
// URL: /size-guide?category=Clothing
export default async function SizeGuidePage({ searchParams }: SizeGuidePageProps) {
  const categoryName = searchParams.category;
  
  let result;
  if (categoryName) {
    result = await getSizeGuideByCategoryName(categoryName);
  } else {
    result = await getActiveSizeGuide();
  }
  
  // Display category-specific or general size guide
}
```

### Product Page Integration

Product pages automatically link to category-specific size guides:

```typescript
// In product page component
<Link href={`/size-guide${productData?.category?.name ? `?category=${encodeURIComponent(productData.category.name)}` : ''}`}>
  <Button variant="link" className="text-sm p-0 h-auto">
    Size Guide
  </Button>
</Link>
```

### Size Guide Tab Content Component

The `SizeGuideTabContent` component now supports category-specific props:

```typescript
interface SizeGuideTabContentProps {
  className?: string;
  categoryName?: string;
  categoryId?: string;
}

// Usage
<SizeGuideTabContent 
  categoryName="Clothing"
  categoryId="507f1f77bcf86cd799439011"
/>
```

## Backend Actions

### New Action Functions

```typescript
// Get size guide by category ID
export async function getSizeGuideByCategory(categoryId: string)

// Get size guide by category name
export async function getSizeGuideByCategoryName(categoryName: string)

// Get all categories with size charts
export async function getAllCategoriesWithSizeCharts()
```

### Action Usage Examples

```typescript
// Get category-specific size guide
const result = await getSizeGuideByCategoryName("Clothing");
if (result.success) {
  const config = result.config;
  const categoryName = result.categoryName;
  // Use the category-specific size guide
}

// Get all categories with size charts
const categoriesResult = await getAllCategoriesWithSizeCharts();
if (categoriesResult.success) {
  const categories = categoriesResult.categories;
  // Display list of categories with size charts
}
```

## Admin Panel Integration

### Size Guide Management

The admin panel has been updated to support:

1. **Multiple Size Charts**: Create and manage size charts for different categories
2. **Category Association**: Link size charts to specific categories
3. **Chart Ordering**: Set display order for multiple charts
4. **Individual Chart Activation**: Enable/disable specific charts

### Admin Interface Features

- Add/remove size charts for categories
- Set measurement units per chart (inches/cm)
- Configure chart-specific descriptions
- Manage chart display order
- Enable/disable individual charts

## Usage Examples

### Creating a Category-Specific Size Chart

1. **Via Admin Panel**:
   - Navigate to Size Guide management
   - Add new size chart
   - Select category or enter category name
   - Add measurements and sizes
   - Set chart as active

2. **Via API** (for programmatic creation):
   ```javascript
   const sizeChart = {
     categoryName: "Clothing",
     categoryId: "507f1f77bcf86cd799439011",
     description: "Size chart for clothing items",
     measurements: [
       {
         size: "S",
         measurements: {
           "Chest": "36\"",
           "Waist": "28\"",
           "Length": "26\""
         },
         order: 1
       }
       // ... more sizes
     ],
     measurementUnits: "inches",
     isActive: true,
     order: 1
   };
   ```

### Displaying Category-Specific Size Guide

1. **On Product Pages**:
   - Size guide links automatically include category parameter
   - Users see category-specific sizing information

2. **On Size Guide Page**:
   - Access via `/size-guide?category=Clothing`
   - Shows category-specific chart with fallback to general guide

3. **In Components**:
   ```typescript
   <SizeGuideTabContent 
     categoryName={product.category.name}
     categoryId={product.category._id}
   />
   ```

## Fallback Behavior

When a category-specific size chart is not found:

1. **Product Pages**: Link to general size guide
2. **Size Guide Page**: Display general size guide with message
3. **Components**: Show general size guide content

## Testing

### Test Script

Run the test script to verify functionality:

```bash
node test-category-size-guide.js
```

### Manual Testing

1. Create a category-specific size chart via admin panel
2. Visit a product page in that category
3. Click "Size Guide" link
4. Verify category-specific information is displayed
5. Test fallback behavior with categories without specific charts

## Migration Notes

### Existing Data

- Existing size guides will continue to work
- New category-specific charts can be added alongside existing ones
- No data migration required

### Backward Compatibility

- All existing size guide functionality remains intact
- New features are additive and don't break existing implementations
- API endpoints maintain backward compatibility

## Future Enhancements

1. **Subcategory Support**: Add size charts for subcategories
2. **Brand-Specific Charts**: Support brand-specific sizing
3. **Measurement Conversion**: Automatic unit conversion
4. **Size Recommendations**: AI-powered size recommendations
5. **User Size Profiles**: Save user measurements for quick reference

## Troubleshooting

### Common Issues

1. **Category Not Found**: Ensure category exists and is properly linked
2. **Chart Not Displaying**: Check if chart is marked as active
3. **API Errors**: Verify category name/ID format
4. **Fallback Issues**: Ensure general size guide exists

### Debug Steps

1. Check database for size guide configuration
2. Verify category associations
3. Test API endpoints directly
4. Check browser console for errors
5. Verify URL parameters are correct

## Support

For issues or questions regarding the category-specific size guide implementation:

1. Check this documentation
2. Review the test script for examples
3. Examine the API responses
4. Contact the development team
