// Test script to check the Expected TAT API response structure
const testExpectedTat = async () => {
  try {
    console.log('Testing Expected TAT API...');
    
    const params = new URLSearchParams({
      origin_pin: '700001',
      destination_pin: '110001',
      mot: 'S',
      pdt: 'B2C'
    });

    const response = await fetch(`http://localhost:3000/api/delivery/expected-tat?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('Expected TAT:', data.data.expected_tat);
      console.log('Type of expected_tat:', typeof data.data.expected_tat);
      
      console.log('Expected Delivery Date:', data.data.expected_delivery_date);
      console.log('Type of expected_delivery_date:', typeof data.data.expected_delivery_date);
      
      console.log('Pickup Date:', data.data.pickup_date);
      console.log('Type of pickup_date:', typeof data.data.pickup_date);
      
      if (typeof data.data.expected_tat === 'string') {
        console.log('✅ expected_tat is a string');
      } else {
        console.log('❌ expected_tat is not a string');
      }
      
      if (typeof data.data.expected_delivery_date === 'string') {
        console.log('✅ expected_delivery_date is a string');
      } else {
        console.log('❌ expected_delivery_date is not a string');
      }
      
      // Check if it's a fallback response
      if (data.data.fallback) {
        console.log('⚠️  This is a fallback response');
      } else {
        console.log('✅ This is a real API response');
      }
      
      // Show formatted date and time
      console.log('\n--- Date/Time Information ---');
      console.log('Current Date/Time:', new Date().toISOString());
      console.log('Current Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      
      if (data.data.expected_delivery_date) {
        const deliveryDate = new Date(data.data.expected_delivery_date);
        console.log('Expected Delivery Date:', data.data.expected_delivery_date);
        console.log('Formatted Delivery Date:', deliveryDate.toDateString());
        console.log('Days from now:', Math.ceil((deliveryDate - new Date()) / (1000 * 60 * 60 * 24)));
      }
      
      if (data.data.pickup_date) {
        const pickupDate = new Date(data.data.pickup_date);
        console.log('Pickup Date:', data.data.pickup_date);
        console.log('Formatted Pickup Date:', pickupDate.toDateString());
      }
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testExpectedTat();
