import { prisma } from "../db.js";

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

export const getCategorias = async (req, res) => {
    const categorias = await prisma.categoriaProducto.findMany();
    res.json(categorias);
};

export const getCategoria = async (req, res) => {
    const findCategoria = await prisma.categoriaProducto.findFirst({
        where: {
            id: req.params.id
        }
    });
    res.json(findCategoria);
};

export const deleteCategoria = async (req, res) => {
    const findCategoria = await prisma.categoriaProducto.delete({
        where: {
            id: req.params.id
        }
    });
    res.json(findCategoria);
};

export const createCategoria = async (req, res) => {
    const { nombre, fechaRegistro } = req.body;
    const newCategoria = await prisma.categoriaProducto.create({
        data: {
            nombre
        },
    });
    newCategoria.fechaRegistro = formatearFecha(newCategoria.fechaRegistro);
    res.json(newCategoria);
};

export const updateCategoria = async (req, res) => {
    const { nombre, fechaRegistro } = req.body;
    const updateCategoria = await prisma.categoriaProducto.update({
        where: {
            id: req.params.id
        },
        data: {
            nombre,
            fechaRegistro: fechaRegistro ? convertirFecha(fechaRegistro) : null,
        },
    });
    updateCategoria.fechaRegistro = formatearFecha(updateCategoria.fechaRegistro);
    res.json(updateCategoria);
};