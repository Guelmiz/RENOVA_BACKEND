import { Route, Router } from "express";
import { getCategoria, getCategorias, updateCategoria, deleteCategoria, createCategoria } from "../controllers/categoriaproducto.contollers.js";

const router = Router();
router.get('/categorias', getCategorias);
router.get('/categoria/:id', getCategoria);
router.post('/categoria', createCategoria);
router.put('/categoria/:id', updateCategoria);
router.delete('/categoria/:id', deleteCategoria);

export default router;