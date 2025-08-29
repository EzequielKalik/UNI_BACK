import DBConfig from '../config/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

export default class UniversityRepository {
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
 
    async getAllExpanded() {
      await this.connect();
      const sql = `
        SELECT
          u.id, u.nombre, u.tipo, u.ubicacion, u.foto, u.descripcion, u.sitioweb,
          u.idusuario, u.direccion, u.contacto_mail, u.contacto_telefono, u.sitio_web,
          u.instagram, u.linkedin, u.twitter, u.facebook, u.foto_banner, u.galeria_fotos,
          u.cantidad_alumnos, u.ano_fundacion, u.eventos_proximos,
          COALESCE(
            json_agg(
              json_build_object(
                'id', c.id,
                'nombre', c.nombre,
                'descripcion', c.descripcion,
                'foto', c.foto,
                'id_categoria', c.id_categoria,
                'duracion', cxu.duracion,
                'costo', cxu.costo,
                'modalidad', cxu.modalidad,
                'requisitos', cxu.requisitos,
                'titulo_otorgado', cxu.titulo_otorgado,
                'sede', cxu.sede,
                'materias_destacadas', cxu.materias_destacadas
              )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::json
          ) AS carreras
        FROM universidades u
        LEFT JOIN carrerasxuniversidades cxu ON cxu.iduniversidad = u.id
        LEFT JOIN carreras c ON c.id = cxu.idcarrera
        GROUP BY u.id, u.nombre, u.tipo, u.ubicacion, u.foto, u.descripcion, u.sitioweb,
                 u.idusuario, u.direccion, u.contacto_mail, u.contacto_telefono, u.sitio_web,
                 u.instagram, u.linkedin, u.twitter, u.facebook, u.foto_banner, u.galeria_fotos,
                 u.cantidad_alumnos, u.ano_fundacion, u.eventos_proximos
        ORDER BY u.id
      `;
      const res = await this.client.query(sql);
      return res.rows;
    }

    async getByIdExpanded(id) {
      await this.connect();
      const sql = `
        SELECT
          u.id, u.nombre, u.tipo, u.ubicacion, u.foto, u.descripcion, u.sitioweb,
          u.idusuario, u.direccion, u.contacto_mail, u.contacto_telefono, u.sitio_web,
          u.instagram, u.linkedin, u.twitter, u.facebook, u.foto_banner, u.galeria_fotos,
          u.cantidad_alumnos, u.ano_fundacion, u.eventos_proximos,
          COALESCE(
            json_agg(
              json_build_object(
                'id', c.id,
                'nombre', c.nombre,
                'descripcion', c.descripcion,
                'foto', c.foto,
                'id_categoria', c.id_categoria,
                'duracion', cxu.duracion,
                'costo', cxu.costo,
                'modalidad', cxu.modalidad,
                'requisitos', cxu.requisitos,
                'titulo_otorgado', cxu.titulo_otorgado,
                'sede', cxu.sede,
                'materias_destacadas', cxu.materias_destacadas
              )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::json
          ) AS carreras
        FROM universidades u
        LEFT JOIN carrerasxuniversidades cxu ON cxu.iduniversidad = u.id
        LEFT JOIN carreras c ON c.id = cxu.idcarrera
        WHERE u.id = $1
        GROUP BY u.id, u.nombre, u.tipo, u.ubicacion, u.foto, u.descripcion, u.sitioweb,
                 u.idusuario, u.direccion, u.contacto_mail, u.contacto_telefono, u.sitio_web,
                 u.instagram, u.linkedin, u.twitter, u.facebook, u.foto_banner, u.galeria_fotos,
                 u.cantidad_alumnos, u.ano_fundacion, u.eventos_proximos
        ORDER BY u.id
      `;
      const res = await this.client.query(sql, [id]);
      return res.rows[0] || null;
    }

    async getCarrerasByUniversidad(idUniversidad) {
      await this.connect();
      const sql = `
        SELECT c.id, c.nombre, c.descripcion, c.foto, c.id_categoria,
               cxu.duracion, cxu.costo, cxu.modalidad, cxu.requisitos,
               cxu.titulo_otorgado, cxu.sede, cxu.materias_destacadas
        FROM carrerasxuniversidades cxu
        JOIN carreras c ON c.id = cxu.idcarrera
        WHERE cxu.iduniversidad = $1
        ORDER BY c.id
      `;
      const res = await this.client.query(sql, [idUniversidad]);
      return res.rows;
    }

    async getCarrerasWithCategorias(idUniversidad) {
      await this.connect();
      const sql = `
        SELECT 
          c.id, c.nombre, c.descripcion, c.foto, c.id_categoria,
          cat.nombre as categoria_nombre,
          cat.descripcion as categoria_descripcion,
          cxu.duracion, cxu.costo, cxu.modalidad, cxu.requisitos,
          cxu.titulo_otorgado, cxu.sede, cxu.materias_destacadas
        FROM carrerasxuniversidades cxu
        JOIN carreras c ON c.id = cxu.idcarrera
        LEFT JOIN categorias cat ON c.id_categoria = cat.id
        WHERE cxu.iduniversidad = $1
        ORDER BY c.id
      `;
      const res = await this.client.query(sql, [idUniversidad]);
      return res.rows;
    }
}