/**
 * Test script to verify default pickup date functionality
 * This script tests that the expected_pickup_date defaults to 1 day from now
 */

// Helper function to get tomorrow's date
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Test function to verify default pickup date behavior
async function testDefaultPickupDate() {
  console.log('🧪 Testing Default Pickup Date Behavior...\n');
  
  const expectedTomorrow = getTomorrowDate();
  console.log(`Expected pickup date should be: ${expectedTomorrow}`);
  
  // Test without providing expected_pickup_date
  const params = new URLSearchParams({
    origin_pin: '700001',
    destination_pin: '110001',
    mot: 'S',
    pdt: 'B2C'
    // No expected_pickup_date parameter
  });

  const url = `/api/delivery/expected-tat?${params}`;
  console.log(`Testing URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Response not OK:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received');
    
    if (data.success && data.data && data.data.pickup_date) {
      const receivedPickupDate = data.data.pickup_date;
      console.log(`📅 Received pickup date: ${receivedPickupDate}`);
      
      if (receivedPickupDate === expectedTomorrow) {
        console.log('✅ SUCCESS: Default pickup date is correctly set to 1 day from now!');
      } else {
        console.log('❌ FAILURE: Default pickup date is not correct');
        console.log(`   Expected: ${expectedTomorrow}`);
        console.log(`   Received: ${receivedPickupDate}`);
      }
    } else {
      console.log('❌ FAILURE: Invalid response structure');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test with custom pickup date to ensure it still works
async function testCustomPickupDate() {
  console.log('\n🧪 Testing Custom Pickup Date Behavior...\n');
  
  const customDate = '2024-12-25';
  console.log(`Using custom pickup date: ${customDate}`);
  
  const params = new URLSearchParams({
    origin_pin: '700001',
    destination_pin: '110001',
    mot: 'S',
    pdt: 'B2C',
    expected_pickup_date: customDate
  });

  const url = `/api/delivery/expected-tat?${params}`;
  console.log(`Testing URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Response not OK:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received');
    
    if (data.success && data.data && data.data.pickup_date) {
      const receivedPickupDate = data.data.pickup_date;
      console.log(`📅 Received pickup date: ${receivedPickupDate}`);
      
      if (receivedPickupDate === customDate) {
        console.log('✅ SUCCESS: Custom pickup date is correctly preserved!');
      } else {
        console.log('❌ FAILURE: Custom pickup date is not correct');
        console.log(`   Expected: ${customDate}`);
        console.log(`   Received: ${receivedPickupDate}`);
      }
    } else {
      console.log('❌ FAILURE: Invalid response structure');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run both tests
async function runPickupDateTests() {
  console.log('🚀 Starting Pickup Date Tests...\n');
  
  await testDefaultPickupDate();
  await testCustomPickupDate();
  
  console.log('\n✅ Pickup Date Tests Completed!');
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.testPickupDate = {
    runPickupDateTests,
    testDefaultPickupDate,
    testCustomPickupDate,
    getTomorrowDate
  };
  
  console.log('Pickup Date Test functions loaded!');
  console.log('Usage: window.testPickupDate.runPickupDateTests()');
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runPickupDateTests,
    testDefaultPickupDate,
    testCustomPickupDate,
    getTomorrowDate
  };
}
