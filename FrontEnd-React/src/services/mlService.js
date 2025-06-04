import api from './api';

const mlService = {
  // Procesar solicitudes con ML
  procesarSolicitudes: async () => {
    try {
      const response = await api.post('/api/ml/procesar-solicitudes');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al procesar solicitudes con ML',
      };
    }
  },

  // Obtener estadísticas ML
  getEstadisticasML: async () => {
    try {
      const response = await api.get('/api/ml/estadisticas');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener estadísticas ML',
      };
    }
  },

  // Obtener colores para prioridades ML
  getPriorityColor: (priority) => {
    const colors = {
      critica: 'red',
      alta: 'orange',
      media: 'yellow',
      baja: 'green',
    };
    return colors[priority] || 'gray';
  },

  // Obtener badge de prioridad
  getPriorityBadge: (priority) => {
    const badges = {
      critica: { label: 'CRÍTICA', color: 'bg-red-100 text-red-800 border-red-200' },
      alta: { label: 'ALTA', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      media: { label: 'MEDIA', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      baja: { label: 'BAJA', color: 'bg-green-100 text-green-800 border-green-200' },
    };
    return badges[priority] || { label: 'SIN PRIORIDAD', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  },

  // Formatear puntuación ML
  formatMLScore: (score) => {
    if (!score) return '0.00';
    return parseFloat(score).toFixed(2);
  },

  // Obtener nivel de confianza
  getConfidenceLevel: (score) => {
    if (score >= 90) return { level: 'Muy Alta', color: 'green' };
    if (score >= 75) return { level: 'Alta', color: 'blue' };
    if (score >= 60) return { level: 'Media', color: 'yellow' };
    if (score >= 40) return { level: 'Baja', color: 'orange' };
    return { level: 'Muy Baja', color: 'red' };
  },

  // Simular datos de tendencias ML (para desarrollo)
  getMockTrends: () => {
    return {
      solicitudes_por_dia: [
        { fecha: '2025-05-24', total: 45, procesadas_ml: 38 },
        { fecha: '2025-05-25', total: 52, procesadas_ml: 44 },
        { fecha: '2025-05-26', total: 38, procesadas_ml: 35 },
        { fecha: '2025-05-27', total: 61, procesadas_ml: 58 },
        { fecha: '2025-05-28', total: 47, procesadas_ml: 42 },
        { fecha: '2025-05-29', total: 55, procesadas_ml: 51 },
        { fecha: '2025-05-30', total: 43, procesadas_ml: 40 },
      ],
      distribucion_prioridades: [
        { prioridad: 'critica', cantidad: 12, porcentaje: 15 },
        { prioridad: 'alta', cantidad: 28, porcentaje: 35 },
        { prioridad: 'media', cantidad: 32, porcentaje: 40 },
        { prioridad: 'baja', cantidad: 8, porcentaje: 10 },
      ],
    };
  },

  // Entrenar modelo de prioridad ML
  entrenarModeloPrioridad: async () => {
    try {
      const response = await api.post('/api/ml/entrenar-modelo-prioridad');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al entrenar el modelo de prioridad ML',
      };
    }
  },

  // Obtener comparación prioridad real vs predicha
  getComparacionPrioridad: async () => {
    try {
      const response = await api.get('/api/ml/comparacion-prioridad');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener comparación de prioridad',
      };
    }
  },
};

export default mlService;
