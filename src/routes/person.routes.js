import { Router } from 'express';
import { getPersonas, getPersona, addPersona, updatePersona,deletePersona } from '../controllers/person.controllers.js';
const router = Router();

router.get('/personas',getPersonas);
router.get('/personas',getPersona);
router.post('/personas',addPersona);
router.put('/personas/:id',updatePersona);  
router.delete('/personas/:id',deletePersona);   
export default router;