// Test script for Pincode Serviceability API
// This demonstrates how to test the pincode check functionality

const testPincode = async (pincode) => {
  try {
    const response = await fetch(`/api/delivery/check-pincode?pincode=${pincode}`);
    const data = await response.json();
    
    console.log(`Testing pincode: ${pincode}`);
    console.log('Response:', data);
    console.log('Serviceable:', data.serviceability);
    console.log('Message:', data.message);
    console.log('---');
    
    return data;
  } catch (error) {
    console.error('Error testing pincode:', error);
  }
};

// Example usage (run in browser console):
// testPincode('110001'); // Delhi - should be serviceable
// testPincode('400001'); // Mumbai - should be serviceable  
// testPincode('194103'); // Kashmir - as per your example
// testPincode('000000'); // Invalid - should not be serviceable

export { testPincode };
