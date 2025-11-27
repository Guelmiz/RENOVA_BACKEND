import { Route, Router } from "express";
import { getProductoCertificaciones, getProductoCertificacion, createProductoCertificacion, updateProductoCertificacion, deleteProductoCertificacion } from "../controllers/producto_certifcacion.controllers.js";

const router = Router();
router.get('/producto-certificaciones', getProductoCertificaciones);
router.get('/producto-certificacion/:id', getProductoCertificacion);
router.post('/producto-certificacion', createProductoCertificacion);
router.put('/producto-certificacion/:id', updateProductoCertificacion);
router.delete('/producto-certificacion/:id', deleteProductoCertificacion);

export default router;