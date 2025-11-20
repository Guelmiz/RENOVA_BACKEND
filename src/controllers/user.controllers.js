import { prisma } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path"
import cloudinary from "../config/cloudinary.js";

function fecha_fix(fecha) {
  if (!fecha) return null;
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(fecha);
  if (!m) return null;
  const [y, mo, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d));
}

function dateOnlyString(fecha) {
  if (!fecha) return null;
  try {
    return new Date(fecha).toISOString().split("T")[0];
  } catch {
    return null;
  }
}


async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}


async function findUserByEmail(email) {
  return prisma.usuario.findUnique({
    where: { email },
    include: {
      persona: true,
      roles: { include: { rol: true } }, 
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
    }); 
  } catch (error) {
    console.error("❌ Error en findUserByID:", error);
    throw error;
  }
}


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
    imagen: user.imagen ?? null
  };
}

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; 
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}


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
      imagen
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
          imagen: imagen ?? null,
        },
      });
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
      imagen,
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
    if (imagen !== undefined) {
      
      usuarioData.imagen = imagen || null; // <-- NUEVO
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

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await verifyPassword(password, user.passHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 🔹 Obtener roles como array de strings
    const roles = (user.roles || [])
      .map((r) => r.rol?.nombre)
      .filter(Boolean);

    const token = jwt.sign(
      { sub: user.id, roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    await prisma.usuario.update({
      where: { id: user.id },
      data: { estadoSesion: true, ultimaSesion: new Date() },
    });

    const dto = buildUserDTO(user);
    const dtoWithRoles = { ...dto, roles };

    return res.json({ token, user: dtoWithRoles });
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await prisma.usuario.update({
        where: { id: userId },
        data: { estadoSesion: false, ultimaSesion: new Date() },
      });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en logout:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const uploadUserImage = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ninguna imagen" });
    }

    
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

   
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "usuarios",        
      public_id: `user_${id}`,   
      overwrite: true,
    });

  
    const updated = await prisma.usuario.update({
      where: { id },
      data: { imagen: result.secure_url },
    });

    return res.json({
      message: "Imagen actualizada",
      imagen: updated.imagen,
    });
  } catch (error) {
    console.error("❌ Error al subir imagen (Cloudinary):", error);
    return res.status(500).json({ message: "Error al subir la imagen" });
  }
};