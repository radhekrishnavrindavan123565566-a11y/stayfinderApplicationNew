/**
 * Automated API Endpoint Testing
 * Tests critical endpoints with various scenarios
 */

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  scenario: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus?: number;
  error?: string;
}

const results: TestResult[] = [];

function addResult(
  endpoint: string,
  method: string,
  scenario: string,
  passed: boolean,
  expectedStatus: number,
  actualStatus?: number,
  error?: string
) {
  results.push({
    endpoint,
    method,
    scenario,
    passed,
    expectedStatus,
    actualStatus,
    error
  });
}

async function testEndpoint(
  method: string,
  endpoint: string,
  scenario: string,
  expectedStatus: number,
  headers?: Record<string, string>,
  data?: any
) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      data,
      validateStatus: () => true // Don't throw on any status
    });
    
    const passed = response.status === expectedStatus;
    addResult(endpoint, method, scenario, passed, expectedStatus, response.status);
    
    return passed;
  } catch (error: any) {
    addResult(endpoint, method, scenario, false, expectedStatus, undefined, error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 Starting API Endpoint Tests...\n');
  
  // Test 1: Public endpoints should work without auth
  console.log('📋 Testing public endpoints...');
  await testEndpoint('GET', '/api/properties', 'Public access', 200);
  
  // Test 2: Protected endpoints should return 401 without auth
  console.log('📋 Testing protected endpoints without auth...');
  await testEndpoint('GET', '/api/bookings', 'No auth token', 401);
  await testEndpoint('GET', '/api/user/profile', 'No auth token', 401);
  await testEndpoint('GET', '/api/wishlist', 'No auth token', 401);
  await testEndpoint('GET', '/api/notifications', 'No auth token', 401);
  await testEndpoint('POST', '/api/properties', 'No auth token', 401);
  
  // Test 3: Admin endpoints should return 401/403 for non-admins
  console.log('📋 Testing admin endpoints...');
  await testEndpoint('GET', '/api/admin/stats', 'No auth token', 401);
  await testEndpoint('GET', '/api/admin/users', 'No auth token', 401);
  
  // Test 4: Invalid tokens should return 401
  console.log('📋 Testing with invalid tokens...');
  await testEndpoint(
    'GET',
    '/api/bookings',
    'Invalid token',
    401,
    { Authorization: 'Bearer invalid_token_here' }
  );
  
  // Test 5: Malformed requests
  console.log('📋 Testing malformed requests...');
  await testEndpoint(
    'POST',
    '/api/bookings',
    'Missing required fields',
    400,
    { Authorization: 'Bearer test_token' },
    {}
  );
  
  // Test 6: Non-existent endpoints
  console.log('📋 Testing non-existent endpoints...');
  await testEndpoint('GET', '/api/nonexistent', 'Not found', 404);
  
  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('📊 API ENDPOINT TEST RESULTS');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('❌ FAILED TESTS:\n');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ${r.method} ${r.endpoint}`);
      console.log(`    Scenario: ${r.scenario}`);
      console.log(`    Expected: ${r.expectedStatus}, Got: ${r.actualStatus || 'Error'}`);
      if (r.error) console.log(`    Error: ${r.error}`);
      console.log();
    });
  }
  
  console.log('='.repeat(80));
  
  if (failed === 0) {
    console.log('✅ ALL API TESTS PASSED!\n');
    return true;
  } else {
    console.log('❌ SOME API TESTS FAILED!\n');
    return false;
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(BASE_URL, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`Testing API at: ${BASE_URL}`);
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('\n⚠️  Server is not running at', BASE_URL);
    console.log('Please start the server with: npm run dev');
    console.log('Then run this test again.\n');
    process.exit(1);
  }
  
  const success = await runTests();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
