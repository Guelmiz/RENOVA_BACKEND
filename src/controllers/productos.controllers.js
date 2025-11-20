import { PrismaClient, Prisma } from "@prisma/client";
import { ok, created, bad, notFound } from "../helpers/helpers.js";
const prisma = new PrismaClient();

async function findCategoriaByNombre(nombreCategoria) {
  if (!nombreCategoria) return null;
  return prisma.categoriaProducto.findFirst({
    where: { nombre: { equals: nombreCategoria, mode: "insensitive" } },
    select: { id: true, nombre: true, activa: true },
  });
}

function toIntOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function toDecimalOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  return new Prisma.Decimal(v);
}

export const createProducto = async (req, res) => {
  try {
    const {
      titulo,
      stock,
      precio,
      descripcion,
      activo,
      categoriaId, 
      imagenes = [], 
      nombreUsuario,
      pruebas = [],       
      certificaciones = [] 
    } = req.body;


    if (!titulo) return bad(res, "El título es requerido");
    if (!categoriaId) return bad(res, "La categoría es requerida");

  
    if (nombreUsuario && req.user?.nombreUsuario &&
        nombreUsuario.toLowerCase() !== req.user.nombreUsuario.toLowerCase()) {
      return bad(res, "nombreUsuario no coincide con el usuario autenticado");
    }


    const categoria = await prisma.categoriaProducto.findUnique({
        where: { id: categoriaId }
    });

    if (!categoria) return notFound(res, "Categoría no encontrada");

  
    const nuevoProducto = await prisma.$transaction(async (tx) => {
  
      const creado = await tx.producto.create({
        data: {
          titulo,
          descripcion: descripcion ?? null,
          stock: toIntOrNull(stock),
          precio: toDecimalOrNull(precio),
          activo: typeof activo === "boolean" ? activo : true,
          publicadoPorId: req.user.id,
          categoriaId: categoria.id, 
        },
      });

      if (Array.isArray(imagenes) && imagenes.length > 0) {
        const dataImgs = imagenes
          .filter((img) => img?.url)
          .map((img) => ({
            url: img.url,
            esPrincipal: Boolean(img.esPrincipal),
            productoId: creado.id,
          }));

        if (dataImgs.length > 0) {
          await tx.imagenProducto.createMany({ data: dataImgs, skipDuplicates: true });
        }
      }

      if (Array.isArray(pruebas) && pruebas.length > 0) {
        const dataPruebas = pruebas.map((pruebaId) => ({
          productoId: creado.id,
          pruebaId: pruebaId,
        }));
        await tx.productoPrueba.createMany({ data: dataPruebas, skipDuplicates: true });
      }


      if (Array.isArray(certificaciones) && certificaciones.length > 0) {
        const dataCerts = certificaciones.map((certId) => ({
          productoId: creado.id,
          certificacionId: certId,
        }));
        await tx.productoCertificacion.createMany({ data: dataCerts, skipDuplicates: true });
      }

   
      return tx.producto.findUnique({
        where: { id: creado.id },
        include: {
          categoria: { select: { id: true, nombre: true } },
          publicadoPor: { select: { id: true, nombreUsuario: true } },
          imagenes: true,
          pruebas: { include: { prueba: true } },
          certificaciones: { include: { certificacion: true } }
        },
      });
    });

    return created(res, nuevoProducto, "Producto creado exitosamente");
  } catch (err) {
    console.error("Error createProducto:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return bad(res, "Ya existe un producto con ese título");
      }
    }
    return bad(res, "Error al crear producto: " + err.message);
  }
};

export const listProductos = async (req, res) => {
  try {
    const {
      q,
      categoria,
      publisher,
      activo,
      page = 1,
      pageSize = 10,
      orderBy = "titulo:asc",
    } = req.query;

    const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (pageNum - 1) * take;

    let order = { titulo: "asc" };
    if (orderBy) {
      const [field, dirRaw] = String(orderBy).split(":");
      const dir = dirRaw?.toLowerCase() === "desc" ? "desc" : "asc";
      if (["titulo", "precio", "stock"].includes(field)) {
        order = { [field]: dir };
      }
    }

 
    const where = {
      AND: [
        q
          ? {
              OR: [
                { titulo: { contains: q, mode: "insensitive" } },
                { descripcion: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        categoria
          ? { categoria: { nombre: { equals: categoria, mode: "insensitive" } } }
          : {},
        publisher
          ? { publicadoPor: { nombreUsuario: { equals: publisher, mode: "insensitive" } } }
          : {},
        activo != null
          ? { activo: String(activo).toLowerCase() === "true" }
          : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.producto.count({ where }),
      prisma.producto.findMany({
        where,
        skip,
        take,
        orderBy: order,
        include: {
          categoria: { select: { id: true, nombre: true } },
          publicadoPor: { select: { id: true, nombreUsuario: true } },
          imagenes: true,
        },
      }),
    ]);

    return ok(res, {
      page: pageNum,
      pageSize: take,
      total,
      items,
    });
  } catch (err) {
    console.error(err);
    return bad(res, "Error al listar productos");
  }
};


export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { select: { id: true, nombre: true} },
        publicadoPor: { select: { id: true, nombreUsuario: true } },
        imagenes: true,
        certificaciones: { include: { certificacion: true } },
        pruebas: { include: { prueba: true } },
        resenas: true,
      },
    });

    if (!item) return notFound(res, "Producto no encontrado");
    return ok(res, item);
  } catch (err) {
    console.error(err);
    return bad(res, "Error al obtener producto");
  }
};

