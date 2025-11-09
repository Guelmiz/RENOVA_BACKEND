import { Route, Router } from "express";
import { getPrueba, getPruebas, updatePrueba, deletePrueba, createPrueba } from "../controllers/prueba.controllers.js";

const router = Router();
router.get('/pruebas', getPruebas);
router.get('/prueba/:id', getPrueba);
router.post('/prueba', createPrueba);
router.put('/prueba/:id', updatePrueba);
router.delete('/prueba/:id', deletePrueba);

export default router;