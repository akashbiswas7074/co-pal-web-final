const fetch = require('node-fetch');

async function reproduceError() {
  const url = 'http://localhost:3000/api/order';
  
  // Minimal payload representing a cart item missing the 'product' field
  const payload = {
    cartItems: [
      {
        _id: '67bb577c3aa882cff4236b2f', // Example product ID
        name: 'SCENT-RIX Golden Aoud Extrait X',
        price: 1000,
        qty: 1,
        // 'product' field is intentionally omitted to reproduce the error
        isSample: false
      }
    ],
    shippingAddress: {
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
      address1: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'India'
    },
    paymentMethod: 'cod',
    total: 1000,
    shippingPrice: 0,
    itemsPrice: 1000
  };

  console.log('--- Reproducing Checkout Error ---');
  console.log('Calling API:', url);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const result = await response.json();

    console.log('\n--- API Response ---');
    console.log('Status:', status);
    console.log('Result:', JSON.stringify(result, null, 2));

    if (!result.success && result.message && result.message.includes('Invalid product data')) {
      console.log('\n[SUCCESS] Successfully reproduced the error!');
    } else {
      console.log('\n[FAILED] Error reproduction failed or revealed a different issue.');
    }
  } catch (error) {
    console.error('\n[ERROR] Request failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('Make sure the server is running on http://localhost:3000');
    }
  }
}

reproduceError();