export const getProductoByTitulo = async (req, res) => {
  try {
    const { titulo } = req.params;
    const item = await prisma.producto.findUnique({
      where: { titulo },
      include: {
        categoria: { select: { id: true, nombre: true } },
        publicadoPor: { select: { id: true, nombreUsuario: true } },
        imagenes: true,
      },
    });
    if (!item) return notFound(res, "Producto no encontrado");
    return ok(res, item);
  } catch (err) {
    console.error(err);
    return bad(res, "Error al obtener producto por título");
  }
};

export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      stock,
      precio,
      descripcion,
      activo,
      nombreCategoria,
      imagenes,            
      reemplazarImagenes,  
      nombreUsuario,       
    } = req.body;

    const existing = await prisma.producto.findUnique({
      where: { id },
      select: { id: true, publicadoPorId: true, categoriaId: true },
    });
    if (!existing) return notFound(res, "Producto no encontrado");

    if (nombreUsuario && req.user?.nombreUsuario &&
        nombreUsuario.toLowerCase() !== req.user.nombreUsuario.toLowerCase()) {
      return bad(res, "nombreUsuario no coincide con el usuario autenticado");
    }


    let categoriaId = existing.categoriaId;
    if (nombreCategoria) {
      const cat = await findCategoriaByNombre(nombreCategoria);
      if (!cat) return notFound(res, "Categoría no encontrada");
      if (cat.activa === false) return bad(res, "La categoría está inactiva");
      categoriaId = cat.id;
    }

    const actualizado = await prisma.$transaction(async (tx) => {
      await tx.producto.update({
        where: { id },
        data: {
          ...(titulo !== undefined ? { titulo } : {}),
          ...(descripcion !== undefined ? { descripcion } : {}),
          ...(stock !== undefined ? { stock: toIntOrNull(stock) } : {}),
          ...(precio !== undefined ? { precio: toDecimalOrNull(precio) } : {}),
          ...(activo !== undefined ? { activo: Boolean(activo) } : {}),
          ...(categoriaId ? { categoriaId } : {})
        },
      });

      if (Array.isArray(imagenes)) {
        if (reemplazarImagenes) {
          await tx.imagenProducto.deleteMany({ where: { productoId: id } });
        }
        const nuevas = imagenes
          .filter((img) => img?.url)
          .map((img) => ({
            url: img.url,
            esPrincipal: Boolean(img.esPrincipal),
            productoId: id,
          }));
        if (nuevas.length > 0) {
          await tx.imagenProducto.createMany({ data: nuevas });
        }
      }

      return tx.producto.findUnique({
        where: { id },
        include: {
          categoria: { select: { id: true, nombre: true } },
          publicadoPor: { select: { id: true, nombreUsuario: true } },
          imagenes: true,
        },
      });
    });

    return ok(res, actualizado, "Producto actualizado correctamente");
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return bad(res, "Ya existe un producto con ese título");
      }
    }
    console.error(err);
    return bad(res, "Error al actualizar producto");
  }
};


export const softDeleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const up = await prisma.producto.update({
      where: { id },
      data: { activo: false },
      select: { id: true, titulo: true, activo: true },
    });
    return ok(res, up, "Producto desactivado");
  } catch (err) {
    console.error(err);
    return bad(res, "Error al desactivar producto");
  }
};

export const deleteImagenProducto = async (req, res) => {
  try {
    const { id } = req.params;

 
    const imagen = await prisma.imagenProducto.findUnique({
      where: { id },
    });

    if (!imagen) return notFound(res, "La imagen no existe");

  

    
    await prisma.imagenProducto.delete({
      where: { id },
    });

    return ok(res, { id }, "Imagen eliminada correctamente");
  } catch (error) {
    console.error("Error eliminando imagen:", error);
    return bad(res, "Error al eliminar la imagen");
  }
};

