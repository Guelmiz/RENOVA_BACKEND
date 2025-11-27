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


async function obtenerPersonaPorId(id) {
  const persona = await prisma.persona.findUnique({ where: { id } });
  return persona;
}


function formatearFecha(fecha) {
  return fecha ? fecha.toISOString().split('T')[0] : null;
}


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

export const addPersona = async (req, res) => {
  try {
    const { nombreCompleto, telefono, fechaNacimiento } = req.body;

    if (!nombreCompleto)
      return res.status(400).json({ message: 'El nombre completo es obligatorio' });

    if (fechaNacimiento && !validarFecha(fechaNacimiento)) {
      return res.status(400).json({
        message: 'El formato de fecha debe ser YYYY-MM-DD, por ejemplo: 2002-12-02',
      });
    }

    const newPersona = await prisma.persona.create({
      data: {
        nombreCompleto,
        telefono: telefono ? Number(telefono) : null,
        fechaNacimiento: fechaNacimiento ? convertirFecha(fechaNacimiento) : null,
      },
    });

    newPersona.fechaNacimiento = formatearFecha(newPersona.fechaNacimiento);
    res.status(201).json({ message: 'Persona creada', data: newPersona });
  } catch (error) {
    console.error('❌ Error al crear persona:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updatePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, telefono, fechaNacimiento } = req.body;

    const personaExistente = await obtenerPersonaPorId(id);
    if (!personaExistente)
      return res.status(404).json({ message: 'La persona no existe' });

    if (fechaNacimiento && !validarFecha(fechaNacimiento)) {
      return res.status(400).json({
        message: 'El formato de fecha debe ser YYYY-MM-DD, por ejemplo: 2002-12-02',
      });
    }

    const personaActualizada = await prisma.persona.update({
      where: { id },
      data: {
        nombreCompleto,
        telefono: telefono ? Number(telefono) : personaExistente.telefono,
        fechaNacimiento: fechaNacimiento
          ? convertirFecha(fechaNacimiento)
          : personaExistente.fechaNacimiento,
      },
    });

    personaActualizada.fechaNacimiento = formatearFecha(personaActualizada.fechaNacimiento);
    res.json({ message: 'Persona actualizada correctamente', data: personaActualizada });
  } catch (error) {
    console.error('❌ Error al actualizar persona:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deletePersona = async (req, res) => {
  try{
    const {id} = req.params;
    const persona_existente = await obtenerPersonaPorId(id);
    if(!persona_existente){
      return res.status(404).json({message:'La persona no existe'});
    }
    const persona_eliminada = await prisma.persona.delete({
      where:{
        id
      }
      
    });
    res.json({message:'Persona eliminada correctamente',data:persona_eliminada});
}
  catch(error){
    console.error('❌ Error al eliminar persona:',error);
    res.status(500).json({message:'Error interno del servidor'});
  }
};  