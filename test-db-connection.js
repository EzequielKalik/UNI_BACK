import DBConfig from './src/config/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

async function testConnection() {
  const client = new Client(DBConfig);
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.end();
  }
}

testConnection();