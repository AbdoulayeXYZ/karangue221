/**
 * Test script for dashboard API
 * This script tests the dashboard endpoints to ensure they're working correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual test token

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API...\n');

  try {
    // Test 1: Get dashboard summary
    console.log('📊 Test 1: Getting dashboard summary...');
    const summaryResponse = await axios.get(`${BASE_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ Dashboard summary response:', {
      status: summaryResponse.status,
      dataLength: summaryResponse.data.length,
      data: summaryResponse.data
    });

    // Test 2: Force refresh dashboard
    console.log('\n🔄 Test 2: Force refreshing dashboard...');
    const refreshResponse = await axios.post(`${BASE_URL}/dashboard/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard refresh response:', {
      status: refreshResponse.status,
      success: refreshResponse.data.success,
      message: refreshResponse.data.message
    });

    // Test 3: Get updated summary after refresh
    console.log('\n📊 Test 3: Getting updated dashboard summary...');
    const updatedSummaryResponse = await axios.get(`${BASE_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ Updated dashboard summary response:', {
      status: updatedSummaryResponse.status,
      dataLength: updatedSummaryResponse.data.length,
      data: updatedSummaryResponse.data
    });

    console.log('\n🎉 All dashboard API tests passed!');

  } catch (error) {
    console.error('❌ Dashboard API test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication error - check if the test token is valid');
    }
  }
}

// Run the test
testDashboardAPI(); 