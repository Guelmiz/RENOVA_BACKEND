import { prisma } from '../db.js';



function convertirFecha(fecha) {
    if (!fecha) return null;
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function formatearFecha(fecha) {
    return fecha ? fecha.toISOString().split('T')[0] : null;
}


export const getProductoCertificaciones = async (req, res) => {
    const asignaciones = await prisma.productoCertificacion.findMany({
        include: {
            producto: true,      
            certificacion: true  
        }
    });

    const formatted = asignaciones.map(item => ({
        ...item,
        fechaAsignacion: formatearFecha(item.fechaAsignacion)
    }));

    res.json(formatted);
};


export const getProductoCertificacion = async (req, res) => {
    const asignacion = await prisma.productoCertificacion.findUnique({
        where: {
            id: req.params.id
        },
        include: {
            producto: true,
            certificacion: true
        }
    });

    if (asignacion) {
        asignacion.fechaAsignacion = formatearFecha(asignacion.fechaAsignacion);
    }

    res.json(asignacion);
};


export const createProductoCertificacion = async (req, res) => {
    const { productoId, certificacionId, fechaAsignacion } = req.body;

    try {
        
        const dataCreate = {
            productoId,
            certificacionId,
        };

        if (fechaAsignacion) {
            dataCreate.fechaAsignacion = convertirFecha(fechaAsignacion);
        }

        const newAsignacion = await prisma.productoCertificacion.create({
            data: dataCreate
        });

        newAsignacion.fechaAsignacion = formatearFecha(newAsignacion.fechaAsignacion);
        res.json(newAsignacion);

    } catch (error) {
    
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Este producto ya posee esta certificación asignada." });
        }
        res.status(500).json({ error: error.message });
    }
};


export const updateProductoCertificacion = async (req, res) => {
    const { productoId, certificacionId, fechaAsignacion } = req.body;

    
    const dataUpdate = {
        productoId,
        certificacionId
    };

    if (fechaAsignacion) {
        dataUpdate.fechaAsignacion = convertirFecha(fechaAsignacion);
    }

    const updatedAsignacion = await prisma.productoCertificacion.update({
        where: {
            id: req.params.id
        },
        data: dataUpdate,
    });

    updatedAsignacion.fechaAsignacion = formatearFecha(updatedAsignacion.fechaAsignacion);
    res.json(updatedAsignacion);
};


export const deleteProductoCertificacion = async (req, res) => {
    const deletedAsignacion = await prisma.productoCertificacion.delete({
        where: {
            id: req.params.id
        }
    });
    res.json(deletedAsignacion);
};