const db = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  const password = 'test1234';
  const hash = await bcrypt.hash(password, 10);
  const users = [
    {
      name: 'Owner Test',
      email: 'owner@karangue221.com',
      password_hash: hash,
      role: 'owner',
      phone: '+221771234567',
      status: 'active'
    },
    {
      name: 'Admin Test',
      email: 'admin@karangue221.com',
      password_hash: hash,
      role: 'admin',
      phone: '+221770000000',
      status: 'active'
    }
  ];
  for (const user of users) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [user.email]);
    if (rows.length === 0) {
      await db.query('INSERT INTO users SET ?', user);
      console.log(`Utilisateur ajouté : ${user.email} (${user.role})`);
    } else {
      console.log(`Utilisateur déjà existant : ${user.email}`);
    }
  }
  process.exit();
}

seed(); 