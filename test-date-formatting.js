// Test the date formatting functions
const formatDeliveryDate = (deliveryDate) => {
  if (!deliveryDate) return '';
  
  try {
    const date = new Date(deliveryDate);
    if (isNaN(date.getTime())) return String(deliveryDate);
    
    // Format as "Monday, Dec 25" for better readability
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

// Test cases
const testCases = [
  {
    name: "1 business day case",
    data: {
      expected_tat: "1 business day",
      expected_delivery_date: "2025-07-05"
    }
  },
  {
    name: "4 business days case",
    data: {
      expected_tat: "4 business days",
      expected_delivery_date: "2025-07-10"
    }
  },
  {
    name: "No delivery date",
    data: {
      expected_tat: "3-7 business days",
      expected_delivery_date: ""
    }
  }
];

console.log('Testing date formatting functions...\n');

testCases.forEach(testCase => {
  console.log(`📦 ${testCase.name}:`);
  console.log(`   Input: ${JSON.stringify(testCase.data)}`);
  console.log(`   Formatted date: "${formatDeliveryDate(testCase.data.expected_delivery_date)}"`);
  console.log(`   Final message: "${getDeliveryMessage(testCase.data)}"`);
  console.log('');
});
