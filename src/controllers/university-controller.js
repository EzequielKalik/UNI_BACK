import { Router } from 'express';
import UniversityService from '../services/university-service.js';
import { StatusCodes } from 'http-status-codes';
import { authenticateToken } from '../middlewares/auth-middleware.js';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const service = new UniversityService();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const universidades = await service.getAll();
    return res.status(StatusCodes.OK).json({ success: true, data: universidades });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const universidad = await service.getById(Number(id));
    if (!universidad) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Universidad no encontrada' });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: universidad });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
});

router.get('/:id/carreras', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const carreras = await service.getCarrerasByUniversidad(Number(id));
    if (carreras === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Universidad no encontrada' });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: carreras });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
});

router.get('/:id/carreras-with-categorias', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const carreras = await service.getCarrerasWithCategorias(Number(id));
    if (carreras === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Universidad no encontrada' });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: carreras });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
});

 const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagenes.'), false);
    }
    cb(null, true);
  }
});

// Helpers para nombre/extension seguros
function sanitizeFilename(name = '') {
  // evita paths raros y caracteres problemáticos
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getExtFrom(file) {
  const extFromName = path.extname(file?.originalname || '').toLowerCase();
  if (extFromName) return extFromName;
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/heic': '.heic',
    'image/heif': '.heif'
  };
  return map[file?.mimetype] || '.jpg';
}

const ID_PAD_WIDTH = 6;
// p. ej. 123 -> "000123" si width=6
function padId(id, width = ID_PAD_WIDTH) {
  const num = Number(id);
  return (Number.isInteger(num) && num >= 0)
    ? String(num).padStart(width, '0')
    : String(id).padStart(width, '0');
}

// YYYYMMDDHHmmssSSS (24h + milisegundos)
function nowTimestamp(d = new Date()) {
  const yyyy = d.getFullYear();
  const MM   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const HH   = String(d.getHours()).padStart(2, '0');
  const mm   = String(d.getMinutes()).padStart(2, '0');
  const ss   = String(d.getSeconds()).padStart(2, '0');
  const SSS  = String(d.getMilliseconds()).padStart(3, '0');
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}${SSS}`;
}

// Ejemplo de uso en un endpoint:
// router.post('/upload', upload.single('imagen'), (req, res) => {
//   // Puedes usar sanitizeFilename, getExtFrom, padId y nowTimestamp aquí
//   // ...
// });
// ---------- NUEVA RUTA: subir foto ----------
router.post('/:id/photo', authenticateToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
  
    try {
      // 1) Verificar que exista la universidad
      const universidad = await service.getById(Number(id));
      if (!universidad) {
        return res.status(StatusCodes.NOT_FOUND)
          .json({ success: false, message: `Universidad no encontrada (id:${id})` });
      }
  
      // 2) Validar archivo
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'No se recibió el archivo. Usa el campo "image".' });
      }
  
      // 3) Armar nombre único: id + timestamp + originalfilename + ext
      const ext         = getExtFrom(req.file);
      const original    = sanitizeFilename(req.file.originalname || `photo${ext}`);
      const paddedId    = String(id).padStart(6, '0'); // Mantengo tu formato
      const timestamp   = nowTimestamp();
      const uniqueName  = `${paddedId}-${timestamp}-${original}`;
  
      // 4) Guardar en filesystem (uploads/universities)
      const dir         = path.join(process.cwd(), 'uploads', 'universities');
      const finalPath   = path.join(dir, uniqueName);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(finalPath, req.file.buffer);
  
      // 5) Actualizar universidad con la URL pública
      const publicUrl = `/static/universities/${uniqueName}`;
      universidad.imagen = publicUrl;
  
      const rowsAffected = await service.update(universidad); // Tu TP usa update, no updateAsync
      if (rowsAffected && rowsAffected !== 0) {
        return res.status(StatusCodes.CREATED).json({
          success: true,
          id,
          filename: uniqueName,
          url: publicUrl
        });
      } else {
        // Si no se pudo actualizar la DB, limpiar el archivo creado
        await fs.rm(finalPath, { force: true });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: `No se pudo actualizar la universidad (id:${id}).` });
      }
    } catch (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Error al subir la imagen.' });
    }
    // --- Helpers que faltan ---
    function nowTimestamp(d = new Date()) {
    const yyyy = d.getFullYear();
    const MM   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const HH   = String(d.getHours()).padStart(2, '0');
    const mm   = String(d.getMinutes()).padStart(2, '0');
    const ss   = String(d.getSeconds()).padStart(2, '0');
    const SSS  = String(d.getMilliseconds()).padStart(3, '0');
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}${SSS}`;
  }
  });

export default router;
