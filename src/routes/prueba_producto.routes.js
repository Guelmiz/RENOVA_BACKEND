import { Route, Router } from "express";

import { getProductoPruebas, getProductoPrueba, createProductoPrueba, updateProductoPrueba, deleteProductoPrueba } from "../controllers/producto_prueba.controllers.js";

const router = Router();

router.get('/producto-pruebas', getProductoPruebas);
router.get('/producto-prueba/:id', getProductoPrueba);
router.post('/producto-prueba', createProductoPrueba);
router.put('/producto-prueba/:id', updateProductoPrueba);
router.delete('/producto-prueba/:id', deleteProductoPrueba);    

export default router;  