// Test script for the new shipping cost API
const testShippingCost = async () => {
  const testData = {
    destinationPincode: '110001', // Delhi
    originPincode: '700001', // Kolkata (warehouse)
    weight: 1000, // 1kg
    paymentMode: 'Pre-paid',
    shippingService: 'E'
  };

  try {
    console.log('Testing shipping cost API...');
    console.log('Test data:', testData);

    const response = await fetch('http://localhost:3000/api/delivery/shipping-cost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (data.success) {
      console.log('✅ Success! Shipping cost:', data.cost);
      console.log('Payment mode:', data.paymentMode);
      console.log('Service:', data.service);
      if (data.dev_mode) {
        console.log('📝 Note: Using development mode');
      }
      if (data.fallback_mode) {
        console.log('⚠️  Note: Using fallback mode due to API issues');
      }
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }

  // Test COD as well
  console.log('\n--- Testing COD ---');
  const codData = { ...testData, paymentMode: 'COD' };
  
  try {
    const response = await fetch('http://localhost:3000/api/delivery/shipping-cost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(codData)
    });

    const data = await response.json();
    console.log('COD API Response:', data);

    if (data.success) {
      console.log('✅ COD Success! Shipping cost:', data.cost);
    } else {
      console.log('❌ COD Error:', data.error);
    }
  } catch (error) {
    console.error('❌ COD Request failed:', error);
  }
};

// Run the test
testShippingCost();
