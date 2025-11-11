// middlewares/auth.js
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { bad, notFound } from "../helpers/helpers.js";

const prisma = new PrismaClient();

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");

    if (!token) return bad(res, "Falta token de autorización (Bearer)");

    
    const payload = jwt.verify(token, process.env.JWT_SECRET);

  
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      include: {
        roles: {
          where: { activo: true },
          include: { rol: true },
        },
      },
    });

    if (!usuario) return notFound(res, "Usuario no encontrado");
    if (!usuario.estadoSesion) return bad(res, "La sesión no está activa");


    req.user = {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      roles: (usuario.roles || []).map((r) => r.rol?.nombre).filter(Boolean),
    };

    next();
  } catch (err) {
    console.error(err);
    return bad(res, "Token inválido o expirado");
  }
}
