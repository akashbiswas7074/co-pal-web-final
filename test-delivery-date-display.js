// Test script to verify delivery date display
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/delivery/expected-tat';
const TEST_CASES = [
  {
    name: 'Kolkata to Delhi',
    origin_pin: '700001',
    destination_pin: '110001',
    mot: 'S',
    pdt: 'B2C'
  },
  {
    name: 'Mumbai to Bangalore',
    origin_pin: '400001',
    destination_pin: '560001',
    mot: 'S',
    pdt: 'B2C'
  },
  {
    name: 'Express delivery',
    origin_pin: '700001',
    destination_pin: '110001',
    mot: 'E',
    pdt: 'B2C'
  }
];

// Helper function to format date like the component does
function formatDeliveryDate(deliveryDate) {
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
}

// Helper function to get delivery message
function getDeliveryMessage(tatData) {
  if (!tatData) return '';
  
  const { expected_tat, expected_delivery_date } = tatData;
  
  if (expected_delivery_date) {
    const formattedDate = formatDeliveryDate(expected_delivery_date);
    if (formattedDate) {
      return `Expected delivery by ${formattedDate}`;
    }
  }
  
  return `Expected delivery: ${expected_tat}`;
}

async function testDeliveryDateDisplay() {
  console.log('🧪 Testing Delivery Date Display...\n');
  
  for (const testCase of TEST_CASES) {
    console.log(`\n📦 Testing ${testCase.name}:`);
    console.log(`   Origin: ${testCase.origin_pin} → Destination: ${testCase.destination_pin}`);
    console.log(`   Mode: ${testCase.mot} (${testCase.mot === 'E' ? 'Express' : 'Surface'})`);
    
    try {
      const params = new URLSearchParams({
        origin_pin: testCase.origin_pin,
        destination_pin: testCase.destination_pin,
        mot: testCase.mot,
        pdt: testCase.pdt
      });
      
      const response = await fetch(`${API_URL}?${params}`);
      const result = await response.json();
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Response:`, JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        const data = result.data;
        console.log(`   📋 TAT: ${data.expected_tat}`);
        console.log(`   📅 Expected Delivery Date: ${data.expected_delivery_date}`);
        console.log(`   📆 Formatted Date: ${formatDeliveryDate(data.expected_delivery_date)}`);
        console.log(`   💬 UI Message: "${getDeliveryMessage(data)}"`);
        console.log(`   🔄 Is Fallback: ${data.fallback ? 'Yes' : 'No'}`);
        
        // Check if we have an actual date
        if (data.expected_delivery_date) {
          const deliveryDate = new Date(data.expected_delivery_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (deliveryDate > today) {
            console.log(`   ✅ Delivery date is in the future: ${deliveryDate.toDateString()}`);
          } else {
            console.log(`   ⚠️  Delivery date is not in the future: ${deliveryDate.toDateString()}`);
          }
        } else {
          console.log(`   ❌ No expected_delivery_date provided`);
        }
      } else {
        console.log(`   ❌ API Error: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error(`   💥 Request failed:`, error.message);
    }
    
    console.log('   ' + '─'.repeat(80));
  }
}

testDeliveryDateDisplay().catch(console.error);
