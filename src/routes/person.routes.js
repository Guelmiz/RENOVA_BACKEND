import { Router } from 'express';
import { getPersonas, getPersona, addPersona } from '../controllers/person.controllers.js';
const router = Router();

router.get('/personas',getPersonas);
router.get('/personas',getPersona);
router.post('/personas',addPersona);
export default router;