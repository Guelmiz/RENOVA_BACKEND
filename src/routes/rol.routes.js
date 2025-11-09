import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/rols', async (req, res) => {
  const rols  = await prisma.rol.findMany();
  res.json(rols);
});

router.get('/rols/:id', async (req, res) => {
    const findRol = await prisma.rol.findFirst({
        where: {
            id: req.params.id
        }
    });
    res.json(findRol);
});

router.delete('/rols/:id', async (req, res) => {
    const deletRol = await prisma.rol.delete({
        where: {
            id: req.params.id
        }
    });
    return res.json(deletRol)
});


router.post('/rols', async (req, res) => {
    const newRol = await prisma.rol.create({
        data:req.body
    });
    res.json(newRol);
});

router.put('/rols/:id', async (req, res) => {
    const updateRol = await prisma.rol.update({
        where: {
            id: req.params.id
        },
        data: req.body
    });
    res.json(updateRol);
});
export default router;