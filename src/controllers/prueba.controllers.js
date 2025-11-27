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

export const getPruebas = async (req, res) => {
    const Prueba = await prisma.Prueba.findMany();
    res.json(Prueba);
};

export const getPrueba = async (req, res) => {
    const findPrueba = await prisma.Prueba.findFirst({
        where: {
            id: req.params.id
        }
    });
    res.json(findPrueba);
}

export const deletePrueba = async (req, res) => {
    const findPrueba = await prismaPrueba.delete({
        where: {
            id: req.params.id
        }
    });
    res.json(findPrueba);
};

export const createPrueba = async (req, res) => {
    const { nombre, realizadoHace } = req.body;
    const newPrueba = await prisma.Prueba.create({
        data: {
            nombre,
            realizadoHace: realizadoHace ? convertirFecha(realizadoHace) : null,
        },
    });
    newPrueba.realizadoHace = formatearFecha(newPrueba.realizadoHace);
    res.json(newPrueba);
};

export const updatePrueba = async (req, res) => {
    const { nombre, realizadoHace } = req.body;
    const updatePrueba = await prisma.Prueba.update({
        where: {
            id: req.params.id
        },
        data: {
            nombre,
            realizadoHace: realizadoHace ? convertirFecha(realizadoHace) : null,
        },
    });
    updatePrueba.realizadoHace = formatearFecha(updatePrueba.realizadoHace);
    res.json(updatePrueba);
};