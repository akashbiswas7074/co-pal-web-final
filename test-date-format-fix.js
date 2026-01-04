/**
 * Test script to verify the Delhivery date format fix
 */

async function testDelhiveryDateFormatFix() {
  console.log('🧪 Testing Delhivery Date Format Fix...\n');
  
  const testCases = [
    {
      name: "Different pin codes with default date",
      params: {
        origin_pin: "700001",
        destination_pin: "741235",
        mot: "S",
        pdt: "B2C"
      }
    },
    {
      name: "Different pin codes with specific date",
      params: {
        origin_pin: "700001", 
        destination_pin: "741235",
        mot: "S",
        pdt: "B2C",
        expected_pickup_date: "2025-07-05"
      }
    },
    {
      name: "Express delivery with different cities",
      params: {
        origin_pin: "700001",
        destination_pin: "110001", 
        mot: "E",
        pdt: "B2C"
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n=== ${testCase.name} ===`);
    
    const params = new URLSearchParams();
    Object.entries(testCase.params).forEach(([key, value]) => {
      if (value) params.append(key, value);
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
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ SUCCESS!');
        console.log('  Expected TAT:', data.data?.expected_tat);
        console.log('  Delivery Date:', data.data?.expected_delivery_date);
        console.log('  Pickup Date:', data.data?.pickup_date);
        console.log('  Fallback:', data.data?.fallback ? 'Yes (API Issue)' : 'No (API Success)');
        
        if (data.data?.error) {
          console.log('  Note:', data.data.error);
        }
      } else {
        console.log('❌ FAILED');
        console.log('  Error:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Test format validation
function testDateFormatValidation() {
  console.log('\n🔍 Testing Date Format Validation...\n');
  
  // Simulate the format function
  function formatPickupDateForDelhivery(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day} 10:00`;
    } catch (error) {
      return null;
    }
  }
  
  const testDates = [
    '2025-07-05',
    '2025-12-25', 
    '2024-01-01',
    'invalid-date',
    '2025-7-5'
  ];
  
  testDates.forEach(dateStr => {
    const formatted = formatPickupDateForDelhivery(dateStr);
    console.log(`Input: "${dateStr}" → Output: "${formatted}"`);
  });
}

// Main test function
async function runDateFormatTests() {
  console.log('🚀 Running Date Format Fix Tests...\n');
  
  testDateFormatValidation();
  await testDelhiveryDateFormatFix();
  
  console.log('\n✅ All tests completed!');
  console.log('\nExpected results:');
  console.log('- API should now work with different pin codes');
  console.log('- Dates should be automatically formatted for Delhivery');
  console.log('- No more 400 "expected_pd should be in \'%Y-%m-%d %H:%M\' format" errors');
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.testDateFormatFix = {
    runDateFormatTests,
    testDelhiveryDateFormatFix,
    testDateFormatValidation
  };
  
  console.log('Date Format Fix Test functions loaded!');
  console.log('Usage: window.testDateFormatFix.runDateFormatTests()');
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runDateFormatTests,
    testDelhiveryDateFormatFix,
    testDateFormatValidation
  };
}
