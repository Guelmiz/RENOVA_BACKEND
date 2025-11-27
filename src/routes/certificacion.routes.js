import { Route, Router } from "express";
import { getcertificaciones, getcertificacion, updatecertificacion, deletecertificacion, createcertificacion } from "../controllers/certificacion.controllers.js";

const router = Router();
router.get('/certificaciones', getcertificaciones);
router.get('/certificacion/:id', getcertificacion);
router.post('/certificacion', createcertificacion);
router.put('/certificacion/:id', updatecertificacion);
router.delete('/certificacion/:id', deletecertificacion);

export default router;