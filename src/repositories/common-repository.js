import DBConfig from '../config/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

export default class CommonRepository {
    constructor() {
      this.client = new Client(DBConfig);
    }
  
    async connect() {
      if (!this.client._connected) {
        await this.client.connect();
        this.client._connected = true; // Marcar como conectado
      }
    }
  
    async disconnect() {
      if (this.client._connected) {
        await this.client.end();
        this.client._connected = false;
      }
    }

    async getById(table, id) {
      await this.connect();
      const res = await this.client.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      return res.rows[0];
    }
    
    async getAll(table) {
      await this.connect();
      const res = await this.client.query(`SELECT * FROM ${table}`);
      return res.rows;
    }

    async getByField(table, field, value) {
      await this.connect();
      const res = await this.client.query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value]);
      return res.rows;
    }

    async getOneByField(table, field, value) {
      await this.connect();
      const res = await this.client.query(`SELECT * FROM ${table} WHERE ${field} = $1 LIMIT 1`, [value]);
      return res.rows[0] || null;
    }

}