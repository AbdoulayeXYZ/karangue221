/**
 * Manual dashboard refresh script
 * This script manually refreshes the dashboard data
 */

const Dashboard = require('../models/dashboardModel');

async function refreshDashboard() {
  console.log('🔄 Manually refreshing dashboard data...\n');
  
  try {
    // Check current dashboard data
    console.log('📊 Current dashboard data:');
    const currentData = await Dashboard.getSummary();
    console.log(`Found ${currentData.length} dashboard records`);
    
    if (currentData.length > 0) {
      currentData.forEach(record => {
        console.log(`- ${record.fleet_name}: ${record.total_vehicles} vehicles, ${record.total_drivers} drivers`);
      });
    }
    
    console.log('\n🔄 Refreshing dashboard data...');
    const success = await Dashboard.refreshDashboard();
    
    if (success) {
      console.log('✅ Dashboard refresh successful!');
      
      // Show updated data
      console.log('\n📊 Updated dashboard data:');
      const updatedData = await Dashboard.getSummary();
      console.log(`Found ${updatedData.length} dashboard records`);
      
      if (updatedData.length > 0) {
        updatedData.forEach(record => {
          console.log(`- ${record.fleet_name}: ${record.total_vehicles} vehicles, ${record.total_drivers} drivers`);
        });
      }
    } else {
      console.error('❌ Dashboard refresh failed');
    }
    
  } catch (error) {
    console.error('❌ Error refreshing dashboard:', error);
  }
}

// Run the refresh
refreshDashboard(); 