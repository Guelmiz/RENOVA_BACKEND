import { Router } from 'express';
import { createPedido, getPedidoTicketPDF, getAllPedidos, updateEstadoPedido } from '../controllers/pedido.controllers.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth); 


router.post('/pedidos', createPedido);


router.get('/pedidos/:id/ticket', getPedidoTicketPDF);
router.get('/pedidos', getAllPedidos);

router.put('/pedidos/:id', updateEstadoPedido);
export default router;