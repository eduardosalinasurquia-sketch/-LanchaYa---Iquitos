const { Router } = require('express');
const { listarSalidas, obtenerSalida, crearSalida, actualizarSalida, eliminarSalida } = require('../controllers/salidas.controller');

const router = Router();
router.get('/', listarSalidas);
router.get('/:id', obtenerSalida);
router.post('/', crearSalida);
router.put('/:id', actualizarSalida);
router.delete('/:id', eliminarSalida);

module.exports = router;
