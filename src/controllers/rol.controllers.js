import { prisma } from '../db.js';

export const getRols = async (req, res) => {
  const rols  = await prisma.rol.findMany();
  res.json(rols);
};

export const getRol =async (req, res) => {
    const findRol = await prisma.rol.findFirst({
        where: {
            id: req.params.id
        }
    });
    res.json(findRol);
}

export const deleteRol = async (req, res) => {
    const deletRol = await prisma.rol.delete({
        where: {
            id: req.params.id
        }
    });
    return res.json(deletRol)
};

export const newRol =async (req, res) => {
    const newRol = await prisma.rol.create({
        data:req.body
    });
    res.json(newRol);
};

export const updateRol =async (req, res) => {
    const updateRol = await prisma.rol.update({
        where: {
            id: req.params.id
        },
        data: req.body
    });
    res.json(updateRol);
};