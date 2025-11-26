import { prisma } from "../db.js";
import { ok, bad, created } from "../helpers/helpers.js";


export const createSolicitud = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { motivo, documentos } = req.body; 
    

  
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
                    tipo: doc.tipo, 
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


export const getAllSolicitudes = async (req, res) => {
    try {
        const solicitudes = await prisma.solicitudRepresentante.findMany({
            where: { estado: "ENVIADA" }, 
            include: {
                usuario: { 
                    include: { persona: true } 
                },
                documentos: true
            },
            orderBy: { fechaCreacion: 'asc' } 
        });
        return ok(res, solicitudes);
    } catch (error) {
        return bad(res, "Error al listar solicitudes");
    }
};


export const procesarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion } = req.body; 

        if (!['APROBADA', 'RECHAZADA'].includes(accion)) {
            return bad(res, "Acción inválida");
        }

        const solicitud = await prisma.solicitudRepresentante.findUnique({ where: { id } });
        if (!solicitud) return bad(res, "Solicitud no encontrada");

        await prisma.$transaction(async (tx) => {
          
            await tx.solicitudRepresentante.update({
                where: { id },
                data: { 
                    estado: accion,
                    fechaRevisado: new Date()
                }
            });

            
            if (accion === 'APROBADA') {
                
                const rolRep = await tx.rol.findUnique({ where: { nombre: "Representante" } });
                if (!rolRep) throw new Error("El rol 'Representante' no existe en la BD");

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