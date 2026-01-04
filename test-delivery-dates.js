/**
 * Test script to verify delivery date calculation
 */

// Test the date calculation functions
function testDeliveryDateCalculation() {
  console.log('🧪 Testing Delivery Date Calculation...\n');
  
  // Test TAT extraction
  const testTatStrings = [
    '1 business day',
    '2 business days', 
    '3-5 business days',
    '1 day',
    '7 days',
    '2',
    'Same day delivery',
    'Express delivery',
    null,
    undefined
  ];
  
  console.log('=== Testing TAT Extraction ===');
  testTatStrings.forEach(tatString => {
    // Simulate the extraction function
    const extractTatDays = (tatString) => {
      if (!tatString) return 3;
      
      const str = String(tatString).toLowerCase();
      
      const patterns = [
        /(\d+)\s*(?:business\s*)?days?/,
        /(\d+)-(\d+)\s*(?:business\s*)?days?/,
        /(\d+)\s*(?:business\s*)?day/,
        /(\d+)/
      ];
      
      for (const pattern of patterns) {
        const match = str.match(pattern);
        if (match) {
          if (match[2]) {
            return parseInt(match[2]);
          } else {
            return parseInt(match[1]);
          }
        }
      }
      
      return 3;
    };
    
    const days = extractTatDays(tatString);
    console.log(`"${tatString}" → ${days} days`);
  });
  
  // Test date calculation
  console.log('\n=== Testing Date Calculation ===');
  
  const calculateDeliveryDate = (pickupDateStr, tatDays) => {
    try {
      const pickupDate = new Date(pickupDateStr.split(' ')[0]);
      
      if (isNaN(pickupDate.getTime())) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        pickupDate.setTime(tomorrow.getTime());
      }
      
      let businessDaysAdded = 0;
      const deliveryDate = new Date(pickupDate);
      
      while (businessDaysAdded < tatDays) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        
        const dayOfWeek = deliveryDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDaysAdded++;
        }
      }
      
      return deliveryDate.toISOString().split('T')[0];
    } catch (error) {
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + tatDays);
      return fallbackDate.toISOString().split('T')[0];
    }
  };
  
  const testCases = [
    { pickup: '2025-07-04', tat: 1, description: '1 business day from Friday' },
    { pickup: '2025-07-07', tat: 1, description: '1 business day from Monday' }, 
    { pickup: '2025-07-04', tat: 3, description: '3 business days from Friday' },
    { pickup: '2025-07-04', tat: 5, description: '5 business days from Friday' }
  ];
  
  testCases.forEach(({ pickup, tat, description }) => {
    const result = calculateDeliveryDate(pickup, tat);
    const deliveryDay = new Date(result).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
    console.log(`${description}: ${pickup} → ${result} (${deliveryDay})`);
  });
}

// Test API with actual delivery date calculation
async function testApiWithDateCalculation() {
  console.log('\n🧪 Testing API with Date Calculation...\n');
  
  const testCases = [
    {
      name: "Test 1: Different cities (should show actual date)",
      params: {
        origin_pin: "700001",
        destination_pin: "110001",
        mot: "S",
        pdt: "B2C"
      }
    },
    {
      name: "Test 2: Express delivery (should show faster date)",
      params: {
        origin_pin: "700001", 
        destination_pin: "400001",
        mot: "E",
        pdt: "B2C"
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`=== ${testCase.name} ===`);
    
    const params = new URLSearchParams();
    Object.entries(testCase.params).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const url = `/api/delivery/expected-tat?${params}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Success!');
        console.log('  TAT:', data.data.expected_tat);
        console.log('  Delivery Date:', data.data.expected_delivery_date);
        console.log('  Pickup Date:', data.data.pickup_date);
        console.log('  Fallback:', data.data.fallback ? 'Yes' : 'No');
        
        if (data.data.expected_delivery_date) {
          const deliveryDay = new Date(data.data.expected_delivery_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short', 
            day: 'numeric'
          });
          console.log('  Formatted:', deliveryDay);
        }
      } else {
        console.log('❌ Failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Main test function
async function runDeliveryDateTests() {
  console.log('🚀 Running Delivery Date Calculation Tests...\n');
  
  testDeliveryDateCalculation();
  await testApiWithDateCalculation();
  
  console.log('\n✅ All tests completed!');
  console.log('\nExpected improvements:');
  console.log('- Instead of "1 business day", should show "Expected delivery by Monday, Jul 7"');
  console.log('- Delivery dates should account for weekends');
  console.log('- Express delivery should show faster dates');
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.testDeliveryDates = {
    runDeliveryDateTests,
    testDeliveryDateCalculation,
    testApiWithDateCalculation
  };
  
  console.log('Delivery Date Test functions loaded!');
  console.log('Usage: window.testDeliveryDates.runDeliveryDateTests()');
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runDeliveryDateTests,
    testDeliveryDateCalculation,
    testApiWithDateCalculation
  };
}
