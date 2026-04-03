/**
 * Test different pin code combinations for Expected TAT API
 */

// Test with different pin codes to avoid same origin/destination
const testCases = [
  {
    name: "Kolkata to Delhi",
    origin_pin: "700001",
    destination_pin: "110001",
    mot: "S",
    pdt: "B2C"
  },
  {
    name: "Delhi to Mumbai",
    origin_pin: "110001", 
    destination_pin: "400001",
    mot: "S",
    pdt: "B2C"
  },
  {
    name: "Mumbai to Bangalore",
    origin_pin: "400001",
    destination_pin: "560001", 
    mot: "E",
    pdt: "B2C"
  },
  {
    name: "Same pin codes (should handle gracefully)",
    origin_pin: "700001",
    destination_pin: "700001",
    mot: "S", 
    pdt: "B2C"
  }
];

async function testDifferentPinCodes() {
  console.log('🧪 Testing Different Pin Code Combinations...\n');
  
  for (const testCase of testCases) {
    console.log(`\n=== Testing: ${testCase.name} ===`);
    
    const params = new URLSearchParams({
      origin_pin: testCase.origin_pin,
      destination_pin: testCase.destination_pin,
      mot: testCase.mot,
      pdt: testCase.pdt
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

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error Text:', errorText);
        continue;
      }

      const data = await response.json();
      console.log('✅ Success Response:');
      console.log('  Expected TAT:', data.data?.expected_tat);
      console.log('  Delivery Date:', data.data?.expected_delivery_date);
      console.log('  Pickup Date:', data.data?.pickup_date);
      console.log('  Fallback:', data.data?.fallback ? 'Yes' : 'No');
      if (data.data?.error) {
        console.log('  Error:', data.data.error);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error.message);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.testPinCodes = {
    testDifferentPinCodes,
    testCases
  };
  
  console.log('Pin Code Test functions loaded!');
  console.log('Usage: window.testPinCodes.testDifferentPinCodes()');
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDifferentPinCodes,
    testCases
  };
}
