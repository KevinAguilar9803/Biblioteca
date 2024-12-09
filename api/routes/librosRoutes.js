const express = require('express');
const router = express.Router();
const { obtenerLibros, agregarLibro, obtenerLibro, actualizarLibro, eliminarLibro } = require('../controllers/librosController');

router.get('/', obtenerLibros);
router.get('/:id', obtenerLibro);
router.post('/', agregarLibro);
router.put('/:id', actualizarLibro);
router.put('/delete/:id', eliminarLibro);

module.exports = router;
