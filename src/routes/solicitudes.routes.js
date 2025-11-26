import { Router } from 'express';
import { createSolicitud, getAllSolicitudes, procesarSolicitud } from '../controllers/solicitudes.controllers.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();


router.post('/solicitudes', requireAuth, requireRole("Cliente"), createSolicitud);

router.get('/admin/solicitudes', requireAuth, requireRole("Administrador"), getAllSolicitudes);
router.put('/admin/solicitudes/:id', requireAuth, requireRole("Administrador"), procesarSolicitud);

export default router;