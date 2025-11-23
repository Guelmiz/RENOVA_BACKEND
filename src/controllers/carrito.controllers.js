import { prisma } from "../db.js";
import { ok, bad, notFound } from "../helpers/helpers.js";


export const getMyCart = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // 1. Buscar carrito activo
    let carrito = await prisma.carrito.findFirst({
      where: { usuarioId, estado: "Activo" },
      include: {
        items: {
          include: {
            producto: {
              include: { imagenes: true } 
            }
          },
          orderBy: { fechaAgregado: 'asc' }
        }
      }
    });

   
    if (!carrito) {
      carrito = await prisma.carrito.create({
        data: { usuarioId, estado: "Activo" },
        include: { items: true }
      });
    }

    return ok(res, carrito);
  } catch (error) {
    console.error(error);
    return bad(res, "Error al obtener carrito");
  }
};


export const addItemToCart = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { productoId, cantidad = 1 } = req.body;

 
    let carrito = await prisma.carrito.findFirst({
      where: { usuarioId, estado: "Activo" }
    });

    if (!carrito) {
      carrito = await prisma.carrito.create({ data: { usuarioId } });
    }

   
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) return notFound(res, "Producto no encontrado");

   
    const itemExistente = await prisma.carritoProducto.findUnique({
      where: {
        carritoId_productoId: { 
          carritoId: carrito.id,
          productoId
        }
      }
    });

    if (itemExistente) {
      
      await prisma.carritoProducto.update({
        where: { id: itemExistente.id },
        data: { 
            cantidad: itemExistente.cantidad + cantidad,
            totalProducto: (itemExistente.cantidad + cantidad) * Number(producto.precio)
        }
      });
    } else {
     
      await prisma.carritoProducto.create({
        data: {
          carritoId: carrito.id,
          productoId,
          cantidad,
          precioUnitario: producto.precio,
          totalProducto: cantidad * Number(producto.precio)
        }
      });
    }

    return ok(res, { message: "Producto agregado" });
  } catch (error) {
    console.error(error);
    return bad(res, "Error al agregar al carrito");
  }
};


export const removeItemFromCart = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuarioId = req.user.id;

    const carrito = await prisma.carrito.findFirst({ where: { usuarioId, estado: "Activo" } });
    if (!carrito) return notFound(res, "Carrito no encontrado");

 
    await prisma.carritoProducto.deleteMany({
        where: {
            carritoId: carrito.id,
            productoId: productoId
        }
    });

    return ok(res, { message: "Eliminado" });
  } catch (error) {
    console.error(error);
    return bad(res, "Error al eliminar item");
  }
};


export const updateItemQuantity = async (req, res) => {
    try {
      const { productoId, cantidad } = req.body;
      const usuarioId = req.user.id;
  
      const carrito = await prisma.carrito.findFirst({ where: { usuarioId, estado: "Activo" } });
      if (!carrito) return notFound(res, "Carrito no encontrado");
  
      if (cantidad <= 0) {
          await prisma.carritoProducto.deleteMany({
              where: { carritoId: carrito.id, productoId }
          });
          return ok(res, { message: "Item eliminado por cantidad 0" });
      }

     
      const producto = await prisma.producto.findUnique({ where: { id: productoId }});

    
      const item = await prisma.carritoProducto.findUnique({
          where: { carritoId_productoId: { carritoId: carrito.id, productoId }}
      });

      if(item) {
          await prisma.carritoProducto.update({
              where: { id: item.id },
              data: { 
                  cantidad,
                  totalProducto: cantidad * Number(producto.precio)
              }
          });
      }
  
      return ok(res, { message: "Cantidad actualizada" });
    } catch (error) {
      console.error(error);
      return bad(res, "Error al actualizar cantidad");
    }
  };