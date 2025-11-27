import PDFDocument from "pdfkit";
import { prisma } from "../db.js";
import { ok, bad, notFound, created } from "../helpers/helpers.js";


export const createPedido = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    
    const carrito = await prisma.carrito.findFirst({
      where: { usuarioId, estado: "Activo" },
      include: { items: { include: { producto: true } } }
    });

    if (!carrito || carrito.items.length === 0) {
      return bad(res, "No hay un carrito activo o está vacío");
    }

    
    const nuevoPedido = await prisma.$transaction(async (tx) => {
      
      
      const total = carrito.items.reduce((acc, item) => {
        return acc + (Number(item.precioUnitario) * item.cantidad);
      }, 0);

      
      const pedido = await tx.pedido.create({
        data: {
          usuarioId,
          carritoId: carrito.id,
          total: total,
          estado: "pendiente",
          items: {
            create: carrito.items.map(item => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              totalProducto: item.totalProducto
            }))
          }
        }
      });

     
      for (const item of carrito.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } }
        });
      }

    
      await tx.carrito.update({
        where: { id: carrito.id },
        data: { estado: "Convertido" }
      });

   
      await tx.ticketRetiro.create({
        data: {
          pedidoId: pedido.id,
          usuarioId,
          estado: "pendiente",
          codigoRetiro: `TICKET-${pedido.id.split('-')[0].toUpperCase()}`, 
          puntoRetiro: "Sucursal Principal" 
        }
      });

      return pedido;
    });

    return created(res, { id: nuevoPedido.id, message: "Pedido creado correctamente" });

  } catch (error) {
    console.error("Error creando pedido:", error);
    
    if (error.code === 'P2025') {
        return bad(res, "Uno de los productos ya no tiene stock suficiente.");
    }
    return bad(res, "Error al procesar el pedido");
  }
};


export const getPedidoTicketPDF = async (req, res) => {
    try {
        const { id } = req.params; 

        
        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                usuario: {
                    include: { persona: true } 
                },
                items: {
                    include: { producto: true } 
                },
                tickets: true 
            }
        });

        if (!pedido) return notFound(res, "Pedido no encontrado");

        
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

     
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${pedido.id.substring(0,8)}.pdf`);

        doc.pipe(res); 

       
        doc.fontSize(20).text('RENOVA - Ticket de Compra', { align: 'center' });
        doc.moveDown();
        
       
        doc.fontSize(12).text(`Fecha: ${new Date(pedido.fechaPedido).toLocaleDateString()}`);
        doc.text(`Pedido ID: ${pedido.id}`);
        doc.moveDown();
        
        doc.fontSize(14).text('Datos del Cliente:', { underline: true });
        doc.fontSize(12).text(`Nombre: ${pedido.usuario.persona?.nombreCompleto || 'N/A'}`);
        doc.text(`Usuario: ${pedido.usuario.nombreUsuario}`);
        doc.text(`Email: ${pedido.usuario.email}`);
        
      
        const ticketData = pedido.tickets[0];
        if(ticketData) {
            doc.moveDown();
            doc.font('Helvetica-Bold').text(`CÓDIGO DE RETIRO: ${ticketData.codigoRetiro}`, { align: 'center' });
            doc.font('Helvetica');
        }

        doc.moveDown();
        
       
        doc.fontSize(14).text('Detalle del Pedido:', { underline: true });
        doc.moveDown(0.5);

        let y = doc.y;
    
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Producto', 50, y);
        doc.text('Cant.', 300, y);
        doc.text('Precio U.', 350, y);
        doc.text('Total', 450, y);
        
        doc.font('Helvetica');
        doc.moveDown(0.5);

       
        pedido.items.forEach(item => {
            y = doc.y;
            doc.text(item.producto.titulo.substring(0, 40), 50, y);
            doc.text(item.cantidad.toString(), 300, y);
            doc.text(`C$ ${Number(item.precioUnitario).toFixed(2)}`, 350, y);
            doc.text(`C$ ${Number(item.totalProducto).toFixed(2)}`, 450, y);
            doc.moveDown(0.5);
        });

       
        doc.moveDown();
        doc.fontSize(16).font('Helvetica-Bold').text(`TOTAL A PAGAR: C$ ${Number(pedido.total).toFixed(2)}`, { align: 'right' });

        // 5. Footer
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica').text('Gracias por comprar en RENOVA. Presente este ticket en caja.', { align: 'center' });

        doc.end(); 
    } catch (error) {
        console.error(error);
       
        if (!res.headersSent) return bad(res, "Error generando PDF");
    }
};


export const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      orderBy: { fechaPedido: 'desc' },
      include: {
        usuario: {
          include: { persona: true } 
        },
        items: {
          include: { producto: true }
        }
      }
    });
    return ok(res, pedidos);
  } catch (error) {
    console.error(error);
    return bad(res, "Error al listar pedidos");
  }
};


export const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; 

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { estado }
    });

    
    if (estado === 'entregado') {
        await prisma.ticketRetiro.updateMany({
            where: { pedidoId: id },
            data: { estado: 'entregado' }
        });
    }

    return ok(res, { message: `Pedido actualizado a ${estado}` });
  } catch (error) {
    console.error(error);
    return bad(res, "Error actualizando pedido");
  }
};