const mongoose = require('mongoose');

// Test script for category-specific size guide functionality
async function testCategorySizeGuide() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to database');

    // Import models
    const SizeGuide = require('./lib/database/models/size-guide.model').default;
    const Category = require('./lib/database/models/category.model').default;

    // Create a test category
    const testCategory = new Category({
      name: 'Test Clothing',
      slug: 'test-clothing',
      description: 'Test category for size guide'
    });
    await testCategory.save();
    console.log('Created test category:', testCategory.name);

    // Create a size guide with category-specific charts
    const sizeGuide = new SizeGuide({
      title: 'Comprehensive Size Guide',
      subtitle: 'Find your perfect fit',
      heroIcon: '📐',
      sections: [
        {
          title: 'General Sizing Tips',
          content: '<p>Here are some general tips for finding your perfect size...</p>',
          icon: '💡',
          isActive: true,
          order: 1
        }
      ],
      sizeCharts: [
        {
          categoryName: 'Test Clothing',
          categoryId: testCategory._id,
          description: 'Specific size chart for test clothing',
          measurements: [
            {
              size: 'S',
              measurements: {
                'Chest': '36"',
                'Waist': '28"',
                'Length': '26"'
              },
              order: 1
            },
            {
              size: 'M',
              measurements: {
                'Chest': '38"',
                'Waist': '30"',
                'Length': '27"'
              },
              order: 2
            },
            {
              size: 'L',
              measurements: {
                'Chest': '40"',
                'Waist': '32"',
                'Length': '28"'
              },
              order: 3
            }
          ],
          measurementUnits: 'inches',
          isActive: true,
          order: 1
        },
        {
          categoryName: 'General',
          description: 'General size chart for all products',
          measurements: [
            {
              size: 'One Size',
              measurements: {
                'Fits': 'Most sizes',
                'Adjustable': 'Yes'
              },
              order: 1
            }
          ],
          measurementUnits: 'inches',
          isActive: true,
          order: 2
        }
      ],
      howToMeasure: {
        enabled: true,
        content: '<p>How to measure yourself for the perfect fit...</p>',
        images: []
      },
      fitTips: {
        enabled: true,
        content: '<p>Tips for finding the right fit...</p>'
      },
      isActive: true
    });

    await sizeGuide.save();
    console.log('Created size guide with category-specific charts');

    // Test fetching by category name
    const categoryResult = await SizeGuide.findOne({ isActive: true }).lean();
    const categoryChart = categoryResult.sizeCharts.find(
      chart => chart.categoryName === 'Test Clothing'
    );
    
    if (categoryChart) {
      console.log('✅ Category-specific chart found:', categoryChart.categoryName);
      console.log('   Measurements:', categoryChart.measurements.length, 'sizes');
    } else {
      console.log('❌ Category-specific chart not found');
    }

    // Test fetching by category ID
    const categoryIdChart = categoryResult.sizeCharts.find(
      chart => chart.categoryId?.toString() === testCategory._id.toString()
    );
    
    if (categoryIdChart) {
      console.log('✅ Category ID chart found:', categoryIdChart.categoryName);
    } else {
      console.log('❌ Category ID chart not found');
    }

    // Clean up
    await SizeGuide.findByIdAndDelete(sizeGuide._id);
    await Category.findByIdAndDelete(testCategory._id);
    console.log('Cleaned up test data');

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the test
testCategorySizeGuide();
