import { prisma } from '../db.js';

export const getPersonas = async(req, res ) =>{
    const personas = await prisma.persona.findMany();
    res.json(personas);
}

export const getPersona = async(req, res ) =>{
    const personas = await prisma.persona.findFirst();
    where:{
        id : req.params.id
    }
    res.json(personas);
}

export const addPersona = async(req, res )=>{
    const newPersona = await prisma.persona.create({
        data: req.body
    });
    res.json(newPersona)
}

