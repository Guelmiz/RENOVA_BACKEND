import { Router } from 'express';
import { getMyCart, addItemToCart, removeItemFromCart, updateItemQuantity } from '../controllers/carrito.controllers.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/carrito', getMyCart);
router.post('/carrito/items', addItemToCart);
router.put('/carrito/items', updateItemQuantity);
router.delete('/carrito/items/:productoId', removeItemFromCart);

export default router;