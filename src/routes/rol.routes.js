import { Router } from 'express';
import { getRol, getRols, updateRol,deleteRol, newRol } from '../controllers/rol.controllers.js';

const router = Router();
router.get('/rols', getRols);
router.get('/rols/:id', getRol);
router.delete('/rols/:id', deleteRol);
router.post('/rols', newRol);
router.put('/rols/:id',updateRol );


export default router;