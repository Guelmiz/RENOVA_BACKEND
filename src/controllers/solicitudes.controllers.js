import { prisma } from "../db.js";
import { ok, bad, created } from "../helpers/helpers.js";

// 1. CREAR SOLICITUD (Cliente)
export const createSolicitud = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { motivo, documentos } = req.body; 
    // documentos espera ser un array: [{ tipo: "RUC", ruta: "https://..." }]

    // Verificar si ya tiene una solicitud pendiente
    const pendiente = await prisma.solicitudRepresentante.findFirst({
        where: { usuarioId, estado: "ENVIADA" }
    });

    if (pendiente) return bad(res, "Ya tienes una solicitud en revisión.");

    const nuevaSolicitud = await prisma.solicitudRepresentante.create({
        data: {
            usuarioId,
            enviadoPor: req.user.nombreUsuario || "Usuario",
            motivo,
            estado: "ENVIADA",
            documentos: {
                create: documentos.map(doc => ({
                    tipo: doc.tipo, // Enum: RUC, Carta_autorizacion, etc.
                    ruta: doc.ruta
                }))
            }
        }
    });

    return created(res, nuevaSolicitud);
  } catch (error) {
    console.error(error);
    return bad(res, "Error al crear solicitud");
  }
};

// 2. LISTAR SOLICITUDES (Admin)
export const getAllSolicitudes = async (req, res) => {
    try {
        const solicitudes = await prisma.solicitudRepresentante.findMany({
            where: { estado: "ENVIADA" }, // Solo las pendientes por defecto
            include: {
                usuario: { 
                    include: { persona: true } 
                },
                documentos: true
            },
            orderBy: { fechaCreacion: 'asc' } // Las más viejas primero
        });
        return ok(res, solicitudes);
    } catch (error) {
        return bad(res, "Error al listar solicitudes");
    }
};

// 3. PROCESAR (APROBAR/RECHAZAR)
export const procesarSolicitud = async (req, res) => {
    try {
        const { id } = req.params; // ID de la solicitud
        const { accion } = req.body; // "APROBADA" o "RECHAZADA"

        if (!['APROBADA', 'RECHAZADA'].includes(accion)) {
            return bad(res, "Acción inválida");
        }

        const solicitud = await prisma.solicitudRepresentante.findUnique({ where: { id } });
        if (!solicitud) return bad(res, "Solicitud no encontrada");

        await prisma.$transaction(async (tx) => {
            // A. Actualizar estado de la solicitud
            await tx.solicitudRepresentante.update({
                where: { id },
                data: { 
                    estado: accion,
                    fechaRevisado: new Date()
                }
            });

            // B. Si es APROBADA, dar rol de Representante
            if (accion === 'APROBADA') {
                // 1. Buscar el rol ID
                const rolRep = await tx.rol.findUnique({ where: { nombre: "Representante" } });
                if (!rolRep) throw new Error("El rol 'Representante' no existe en la BD");

                // 2. Asignar rol (Upsert para evitar error si ya lo tuviera desactivado)
                // O simplemente create si estamos seguros. Usaremos create con validación.
                const existeRelacion = await tx.usuarioRol.findUnique({
                    where: {
                        usuarioId_rolId: {
                            usuarioId: solicitud.usuarioId,
                            rolId: rolRep.id
                        }
                    }
                });

                if (existeRelacion) {
                    await tx.usuarioRol.update({
                        where: { id: existeRelacion.id },
                        data: { activo: true }
                    });
                } else {
                    await tx.usuarioRol.create({
                        data: {
                            usuarioId: solicitud.usuarioId,
                            rolId: rolRep.id,
                            activo: true
                        }
                    });
                }
            }
        });

        return ok(res, { message: `Solicitud ${accion.toLowerCase()} correctamente` });

    } catch (error) {
        console.error(error);
        return bad(res, "Error procesando solicitud");
    }
};