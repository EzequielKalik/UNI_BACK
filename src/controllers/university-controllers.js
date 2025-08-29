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

export default router;
