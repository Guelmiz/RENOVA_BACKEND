import { Router } from 'express';
import { 
    createResena, 
    listResenasByProducto, 
    resumenResenasProducto,
    deleteResena 
} from '../controllers/resena.controllers.js'; 
import { requireAuth} from '../middlewares/auth.js';
import{requireRole} from '../middlewares/requireRole.js';
 
const router = Router();


router.post('/resenas', requireAuth,requireRole("CLIENTE"), createResena);

router.get('/resenas/producto/:productoId', listResenasByProducto);


router.get('/resenas/resumen/:productoId', resumenResenasProducto);


router.delete('/resenas/:id', requireAuth, deleteResena);

export default router;