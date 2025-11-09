import { prisma } from '../db.js';
function validarFecha(fecha) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
    return true;
}


function convertirFecha(fecha) {
    if (!fecha) return null;
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function formatearFecha(fecha) {
    return fecha ? fecha.toISOString().split('T')[0] : null;
}

export const getcertificaciones = async (req, res) => {
    const certificaciones = await prisma.certificacion.findMany();
    res.json(certificaciones);
};

export const getcertificacion = async (req, res) => {
    const findcertificacion = await prisma.certificacion.findFirst({
        where:{
            id: req.params.id
        }
    });
    res.json(findcertificacion);
}

export const deletecertificacion = async (req, res) => {
    const deletecertificacion = await prisma.certificacion.delete({
        where:{
            id: req.params.id
        }
    });
    return res.json(deletecertificacion)
};

export const createcertificacion = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const newcertificacion = await prisma.certificacion.create({
        data: {
            nombre,
            descripcion,
        },
    });
    res.json(newcertificacion);
};

export const updatecertificacion = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const updatecertificacion = await prisma.certificacion.update({
        where: {
            id: req.params.id
        },
        data: {
            nombre,
            descripcion,
        },
    });
    res.json(updatecertificacion);
};