import { Router } from 'express';
import { 
    createResena, 
    listResenasByProducto, 
    resumenResenasProducto,
    deleteResena,
    moderarResena 
} from '../controllers/resena.controllers.js'; 
import { requireAuth} from '../middlewares/auth.js';
import{requireRole} from '../middlewares/requireRole.js';
 
const router = Router();


router.post('/resenas', requireAuth,requireRole("CLIENTE"), createResena);

router.get('/resenas/producto/:productoId', listResenasByProducto);


router.get('/resenas/resumen/:productoId', resumenResenasProducto);

router.put('/resenas/:id', requireAuth, requireRole("Administrador"), moderarResena);
router.delete('/resenas/:id', requireAuth, deleteResena);

export default router;