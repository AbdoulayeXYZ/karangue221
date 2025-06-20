const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'karangue221',
  multipleStatements: true
};

// Migration files in execution order
const migrationFiles = [
  '01_fix_redundancy_and_add_reference_tables.sql',
  '02_add_new_tables_and_enhance_existing.sql',
  'add_default_users.sql'
];

// Function to run migrations
async function runMigrations() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');
    
    // Run each migration file in order
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, '..', 'migrations', file);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`Migration file ${file} not found, skipping...`);
        continue;
      }
      
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL
      const [results] = await connection.query(sql);
      console.log(`Migration ${file} completed successfully`);
      
      // Log any messages from the migration script
      if (results && Array.isArray(results)) {
        results.forEach(result => {
          if (result.log_message) {
            console.log(`  ${result.log_message}`);
          }
        });
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run migrations
runMigrations();
