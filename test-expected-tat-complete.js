/**
 * Test file for Expected TAT API functionality
 * This file helps test the Expected TAT integration with various scenarios
 */

// Test cases for different scenarios
const testCases = [
  {
    name: "Delhi to Mumbai - Standard",
    origin_pin: "110001",
    destination_pin: "400001",
    mot: "S",
    pdt: "B2C"
  },
  {
    name: "Delhi to Mumbai - Express",
    origin_pin: "110001",
    destination_pin: "400001",
    mot: "E",
    pdt: "B2C"
  },
  {
    name: "Kolkata to Bangalore - Standard",
    origin_pin: "700001",
    destination_pin: "560001",
    mot: "S",
    pdt: "B2C"
  },
  {
    name: "Delhi to Chennai - With pickup date",
    origin_pin: "110001",
    destination_pin: "600001",
    mot: "S",
    pdt: "B2C",
    expected_pickup_date: "2024-12-15"
  },
  {
    name: "Delhi to Chennai - Default pickup date (1 day from now)",
    origin_pin: "110001",
    destination_pin: "600001",
    mot: "S",
    pdt: "B2C"
    // No expected_pickup_date - should default to 1 day from now
  },
  {
    name: "Invalid destination pin",
    origin_pin: "110001",
    destination_pin: "999999",
    mot: "S",
    pdt: "B2C"
  }
];

// Test function to call the API
async function testExpectedTatApi(testCase) {
  console.log(`\n=== Testing: ${testCase.name} ===`);
  
  const params = new URLSearchParams({
    origin_pin: testCase.origin_pin,
    destination_pin: testCase.destination_pin,
    mot: testCase.mot,
    pdt: testCase.pdt,
    ...(testCase.expected_pickup_date && { expected_pickup_date: testCase.expected_pickup_date })
  });

  const url = `/api/delivery/expected-tat?${params}`;
  console.log('Request URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error Text:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success Response:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (data.success && data.data) {
      console.log('✅ Valid response structure');
      console.log('📦 Expected TAT:', data.data.expected_tat);
      console.log('📅 Expected Delivery Date:', data.data.expected_delivery_date);
      console.log('🚚 Pickup Date:', data.data.pickup_date);
      console.log('⚠️ Fallback:', data.data.fallback ? 'Yes' : 'No');
      if (data.data.error) {
        console.log('❌ Error:', data.data.error);
      }
    } else {
      console.log('❌ Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
  }
}

// Test all scenarios
async function runAllTests() {
  console.log('🚀 Starting Expected TAT API Tests...\n');
  
  for (const testCase of testCases) {
    await testExpectedTatApi(testCase);
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ All tests completed!');
}

// Manual test function for custom parameters
async function testCustomParameters(origin_pin, destination_pin, mot = 'S', pdt = 'B2C', expected_pickup_date = null) {
  const customTest = {
    name: "Custom Test",
    origin_pin,
    destination_pin,
    mot,
    pdt,
    ...(expected_pickup_date && { expected_pickup_date })
  };
  
  await testExpectedTatApi(customTest);
}

// Export functions for browser console usage
if (typeof window !== 'undefined') {
  window.testExpectedTat = {
    runAllTests,
    testCustomParameters,
    testSingle: testExpectedTatApi
  };
  
  console.log('Expected TAT Test functions loaded!');
  console.log('Usage:');
  console.log('- window.testExpectedTat.runAllTests() - Run all predefined tests');
  console.log('- window.testExpectedTat.testCustomParameters("110001", "400001", "S", "B2C") - Test custom parameters');
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testCustomParameters,
    testSingle: testExpectedTatApi,
    testCases
  };
}
