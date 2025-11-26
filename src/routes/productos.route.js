import { Router } from 'express';
import {
  createProducto,
  listProductos,
  getProductoById,
  getProductoByTitulo,
  updateProducto,
  softDeleteProducto,
  deleteImagenProducto,
  getMisProductos,
  getTalleresPublicos,
  getDetalleTaller,
  getTopProductos
} from "../controllers/productos.controllers.js";

import { requireAuth } from "../middlewares/auth.js"; 
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();


router.get("/productos/mis-productos", requireAuth, requireRole("Representante"), getMisProductos);
router.get("/productos/top", getTopProductos);
router.get("/productos/by-titulo/:titulo", getProductoByTitulo);
router.get("/talleres-publicos", getTalleresPublicos);
router.get("/talleres/:id", getDetalleTaller);
router.get("/productos", listProductos);

router.get("/productos/:id", getProductoById);


router.post("/productos", requireAuth, requireRole("Representante"), createProducto);
router.put("/productos/:id", requireAuth, requireRole("Representante"), updateProducto);

router.patch("/productos/:id/desactivar", requireAuth, requireRole("Representante"), softDeleteProducto);
router.delete("/productos/:id/imagen/:imagenId", requireRole("Representante"), deleteImagenProducto);

export default router;