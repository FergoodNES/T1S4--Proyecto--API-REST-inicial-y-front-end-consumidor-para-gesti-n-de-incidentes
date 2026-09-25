// src/models/incidentModel.js
// Modelo en memoria para la gestión de incidentes en plataforma de red

class IncidentModel {
  constructor() {
    this.incidentes = [
      {
        id: 1,
        titulo: 'Caída de enlace de fibra óptica principal (Troncal Este)',
        descripcion: 'Se detecta pérdida total de señal óptica en la interfaz GigabitEthernet0/1/0 conectada al proveedor ISP primario.',
        severidad: 'Crítica',
        estado: 'Abierto',
        categoria: 'Red Troncal',
        asignadoA: 'Ing. Carlos Mendoza (NOC)',
        fechaReporte: '2026-09-24T18:30:00.000Z',
        fechaActualizacion: '2026-09-25T08:15:00.000Z'
      },
      {
        id: 2,
        titulo: 'Saturación de ancho de banda por ráfaga anómala UDP',
        descripcion: 'El firewall perimetral reporta consumo del 98% en uplink. Posible ataque volumétrico mitigado parcialmente por scrubbing center.',
        severidad: 'Alta',
        estado: 'En Progreso',
        categoria: 'Seguridad',
        asignadoA: 'Ing. Sofía Reyes (Ciberseguridad)',
        fechaReporte: '2026-09-25T07:45:00.000Z',
        fechaActualizacion: '2026-09-25T09:10:00.000Z'
      },
      {
        id: 3,
        titulo: 'Falla en fuente de poder redundante PSU-2 (Router de Borde BGP)',
        descripcion: 'El dispositivo Router BGP-01 opera únicamente con la fuente 1. Se requiere sustitución física de hardware para mantener alta disponibilidad.',
        severidad: 'Media',
        estado: 'Abierto',
        categoria: 'Hardware',
        asignadoA: 'Tec. Marcos Silva (Infraestructura)',
        fechaReporte: '2026-09-24T14:20:00.000Z',
        fechaActualizacion: '2026-09-24T14:20:00.000Z'
      },
      {
        id: 4,
        titulo: 'Intermitencia en túnel VPN IPsec Sucursal Guayaquil',
        descripcion: 'Pérdida esporádica de paquetes (15-20%) entre gateway local y sucursal. Renegociación IKEv2 se reinicia periódicamente.',
        severidad: 'Media',
        estado: 'En Progreso',
        categoria: 'VPN / Enlaces',
        asignadoA: 'Ing. Carlos Mendoza (NOC)',
        fechaReporte: '2026-09-25T06:00:00.000Z',
        fechaActualizacion: '2026-09-25T08:50:00.000Z'
      },
      {
        id: 5,
        titulo: 'Latencia elevada hacia clúster de base de datos interna',
        descripcion: 'Pings exceden los 180ms entre servidores de aplicaciones y clúster PostgreSQL debido a saturación en switch ToR.',
        severidad: 'Baja',
        estado: 'Resuelto',
        categoria: 'Servicios de Datos',
        asignadoA: 'Ing. David Paredes (SysAdmin)',
        fechaReporte: '2026-09-23T11:15:00.000Z',
        fechaActualizacion: '2026-09-24T16:00:00.000Z'
      }
    ];

    // Contador incremental para IDs únicos
    this.currentId = 6;
  }

  // Obtener todos los incidentes con capacidades de filtrado y búsqueda
  getAll(filters = {}) {
    let result = [...this.incidentes];

    if (filters.estado && filters.estado !== 'Todos') {
      result = result.filter(item => 
        item.estado.toLowerCase() === filters.estado.toLowerCase()
      );
    }

    if (filters.severidad && filters.severidad !== 'Todas') {
      result = result.filter(item => 
        item.severidad.toLowerCase() === filters.severidad.toLowerCase()
      );
    }

    if (filters.categoria && filters.categoria !== 'Todas') {
      result = result.filter(item => 
        item.categoria.toLowerCase() === filters.categoria.toLowerCase()
      );
    }

    if (filters.search && filters.search.trim() !== '') {
      const query = filters.search.trim().toLowerCase();
      result = result.filter(item => 
        item.titulo.toLowerCase().includes(query) ||
        item.descripcion.toLowerCase().includes(query) ||
        item.asignadoA.toLowerCase().includes(query) ||
        item.id.toString() === query
      );
    }

    // Ordenar por fecha más reciente por defecto
    return result.sort((a, b) => new Date(b.fechaReporte) - new Date(a.fechaReporte));
  }

  // Obtener un incidente por ID numérico
  getById(id) {
    const numericId = parseInt(id, 10);
    return this.incidentes.find(item => item.id === numericId) || null;
  }

  // Crear un nuevo incidente
  create(data) {
    const nuevoIncidente = {
      id: this.currentId++,
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      severidad: data.severidad || 'Media',
      estado: data.estado || 'Abierto',
      categoria: data.categoria || 'General',
      asignadoA: data.asignadoA ? data.asignadoA.trim() : 'Sin Asignar',
      fechaReporte: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    this.incidentes.push(nuevoIncidente);
    return nuevoIncidente;
  }

  // Actualizar un incidente existente
  update(id, data) {
    const numericId = parseInt(id, 10);
    const index = this.incidentes.findIndex(item => item.id === numericId);

    if (index === -1) {
      return null;
    }

    const anterior = this.incidentes[index];
    const actualizado = {
      ...anterior,
      titulo: data.titulo !== undefined ? data.titulo.trim() : anterior.titulo,
      descripcion: data.descripcion !== undefined ? data.descripcion.trim() : anterior.descripcion,
      severidad: data.severidad !== undefined ? data.severidad : anterior.severidad,
      estado: data.estado !== undefined ? data.estado : anterior.estado,
      categoria: data.categoria !== undefined ? data.categoria : anterior.categoria,
      asignadoA: data.asignadoA !== undefined ? data.asignadoA.trim() : anterior.asignadoA,
      fechaActualizacion: new Date().toISOString()
    };

    this.incidentes[index] = actualizado;
    return actualizado;
  }

  // Eliminar un incidente por ID
  delete(id) {
    const numericId = parseInt(id, 10);
    const index = this.incidentes.findIndex(item => item.id === numericId);

    if (index === -1) {
      return false;
    }

    this.incidentes.splice(index, 1);
    return true;
  }

  // Obtener estadísticas y métricas del sistema
  getStats() {
    const total = this.incidentes.length;
    const abiertos = this.incidentes.filter(i => i.estado === 'Abierto').length;
    const enProgreso = this.incidentes.filter(i => i.estado === 'En Progreso').length;
    const resueltos = this.incidentes.filter(i => i.estado === 'Resuelto').length;
    const criticos = this.incidentes.filter(i => i.severidad === 'Crítica').length;

    return {
      total,
      abiertos,
      enProgreso,
      resueltos,
      criticos
    };
  }
}

// Instancia única (Singleton) en memoria
const incidentModel = new IncidentModel();

module.exports = incidentModel;
