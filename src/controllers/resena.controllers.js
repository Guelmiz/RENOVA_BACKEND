import { PrismaClient, Prisma } from "@prisma/client";
import{ok,bad,created,notFound} from "../helpers/helpers.js";
const prisma = new PrismaClient();

async function resolveProductoId({productoId, productoTitulo}){
    if(productoId) return productoId;
    if(productoTitulo){
        const p = await prisma.producto.findFirst({where:{titulo:productoTitulo}});
        if(!p) throw new Error('Producto no encontrado')
            return p.id;
    }
    throw new Error('Producto Faltante');
}

async function resolveUsuarioId({usuarioId, usuarioNombre}){
  if (usuarioId) return usuarioId;
  if (usuarioNombre) {
    const u = await prisma.usuario.findFirst({ where: { nombreUsuario: usuarioNombre } });
    if (!u) throw new Error('USUARIO_NO_ENCONTRADO_NOMBRE');
    return u.id;
  }
  throw new Error('USUARIO_FALTANTE');

}

export const listResenas = async(req,res) =>{
    try{
        const{
            pagina = 1,
            tamanio = 10,
            estado,
            moderado,
            productoId,
            productoTitulo,
            usuarioId,
            usuarioNombre
        }=req.query;
    const where= {};
    if(estado) where.estado = estado;
    if(moderado !== undefined) where.moderado = string(moderado) === 'true';
    if(productoid || productoTitulo){
        const pid = await resolveProductoId({productoId, productoTitulo}).catch(() => null);
        if(pid) where.productoid = pid;
    }
    if(usuarioId|| usuarioNombre){
     const uid = await resolveUsuarioId({usuarioId, usuarioNombre}).catch(()=>null);
     if(uid) where.usuarioId = uid;
    }
      const skip = (Number(pagina)-1)*Number(tamanio);
      const take = Number(tamanio);
      
       const [items, total] = await Promise.all([
      prisma.resena.findMany({
        where,
        skip,
        take,
        orderBy: { fechaResena: 'desc' },
        include: {
          usuario: { select: { id: true, nombreUsuario: true, email: true } },
          producto: { select: { id: true, titulo: true } },
        },
      }),
      prisma.resena.count({ where }),
    ]);
     return ok(res, {
      items,
      pagina: Number(pagina),
      tamanio: Number(tamanio),
      total,
      totalPaginas: Math.ceil(total / Number(tamanio)),
    
    });
    
}catch (err) {
    console.error(err);
    return bad(res, 'Error al listar reseñas');
  }
};

export const getResenaById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.resena.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombreUsuario: true, email: true } },
        producto: { select: { id: true, titulo: true } },
      },
    });

    if (!item) return notFound(res, 'Reseña no encontrada');
    return ok(res, item);
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al obtener la reseña');
  }
};

export const createResena = async (req, res) => {
  try {
    let {
      productoId,
      usuarioId,
      productoTitulo,
      usuarioNombre,
      calificacion,
      comentario,
      estado,     // opcional: por defecto 'pendiente'
      moderado,   // opcional: por defecto false
    } = req.body;

    const pid = await resolveProductoId({ productoId, productoTitulo });
    const uid = await resolveUsuarioId({ usuarioId, usuarioNombre });

    // Validaciones mínimas (sin toInt/UUID manual)
    const r = Number(calificacion);
    if (!Number.isInteger(r) || r < 1 || r > 5) return bad(res, 'calificacion debe ser entero de 1 a 5');

    const data = {
      productoId: pid,
      usuarioId: uid,
      calificacion: r,
      comentario: comentario ?? null,
    };
    if (estado !== undefined) data.estado = estado;
    if (moderado !== undefined) data.moderado = Boolean(moderado);

    const nueva = await prisma.resena.create({ data });
    return created(res, nueva);
  } catch (err) {
    console.error(err);
    if (err.message === 'PRODUCTO_NO_ENCONTRADO_TITULO') return bad(res, 'Producto no encontrado por título');
    if (err.message === 'USUARIO_NO_ENCONTRADO_NOMBRE') return bad(res, 'Usuario no encontrado por nombreUsuario');
    if (err.message === 'PRODUCTO_FALTANTE' || err.message === 'USUARIO_FALTANTE') return bad(res, 'Faltan identificadores de producto/usuario');
    return bad(res, 'Error al crear reseña');
  }
};

export const updateResena = async (req, res) => {
  try {
    const { id } = req.params;
    const existente = await prisma.resena.findUnique({ where: { id } });
    if (!existente) return notFound(res, 'Reseña no encontrada');

    const { calificacion, comentario, estado, moderado } = req.body;

    const data = {};
    if (calificacion !== undefined) {
      const r = Number(calificacion);
      if (!Number.isInteger(r) || r < 1 || r > 5) return bad(res, 'calificacion debe ser entero de 1 a 5');
      data.calificacion = r;
    }
    if (comentario !== undefined) data.comentario = comentario ?? null;
    if (estado !== undefined) data.estado = estado;
    if (moderado !== undefined) data.moderado = Boolean(moderado);

    const updated = await prisma.resena.update({ where: { id }, data });
    return ok(res, updated);
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al actualizar reseña');
  }
};

export const deleteResena = async (req, res) => {
  try {
    const { id } = req.params;
    const existente = await prisma.resena.findUnique({ where: { id } });
    if (!existente) return notFound(res, 'Reseña no encontrada');

    await prisma.resena.delete({ where: { id } });
    return ok(res, { message: 'Reseña eliminada' });
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al eliminar reseña');
  }
};

export const listResenasByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const items = await prisma.resena.findMany({
      where: { productoId },
      orderBy: { fechaResena: 'desc' },
      include: {
        usuario: { select: { id: true, nombreUsuario: true, email: true } },
      },
    });
    return ok(res, items);
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al listar reseñas del producto');
  }
};

export const listResenasByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const items = await prisma.resena.findMany({
      where: { usuarioId },
      orderBy: { fechaResena: 'desc' },
      include: {
        producto: { select: { id: true, titulo: true } },
      },
    });
    return ok(res, items);
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al listar reseñas del usuario');
  }
};


export const moderarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, moderado } = req.body;

    const existente = await prisma.resena.findUnique({ where: { id } });
    if (!existente) return notFound(res, 'Reseña no encontrada');

    const updated = await prisma.resena.update({
      where: { id },
      data: {
        ...(estado !== undefined ? { estado } : {}),
        ...(moderado !== undefined ? { moderado: Boolean(moderado) } : {}),
      },
    });
    return ok(res, updated);
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al moderar reseña');
  }
};

export const resumenResenasProducto = async (req, res) => {
  try {
    const { productoId } = req.params;

    const agg = await prisma.resena.aggregate({
      where: { productoId },
      _avg: { calificacion: true },
      _count: { calificacion: true },
    });

    // Conteo por cada estrella
    const buckets = await prisma.resena.groupBy({
      by: ['calificacion'],
      where: { productoId },
      _count: { _all: true },
    });

    const porEstrella = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const b of buckets) {
      porEstrella[b.calificacion] = b._count._all;
    }

    return ok(res, {
      promedio: agg._avg.calificacion ?? 0,
      total: agg._count.calificacion,
      porEstrella,
    });
  } catch (err) {
    console.error(err);
    return bad(res, 'Error al obtener resumen de reseñas');
  }
};