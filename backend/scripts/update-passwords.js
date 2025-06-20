/**
 * Script to update password hashes for default users
 * This script will generate bcrypt hashes for the default passwords
 * and update the users in the database
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'karangue221'
};

// User data
const users = [
  {
    email: 'admin@karangue221.com',
    password: 'karangue_owner_2025',
    role: 'owner'
  },
  {
    email: 'manager@karangue221.com',
    password: 'karangue_admin_2025',
    role: 'admin'
  }
];

// Salt rounds for bcrypt
const saltRounds = 10;

async function updateUserPasswords() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');
    
    // Process each user
    for (const user of users) {
      console.log(`Updating password for ${user.email}...`);
      
      // Generate hash
      const hash = await bcrypt.hash(user.password, saltRounds);
      console.log(`Generated hash: ${hash}`);
      
      // Update user in database
      const [result] = await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hash, user.email]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ Successfully updated password for ${user.email} (${user.role})`);
      } else {
        console.log(`❌ User ${user.email} not found in the database`);
      }
    }
    
    // Verify users
    const [rows] = await connection.execute('SELECT id, name, email, role, status FROM users WHERE email IN (?, ?)', 
      [users[0].email, users[1].email]);
    
    console.log('\nVerifying users in database:');
    console.table(rows);
    
    console.log('\nCredentials for login:');
    for (const user of users) {
      console.log(`- ${user.email}: ${user.password} (${user.role})`);
    }
    
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the update
updateUserPasswords();
