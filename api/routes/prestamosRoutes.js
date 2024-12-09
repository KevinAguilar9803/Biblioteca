const express = require('express');
const router = express.Router();
const {
  obtenerPrestamos,
  agregarPrestamo,
  marcarComoDevuelto,
} = require('../controllers/prestamosController');

router.get('/', obtenerPrestamos);
router.post('/', agregarPrestamo);
router.put('/:id/devolver', marcarComoDevuelto);

module.exports = router;
