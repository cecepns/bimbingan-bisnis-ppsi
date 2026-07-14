const mysql = require('mysql2/promise');

async function test() {
  try {
    const config = {
      host: "103.247.8.219",
      user: "kinq6231_ppsi",
      password: "kinq6231_ppsi",
      database: "kinq6231_ppsi",
    };
    console.log('Connecting to remote DB with config:', config);
    const connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('Query test solution:', rows[0].solution);
    const [users] = await connection.query('SELECT COUNT(*) as cnt FROM users');
    console.log('Users count:', users[0].cnt);
    await connection.end();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

test();
