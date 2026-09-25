// src/controllers/incidentController.js
// Controlador para procesar peticiones y lógica de negocio de incidentes

const incidentModel = require('../models/incidentModel');

// 1. Obtener lista de incidentes (con filtros opcionales)
const listarIncidentes = (req, res, next) => {
  try {
    const { estado, severidad, categoria, search } = req.query;
    const incidentes = incidentModel.getAll({ estado, severidad, categoria, search });

    res.status(200).json({
      success: true,
      count: incidentes.length,
      data: incidentes
    });
  } catch (error) {
    next(error);
  }
};

// 2. Obtener un único incidente por ID
const obtenerIncidente = (req, res, next) => {
  try {
    const { id } = req.params;
    const incidente = incidentModel.getById(id);

    if (!incidente) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado',
        message: `No se encontró ningún incidente registrado con el ID ${id}.`
      });
    }

    res.status(200).json({
      success: true,
      data: incidente
    });
  } catch (error) {
    next(error);
  }
};

// 3. Crear un nuevo incidente con validaciones
const crearIncidente = (req, res, next) => {
  try {
    const { titulo, descripcion, severidad, estado, categoria, asignadoA } = req.body;

    // Validaciones de campos obligatorios
    const errores = [];
    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 5) {
      errores.push('El campo "titulo" es obligatorio y debe tener al menos 5 caracteres.');
    }
    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 10) {
      errores.push('El campo "descripcion" es obligatorio y debe tener al menos 10 caracteres.');
    }

    const severidadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
    if (severidad && !severidadesValidas.includes(severidad)) {
      errores.push(`La severidad debe ser una de las siguientes: ${severidadesValidas.join(', ')}.`);
    }

    const estadosValidos = ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];
    if (estado && !estadosValidos.includes(estado)) {
      errores.push(`El estado debe ser uno de los siguientes: ${estadosValidos.join(', ')}.`);
    }

    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        messages: errores
      });
    }

    const nuevoIncidente = incidentModel.create({
      titulo,
      descripcion,
      severidad: severidad || 'Media',
      estado: estado || 'Abierto',
      categoria: categoria || 'General',
      asignadoA
    });

    res.status(201).json({
      success: true,
      message: 'Incidente registrado exitosamente.',
      data: nuevoIncidente
    });
  } catch (error) {
    next(error);
  }
};

// 4. Actualizar un incidente existente (PUT)
const actualizarIncidente = (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    // Verificar si existe primero
    const existente = incidentModel.getById(id);
    if (!existente) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado',
        message: `No se puede actualizar. No existe el incidente con ID ${id}.`
      });
    }

    // Validar título y descripción si fueron provistos
    if (datosActualizacion.titulo !== undefined && datosActualizacion.titulo.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'El título debe tener al menos 5 caracteres.'
      });
    }

    if (datosActualizacion.descripcion !== undefined && datosActualizacion.descripcion.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'La descripción debe tener al menos 10 caracteres.'
      });
    }

    const actualizado = incidentModel.update(id, datosActualizacion);

    res.status(200).json({
      success: true,
      message: `Incidente #${id} actualizado correctamente.`,
      data: actualizado
    });
  } catch (error) {
    next(error);
  }
};

// 5. Eliminar un incidente (DELETE)
const eliminarIncidente = (req, res, next) => {
  try {
    const { id } = req.params;
    const eliminado = incidentModel.delete(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Incidente no encontrado',
        message: `No se puede eliminar. No existe el incidente con ID ${id}.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Incidente #${id} eliminado satisfactoriamente de la memoria.`
    });
  } catch (error) {
    next(error);
  }
};

// 6. Obtener métricas y estadísticas del sistema
const obtenerEstadisticas = (req, res, next) => {
  try {
    const stats = incidentModel.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarIncidentes,
  obtenerIncidente,
  crearIncidente,
  actualizarIncidente,
  eliminarIncidente,
  obtenerEstadisticas
};
