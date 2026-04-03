// Test script to verify shipping calculation
const testShipping = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/delivery/freight-estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dimensions: [{
          length_cm: 20,
          width_cm: 15,
          height_cm: 10,
          box_count: 1
        }],
        weight_g: 500,
        source_pin: '700001',
        consignee_pin: '110001',
        payment_mode: 'prepaid',
        inv_amount: 1000
      })
    });

    const data = await response.json();
    console.log('Shipping calculation result:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testShipping();
