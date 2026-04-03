// Simple test to simulate the React component behavior
const fetch = require('node-fetch');

// Mock the hook functionality
async function testDeliveryDisplay(destination_pin) {
  const origin_pin = '700001';
  const mot = 'S';
  const pdt = 'B2C';
  
  try {
    const params = new URLSearchParams({
      origin_pin,
      destination_pin,
      mot,
      pdt
    });
    
    const response = await fetch(`http://localhost:3001/api/delivery/expected-tat?${params}`);
    const result = await response.json();
    
    console.log(`📦 Testing delivery display for pincode ${destination_pin}:`);
    console.log(`   API Response:`, JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      const data = result.data;
      
      // Mock the formatting functions like in the React component
      const formatDeliveryDate = (deliveryDate) => {
        if (!deliveryDate) return '';
        
        try {
          const date = new Date(deliveryDate);
          if (isNaN(date.getTime())) return String(deliveryDate);
          
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          });
        } catch (error) {
          return String(deliveryDate);
        }
      };
      
      const getDeliveryMessage = (tatData) => {
        if (!tatData) return '';
        
        const { expected_tat, expected_delivery_date } = tatData;
        
        if (expected_delivery_date) {
          const formattedDate = formatDeliveryDate(expected_delivery_date);
          if (formattedDate) {
            return `Expected delivery by ${formattedDate}`;
          }
        }
        
        return `Expected delivery: ${expected_tat}`;
      };
      
      const formattedDate = data.expected_delivery_date ? formatDeliveryDate(data.expected_delivery_date) : '';
      const deliveryMessage = getDeliveryMessage(data);
      
      console.log(`   ✅ Expected TAT: ${data.expected_tat}`);
      console.log(`   📅 Expected Delivery Date: ${data.expected_delivery_date}`);
      console.log(`   📆 Formatted Date: ${formattedDate}`);
      console.log(`   💬 UI Message: "${deliveryMessage}"`);
      
      // Check what the component would display
      const componentDisplayText = formattedDate ? deliveryMessage : `Expected delivery: ${data.expected_tat}`;
      console.log(`   🖥️  Component Display: "${componentDisplayText}"`);
      
      return componentDisplayText;
    }
    
  } catch (error) {
    console.error(`❌ Error testing delivery display:`, error.message);
  }
}

// Test with different pincodes
async function runTests() {
  const testPincodes = [
    '741235', // 1 business day
    '110001', // 4 business days
    '560001', // Different city
    '400001'  // Another city
  ];
  
  console.log('🧪 Testing delivery display behavior...\n');
  
  for (const pincode of testPincodes) {
    await testDeliveryDisplay(pincode);
    console.log('   ' + '─'.repeat(80));
  }
}

runTests().catch(console.error);
