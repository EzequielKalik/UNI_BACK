import DBConfig from '../config/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

export default class UserRepository {
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

  async getByEmail(mail) {
    await this.connect();
    const res = await this.client.query('SELECT * FROM usuarios WHERE mail = $1', [mail]);
    return res.rows[0];
  }

  async getByNombreUsuario(nombreusuario) {
    await this.connect();
    const res = await this.client.query('SELECT * FROM usuarios WHERE nombreusuario = $1', [nombreusuario]);
    return res.rows[0];
  }

  async createUser(usuario) {
    await this.connect();
    const sql = 'INSERT INTO Usuarios (tipo, nombreusuario, mail, contraseña, fecharegistro) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [usuario.tipo, usuario.nombreusuario, usuario.mail, usuario.contraseña, new Date()];
    const res = await this.client.query(sql, values);
    return res.rows[0];
  }

  async createEstudiante(estudiante) {
    await this.connect();
    const sql = 'INSERT INTO estudiantes (nombre, apellido, fechanac, foto, idusuario) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [estudiante.nombre, estudiante.apellido, estudiante.fechanac, estudiante.foto, estudiante.idusuario];
    const res = await this.client.query(sql, values);
    return res.rows[0];
  }
}
