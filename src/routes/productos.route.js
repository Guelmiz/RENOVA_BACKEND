import { Router } from 'express';
import {
  createProducto,
  listProductos,
  getProductoById,
  getProductoByTitulo,
  updateProducto,
  softDeleteProducto,
} from "../controllers/productos.controllers.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
const router = Router();

router.get("/", listProductos);
router.get("/by-titulo/:titulo", getProductoByTitulo);
router.get("/:id", getProductoById);
router.post("/", requireAuth, requireRole("Representante"), createProducto);
router.put("/:id", requireAuth, requireRole("Representante"), updateProducto);
router.patch("/:id/desactivar", requireAuth, requireRole("Representante"), softDeleteProducto);


export default router;