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

  // Obtener todas las solicitudes (para funcionarios/admin)
  getAllSolicitudes: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/solicitudes${queryParams ? `?${queryParams}` : ''}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener solicitudes',
      };
    }
  },

  // Timeline de estados de una solicitud
  getTimelineEstados: async (solicitudId) => {
    try {
      // Simulando datos para desarrollo
      const timelineData = [
        {
          id: 1,
          estado: 'pendiente',
          fecha: '2025-01-15T10:00:00Z',
          usuario: 'Juan Pérez',
          comentario: 'Solicitud creada por el ciudadano',
          automatico: false
        },
        {
          id: 2,
          estado: 'en_revision',
          fecha: '2025-01-16T14:30:00Z',
          usuario: 'María García',
          comentario: 'Asignada para revisión técnica',
          automatico: false
        },
        {
          id: 3,
          estado: 'observado',
          fecha: '2025-01-17T09:15:00Z',
          usuario: 'Carlos López',
          comentario: 'Se requiere documentación adicional',
          automatico: false
        }
      ];
      
      // En producción, esta sería la llamada real:
      // const response = await api.get(`/api/solicitudes/${solicitudId}/timeline`);
      // return { success: true, data: response.data };
      
      return { success: true, data: timelineData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener timeline',
      };
    }
  },

  // Comentarios de una solicitud
  getComentarios: async (solicitudId) => {
    try {
      // Simulando datos para desarrollo
      const comentariosData = [
        {
          id: 1,
          mensaje: 'Solicitud recibida correctamente. Se procederá con la revisión.',
          fecha: '2025-01-15T10:30:00Z',
          usuario: {
            id: 1,
            nombre: 'María García',
            rol: 'funcionario',
            avatar: null
          },
          esInterno: false,
          editado: false
        },
        {
          id: 2,
          mensaje: 'Nota interna: Verificar documentación fiscal.',
          fecha: '2025-01-16T11:00:00Z',
          usuario: {
            id: 2,
            nombre: 'Carlos López',
            rol: 'funcionario',
            avatar: null
          },
          esInterno: true,
          editado: false
        },
        {
          id: 3,
          mensaje: 'Se ha completado la revisión inicial. Todo en orden.',
          fecha: '2025-01-17T16:45:00Z',
          usuario: {
            id: 1,
            nombre: 'María García',
            rol: 'funcionario',
            avatar: null
          },
          esInterno: false,
          editado: false
        }
      ];
      
      // En producción:
      // const response = await api.get(`/api/solicitudes/${solicitudId}/comentarios`);
      // return { success: true, data: response.data };
      
      return { success: true, data: comentariosData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener comentarios',
      };
    }
  },

  // Agregar comentario
  agregarComentario: async (solicitudId, comentarioData) => {
    try {
      const response = await api.post(`/api/solicitudes/${solicitudId}/comentarios`, comentarioData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al agregar comentario',
      };
    }
  },

  // Historial de cambios
  getHistorialCambios: async (solicitudId) => {
    try {
      // Simulando datos para desarrollo
      const historialData = [
        {
          id: 1,
          tipo: 'creacion',
          titulo: 'Solicitud creada',
          descripcion: 'Nueva solicitud de trámite creada por el ciudadano',
          fecha: '2025-01-15T10:00:00Z',
          usuario: {
            id: 1,
            nombre: 'Juan Pérez',
            rol: 'ciudadano'
          },
          automatico: false,
          valor_anterior: null,
          valor_nuevo: 'Solicitud creada',
          campos_modificados: [],
          metadatos: {
            ip: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        },
        {
          id: 2,
          tipo: 'cambio_estado',
          titulo: 'Estado actualizado',
          descripcion: 'Estado cambiado de "Pendiente" a "En Revisión"',
          fecha: '2025-01-16T14:30:00Z',
          usuario: {
            id: 2,
            nombre: 'María García',
            rol: 'funcionario'
          },
          automatico: false,
          valor_anterior: 'pendiente',
          valor_nuevo: 'en_revision',
          campos_modificados: [
            {
              nombre: 'estado',
              tipo: 'select',
              valor_anterior: 'pendiente',
              valor_nuevo: 'en_revision'
            }
          ],
          metadatos: {
            razon: 'Asignación para revisión técnica'
          }
        },
        {
          id: 3,
          tipo: 'actualizacion',
          titulo: 'Prioridad modificada',
          descripcion: 'Prioridad cambiada de "Media" a "Alta" por el sistema ML',
          fecha: '2025-01-16T15:00:00Z',
          usuario: null,
          automatico: true,
          valor_anterior: 'media',
          valor_nuevo: 'alta',
          campos_modificados: [
            {
              nombre: 'prioridad',
              tipo: 'select',
              valor_anterior: 'media',
              valor_nuevo: 'alta'
            }
          ],
          metadatos: {
            ml_score: 0.85,
            algoritmo: 'priority_classifier_v2'
          }
        },
        {
          id: 4,
          tipo: 'comentario',
          titulo: 'Comentario agregado',
          descripcion: 'Nuevo comentario del funcionario',
          fecha: '2025-01-17T09:15:00Z',
          usuario: {
            id: 3,
            nombre: 'Carlos López',
            rol: 'funcionario'
          },
          automatico: false,
          valor_anterior: null,
          valor_nuevo: 'Se requiere documentación adicional',
          campos_modificados: [],
          metadatos: {
            comentario_id: 4,
            es_interno: false
          }
        }
      ];
      
      // En producción:
      // const response = await api.get(`/api/solicitudes/${solicitudId}/historial`);
      // return { success: true, data: response.data };
      
      return { success: true, data: historialData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener historial',
      };
    }
  },

  // Actualizar estado de solicitud
  actualizarEstado: async (solicitudId, nuevoEstado, comentario = '') => {
    try {
      const response = await api.patch(`/api/solicitudes/${solicitudId}/estado`, {
        estado: nuevoEstado,
        comentario
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar estado',
      };
    }
  },

  // Exportar solicitudes
  exportarSolicitudes: async (formato = 'excel', filtros = {}) => {
    try {
      const params = { formato, ...filtros };
      const response = await api.get('/api/solicitudes/exportar', {
        params,
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `solicitudes_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al exportar solicitudes',
      };
    }
  },

  // Imprimir solicitud
  imprimirSolicitud: async (solicitudId) => {
    try {
      const response = await api.get(`/api/solicitudes/${solicitudId}/imprimir`, {
        responseType: 'blob'
      });
      
      // Abrir en nueva ventana para imprimir
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const printWindow = window.open(url, '_blank');
      printWindow.onload = () => {
        printWindow.print();
      };
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al generar impresión',
      };
    }
  },

  // Compartir solicitud
  compartirSolicitud: async (solicitudId, metodo = 'link') => {
    try {
      if (metodo === 'link') {
        const shareUrl = `${window.location.origin}/solicitudes/${solicitudId}`;
        if (navigator.share) {
          await navigator.share({
            title: 'Solicitud de Trámite',
            text: 'Compartir solicitud de trámite',
            url: shareUrl
          });
        } else {
          // Fallback: copiar al portapapeles
          await navigator.clipboard.writeText(shareUrl);
        }
        return { success: true, url: shareUrl };
      }
      
      const response = await api.post(`/api/solicitudes/${solicitudId}/compartir`, { metodo });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al compartir solicitud',
      };
    }
  }
};

export default solicitudesService;
