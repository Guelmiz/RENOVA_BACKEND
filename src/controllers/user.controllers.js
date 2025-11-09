// controllers/auth.controller.js
import { prisma } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* ----------------------------- Utilidades fecha ---------------------------- */
function fecha_fix(fecha) {
  // Acepta "YYYY-MM-DD" y devuelve Date (UTC) o null
  if (!fecha) return null;
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(fecha);
  if (!m) return null;
  const [y, mo, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d));
}

function dateOnlyString(fecha) {
  // Recibe Date o string parseable. Devuelve "YYYY-MM-DD" o null
  if (!fecha) return null;
  try {
    return new Date(fecha).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/* --------------------------------- Bcrypt --------------------------------- */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/* --------------------------------- Prisma --------------------------------- */
async function findUserByEmail(email) {
  return prisma.usuario.findUnique({
    where: { email },
    include: {
      persona: true,
      roles: { include: { rol: true } }, // usuarioRol -> rol
    },
  });
}

export async function findUserByID(id) {
  try {
    return await prisma.usuario.findUnique({
      where: { id },
      include: {
        persona: true,
        roles: { include: { rol: true } },
      },
    }); // si no existe, devuelve null
  } catch (error) {
    console.error("❌ Error en findUserByID:", error);
    throw error;
  }
}

/* ----------------------------- DTO de respuesta ---------------------------- */
function buildUserDTO(user) {
  return {
    id: user.id,
    nombreUsuario: user.nombreUsuario,
    email: user.email,
    roles: (user.roles || []).map((r) => r.rol?.nombre),
    persona: user.persona
      ? {
          id: user.persona.id,
          nombreCompleto: user.persona.nombreCompleto,
          telefono: user.persona.telefono,
          fechaNacimiento: dateOnlyString(user.persona.fechaNacimiento),
        }
      : null,
    fechaRegistro: user.fechaRegistro ?? null,
    ultimaSesion: user.ultimaSesion ?? null,
    estadoSesion: user.estadoSesion ?? false,
  };
}

/* ------------------------------- Middleware JWT ---------------------------- */
export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, roles, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

/* --------------------------------- Endpoints -------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const {
      nombreUsuario,
      email,
      password,
      nombreCompleto,
      telefono,
      fechaNacimiento,
      rolNombre = "CLIENTE",
    } = req.body ?? {};

    if (!nombreUsuario || !email || !password || !nombreCompleto) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios: nombreUsuario, email, password, nombreCompleto",
      });
    }

    const fechaNacDate = fecha_fix(fechaNacimiento);
    if (fechaNacimiento && !fechaNacDate) {
      return res.status(400).json({
        message:
          "La fecha debe tener formato YYYY-MM-DD, por ejemplo: 2002-12-02",
      });
    }

    const passHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: {
          nombreCompleto,
          telefono: telefono ? Number(telefono) : null,
          fechaNacimiento: fechaNacDate,
        },
      });

      const usuario = await tx.usuario.create({
        data: {
          nombreUsuario,
          email,
          passHash,
          personaId: persona.id,
        },
      });

      // Asegura que el rol exista
      const rol = await tx.rol.upsert({
        where: { nombre: rolNombre },
        update: {},
        create: { nombre: rolNombre },
      });

      await tx.usuarioRol.create({
        data: {
          usuarioId: usuario.id,
          rolId: rol.id,
        },
      });

      return { usuario, persona, rol };
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      data: {
        usuario: {
          id: result.usuario.id,
          nombreUsuario: result.usuario.nombreUsuario,
          email: result.usuario.email,
          rol: result.rol.nombre,
          persona: {
            id: result.persona.id,
            nombreCompleto: result.persona.nombreCompleto,
            telefono: result.persona.telefono,
            fechaNacimiento: result.persona.fechaNacimiento
              ? result.persona.fechaNacimiento.toISOString().split("T")[0]
              : null,
          },
        },
      },
    });
  } catch (err) {
    if (err?.code === "P2002" && err.meta?.target?.includes("email")) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }
    console.error("❌ Error en registro:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreUsuario,
      email,
      password,
      nombreCompleto,
      telefono,
      fechaNacimiento,
    } = req.body ?? {};

    const existente = await findUserByID(id);
    if (!existente) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (fechaNacimiento && !fecha_fix(fechaNacimiento)) {
      return res.status(400).json({
        message: "La fecha debe tener formato YYYY-MM-DD (ej: 2002-12-02)",
      });
    }

    const usuarioData = {};
    if (nombreUsuario !== undefined) usuarioData.nombreUsuario = nombreUsuario;
    if (email !== undefined) usuarioData.email = email;
    if (password !== undefined && password !== "") {
      usuarioData.passHash = await hashPassword(password);
    }

    const personaData = {};
    if (nombreCompleto !== undefined)
      personaData.nombreCompleto = nombreCompleto;
    if (telefono !== undefined)
      personaData.telefono = telefono ? Number(telefono) : null;
    if (fechaNacimiento !== undefined) {
      personaData.fechaNacimiento = fechaNacimiento
        ? fecha_fix(fechaNacimiento)
        : null;
    }

    if (
      Object.keys(usuarioData).length === 0 &&
      Object.keys(personaData).length === 0
    ) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    const result = await prisma.$transaction(async (tx) => {
      let persona = existente.persona;
      let usuario = existente;

      if (Object.keys(personaData).length > 0 && existente.persona?.id) {
        persona = await tx.persona.update({
          where: { id: existente.persona.id },
          data: personaData,
        });
      }

      if (Object.keys(usuarioData).length > 0) {
        usuario = await tx.usuario.update({
          where: { id },
          data: usuarioData,
        });
      }

      return { usuario, persona };
    });

    return res.json({
      message: "Usuario actualizado correctamente",
      data: {
        usuario: {
          id: result.usuario.id,
          nombreUsuario: result.usuario.nombreUsuario,
          email: result.usuario.email,
          roles: (existente.roles || []).map((r) => r.rol?.nombre),
          persona: result.persona
            ? {
                id: result.persona.id,
                nombreCompleto: result.persona.nombreCompleto,
                telefono: result.persona.telefono,
                fechaNacimiento: dateOnlyString(result.persona.fechaNacimiento),
              }
            : null,
        },
      },
    });
  } catch (err) {
    if (err?.code === "P2002" && err.meta?.target?.includes("email")) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }
    console.error("❌ Error en updateUser:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y password son obligatorios" });
    }

    const user = await findUserByEmail(email); // << corregido
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await verifyPassword(password, user.passHash); // << comparar, no re-hashear
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const roles = (user.roles || []).map((r) => r.rol?.nombre);
    const token = jwt.sign(
      { sub: user.id, roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    await prisma.usuario.update({
      where: { id: user.id },
      data: { estadoSesion: true, ultimaSesion: new Date() },
    });

    return res.json({ token, user: buildUserDTO(user) });
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (userId) {
      await prisma.usuario.update({
        where: { id: userId },
        data: { estadoSesion: false },
      });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en logout:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};
