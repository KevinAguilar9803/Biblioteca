const express = require('express');
const router = express.Router();
const {
  obtenerEstudiantes,
  agregarEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
  obtenerEstudiantesSancionados,
  obtenerEstudiante,
} = require('../controllers/estudiantesController');

router.get('/', obtenerEstudiantes);
router.get('/sancionados', obtenerEstudiantesSancionados);
router.get('/:id', obtenerEstudiante)
router.post('/', agregarEstudiante);
router.put('/:id', actualizarEstudiante);
router.put('/delete/:id', eliminarEstudiante);

module.exports = router;
