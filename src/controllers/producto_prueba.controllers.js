import { prisma } from '../db.js';


function convertirFecha(fecha) {
    if (!fecha) return null;
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function formatearFecha(fecha) {
    return fecha ? fecha.toISOString().split('T')[0] : null;
}


export const getProductoPruebas = async (req, res) => {
    const productoPruebas = await prisma.productoPrueba.findMany({
        include: {
            producto: true, 
            prueba: true  
        }
    });
    
    
    const formatted = productoPruebas.map(item => ({
        ...item,
        fechaRealizacion: formatearFecha(item.fechaRealizacion)
    }));

    res.json(formatted);
};


export const getProductoPrueba = async (req, res) => {
    const findProductoPrueba = await prisma.productoPrueba.findUnique({
        where: {
            id: req.params.id
        },
        include: {
            producto: true,
            prueba: true
        }
    });

    if (findProductoPrueba) {
        findProductoPrueba.fechaRealizacion = formatearFecha(findProductoPrueba.fechaRealizacion);
    }
    
    res.json(findProductoPrueba);
};


export const createProductoPrueba = async (req, res) => {
    const { productoId, pruebaId, fechaRealizacion, resultado } = req.body;

    try {
        const newProductoPrueba = await prisma.productoPrueba.create({
            data: {
                productoId,
                pruebaId,
                resultado,
                fechaRealizacion: fechaRealizacion ? convertirFecha(fechaRealizacion) : null,
            },
        });
        newProductoPrueba.fechaRealizacion = formatearFecha(newProductoPrueba.fechaRealizacion);
        res.json(newProductoPrueba);
    } catch (error) {
        
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Este producto ya tiene registrada esta prueba." });
        }
        res.status(500).json({ error: error.message });
    }
};


export const updateProductoPrueba = async (req, res) => {
    const { productoId, pruebaId, fechaRealizacion, resultado } = req.body;

    const updatedProductoPrueba = await prisma.productoPrueba.update({
        where: {
            id: req.params.id
        },
        data: {
            productoId, 
            pruebaId,   
            resultado,
            fechaRealizacion: fechaRealizacion ? convertirFecha(fechaRealizacion) : null,
        },
    });
    
    updatedProductoPrueba.fechaRealizacion = formatearFecha(updatedProductoPrueba.fechaRealizacion);
    res.json(updatedProductoPrueba);
};

// 5. Eliminar la relación
export const deleteProductoPrueba = async (req, res) => {
    const deletedProductoPrueba = await prisma.productoPrueba.delete({
        where: {
            id: req.params.id
        }
    });
    res.json(deletedProductoPrueba);
};