/**
 * Diagnostic script for Expected TAT API 400 errors
 * This helps debug why Delhivery API returns 400 Bad Request
 */

// Function to diagnose the 400 error with detailed logging
async function diagnoseExpectedTatError() {
  console.log('🔍 Diagnosing Expected TAT API 400 Error...\n');
  
  // Test cases to identify the issue
  const diagnosticTests = [
    {
      name: "Test 1: Different pin codes with default date",
      params: {
        origin_pin: "700001",
        destination_pin: "110001", 
        mot: "S",
        pdt: "B2C"
      }
    },
    {
      name: "Test 2: Different pin codes with specific date",
      params: {
        origin_pin: "700001",
        destination_pin: "110001",
        mot: "S", 
        pdt: "B2C",
        expected_pickup_date: "2025-07-05"
      }
    },
    {
      name: "Test 3: Express delivery",
      params: {
        origin_pin: "700001",
        destination_pin: "400001",
        mot: "E",
        pdt: "B2C"
      }
    },
    {
      name: "Test 4: Without PDT parameter",
      params: {
        origin_pin: "700001",
        destination_pin: "110001",
        mot: "S"
      }
    },
    {
      name: "Test 5: B2B delivery",
      params: {
        origin_pin: "700001",
        destination_pin: "110001",
        mot: "S",
        pdt: "B2B"
      }
    }
  ];
  
  for (const test of diagnosticTests) {
    console.log(`\n=== ${test.name} ===`);
    
    const params = new URLSearchParams();
    Object.entries(test.params).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const url = `/api/delivery/expected-tat?${params}`;
    console.log('Request URL:', url);
    console.log('Parameters:', test.params);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response Status:', response.status);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Success!');
        console.log('  Expected TAT:', data.data?.expected_tat);
        console.log('  Fallback:', data.data?.fallback ? 'Yes' : 'No');
        if (data.data?.error) {
          console.log('  Error:', data.data.error);
        }
      } else {
        console.log('❌ Failed');
        console.log('  Error:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Function to test direct Delhivery API call format
async function testDelhiveryAPIFormat() {
  console.log('\n🔍 Testing Delhivery API Format Requirements...\n');
  
  // Test the exact format that might be required
  const testUrl = 'https://track.delhivery.com/api/dc/expected_tat';
  const testParams = new URLSearchParams({
    origin_pin: '700001',
    destination_pin: '110001',
    mot: 'S',
    pdt: 'B2C',
    expected_pickup_date: '2025-07-05'
  });
  
  console.log('Direct Delhivery URL:', `${testUrl}?${testParams}`);
  console.log('Parameters:', Object.fromEntries(testParams.entries()));
  
  console.log('\n⚠️  Note: This would require a valid Delhivery token to test directly');
  console.log('The 400 error might be due to:');
  console.log('1. Date format requirements');
  console.log('2. Invalid parameter combinations');
  console.log('3. API token issues');
  console.log('4. Missing required headers');
  console.log('5. Pin code validation by Delhivery');
}

// Function to validate common issues
function validateCommonIssues() {
  console.log('\n🔍 Validating Common Issues...\n');
  
  const commonIssues = [
    {
      issue: 'Pin code format',
      check: (pin) => /^\d{6}$/.test(pin),
      test: '700001'
    },
    {
      issue: 'Date format',
      check: (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime()),
      test: '2025-07-05'
    },
    {
      issue: 'MOT parameter',
      check: (mot) => ['S', 'E'].includes(mot),
      test: 'S'
    },
    {
      issue: 'PDT parameter',
      check: (pdt) => ['B2C', 'B2B'].includes(pdt),
      test: 'B2C'
    }
  ];
  
  commonIssues.forEach(({ issue, check, test }) => {
    const result = check(test);
    console.log(`${result ? '✅' : '❌'} ${issue}: ${test} - ${result ? 'Valid' : 'Invalid'}`);
  });
}

// Main diagnostic function
async function runFullDiagnostics() {
  console.log('🚀 Running Full Expected TAT API Diagnostics...\n');
  
  validateCommonIssues();
  await diagnoseExpectedTatError();
  testDelhiveryAPIFormat();
  
  console.log('\n✅ Diagnostics completed!');
  console.log('\nRecommendations:');
  console.log('1. Check server logs for detailed Delhivery error responses');
  console.log('2. Verify Delhivery token is valid');
  console.log('3. Test with different pin code combinations');
  console.log('4. Check if Delhivery API documentation has updated requirements');
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.diagnosticExpectedTat = {
    runFullDiagnostics,
    diagnoseExpectedTatError,
    testDelhiveryAPIFormat,
    validateCommonIssues
  };
  
  console.log('Expected TAT Diagnostic functions loaded!');
  console.log('Usage: window.diagnosticExpectedTat.runFullDiagnostics()');
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runFullDiagnostics,
    diagnoseExpectedTatError,
    testDelhiveryAPIFormat,
    validateCommonIssues
  };
}
