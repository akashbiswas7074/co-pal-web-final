const axios = require('axios');

async function testExpectedTatAPI() {
  console.log('Testing Expected TAT API...\n');
  
  const testCases = [
    {
      name: 'Valid Pincode Test',
      params: {
        origin_pin: '122003',
        destination_pin: '136118',
        mot: 'S',
        pdt: 'B2C',
        expected_pickup_date: '2024-07-05'
      }
    },
    {
      name: 'Missing Destination Pincode Test',
      params: {
        origin_pin: '122003',
        mot: 'S',
        pdt: 'B2C'
      }
    },
    {
      name: 'Express Mode Test',
      params: {
        origin_pin: '122003',
        destination_pin: '110001',
        mot: 'E',
        pdt: 'B2C'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 ${testCase.name}`);
    console.log('Parameters:', testCase.params);
    
    try {
      const queryParams = new URLSearchParams(testCase.params);
      const response = await axios.get(`http://localhost:3000/api/delivery/expected-tat?${queryParams}`);
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.data) {
        const { expected_tat, expected_delivery_date, fallback } = response.data.data;
        console.log(`📦 Expected TAT: ${expected_tat}`);
        console.log(`📅 Expected Delivery: ${expected_delivery_date}`);
        if (fallback) console.log('⚠️  Using fallback data');
      }
      
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// Run the test
testExpectedTatAPI().catch(console.error);
