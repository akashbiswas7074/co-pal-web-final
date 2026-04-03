// Simple test to check API endpoint
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:3001/api/delivery/expected-tat?origin_pin=700001&destination_pin=110001&mot=S&pdt=B2C', {
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Failed to parse as JSON:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
