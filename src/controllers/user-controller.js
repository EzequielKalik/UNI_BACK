import { Router } from 'express';
import UserService from '../services/user-service.js';
import { validateEstudiante, validateRegistro, validateLogin } from '../middlewares/validateEstudiante-middleware.js';
import { StatusCodes } from 'http-status-codes';

const router = Router();
const service = new UserService();

router.post('/register', validateRegistro, validateEstudiante, async (req, res) => {
  try {
    const { estudiante, ...usuarioData } = req.body;

    const usuarioCreado = await service.registro(usuarioData);

    const estudianteCreado = await service.registrarEstudiante({
      ...estudiante,
      mail: usuarioData.mail,
      idusuario: usuarioCreado.id // lo obtenés recién ahora
    });

    res.status(StatusCodes.CREATED).json({
      message: 'Registro completo exitoso',
      usuario: usuarioCreado,
      estudiante: estudianteCreado
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
  
});

router.post('/login', validateLogin, async (req, res) => {
  const result = await service.login(req.body); // le pasás { mail, contraseña }
  return res.status(result.status).json(result.body);
});

router.get('/validate-existence', async (req, res) => {
  try {
    const { mail, nombreusuario } = req.query;
    const result = await service.validateExistence(mail, nombreusuario);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || 'Error interno del servidor.' });
  }
});


router.post('/estudiantes', async (req, res) => {
  await service.registrarEstudiante(req.body);
  res.status(201).json({ message: 'Estudiante registrado', estudiante: req.body });
});

export default router;
