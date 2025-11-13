import { Router } from 'express';
import {
  listResenas,
  getResenaById,
  createResena,
  updateResena,
  deleteResena,
  listResenasByProducto,
  listResenasByUsuario,
  moderarResena,
  resumenResenasProducto
} from '../controllers/resena.controllers.js';

const router = Router();

router.get('/resenas', listResenas);
router.post('/resenas', createResena);


router.get('/resenas/:id', getResenaById);
router.put('/resenas/:id', updateResena);
router.delete('/resenas/:id', deleteResena);


router.get('/productos/:productoId/resenas', listResenasByProducto);
router.get('/usuarios/:usuarioId/resenas', listResenasByUsuario);


router.put('/resenas/:id/moderar', moderarResena);


router.get('/productos/:productoId/resenas/resumen', resumenResenasProducto);

export default router;
