import api from './api';

const solicitudesService = {
  // Crear nueva solicitud
  crearSolicitud: async (solicitudData) => {
    try {
      const response = await api.post('/api/solicitudes/', solicitudData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear solicitud',
      };
    }
  },

  // Obtener mis solicitudes
  getMisSolicitudes: async () => {
    try {
      const response = await api.get('/api/solicitudes/mis-solicitudes');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener solicitudes',
      };
    }
  },

  // Obtener solicitud por ID
  getSolicitudById: async (id) => {
    try {
      const response = await api.get(`/api/solicitudes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener solicitud',
      };
    }
  },

  // Estados disponibles
  getEstados: () => {
    return [
      { value: 'pendiente', label: 'Pendiente', color: 'gray' },
      { value: 'en_revision', label: 'En Revisión', color: 'blue' },
      { value: 'observado', label: 'Observado', color: 'yellow' },
      { value: 'aprobado', label: 'Aprobado', color: 'green' },
      { value: 'rechazado', label: 'Rechazado', color: 'red' },
      { value: 'finalizado', label: 'Finalizado', color: 'purple' },
    ];
  },

  // Niveles de prioridad
  getPrioridades: () => {
    return [
      { value: 'baja', label: 'Baja', color: 'green' },
      { value: 'media', label: 'Media', color: 'yellow' },
      { value: 'alta', label: 'Alta', color: 'orange' },
      { value: 'critica', label: 'Crítica', color: 'red' },
    ];
  },
};

export default solicitudesService;
