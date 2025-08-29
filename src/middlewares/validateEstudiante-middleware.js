import { StatusCodes } from 'http-status-codes';

const tiposPermitidos = ['Estudiante', 'Universidad'];

export const validateRegistro = (req, res, next) => {
  const { tipo, nombreusuario, mail, contraseña } = req.body;

  if (!tipo || !nombreusuario || !mail || !contraseña) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Todos los campos son obligatorios.' });
  }

  if (!tiposPermitidos.includes(tipo)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}` });
  }

  if (contraseña.length < 6) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!mailRegex.test(mail)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El mail no tiene un formato válido.' });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { mail, contraseña } = req.body;

  if (!mail || !contraseña) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El mail y la contraseña son obligatorios.' });
  }

  next();
};

export const validateEstudiante = (req, res, next) => {
  const estudiante = req.body.estudiante;

  if (!estudiante) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Faltan los datos del estudiante.' });
  }

  const { nombre, apellido, fechanac, foto} = estudiante;

  if (!nombre || !apellido || !fechanac) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Todos los campos del estudiante son obligatorios.' });
  }

  if (typeof nombre !== 'string' || typeof apellido !== 'string') {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Nombre y apellido deben ser textos.' });
  }

  const fecha = new Date(fechanac);
  if (isNaN(fecha.getTime())) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'La fecha de nacimiento no es válida.' });
  }

  
  next();
}