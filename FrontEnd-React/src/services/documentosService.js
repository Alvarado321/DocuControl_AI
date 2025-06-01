import api from './api';

const documentosService = {
  // Subir documento
  subirDocumento: async (solicitudId, formData) => {
    try {
      console.log(`Subiendo documento para solicitud ${solicitudId}...`);
      
      const response = await api.post(`/api/documentos/subir/${solicitudId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos de timeout
      });
      
      console.log('Documento subido exitosamente:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al subir documento:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error al subir documento',
      };
    }
  },

  // Obtener documentos de una solicitud
  obtenerDocumentosSolicitud: async (solicitudId) => {
    try {
      const response = await api.get(`/api/documentos/solicitud/${solicitudId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener documentos',
      };
    }
  },

  // Obtener información de un documento específico
  obtenerDocumento: async (documentoId) => {
    try {
      const response = await api.get(`/api/documentos/${documentoId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener documento',
      };
    }
  },

  // Descargar documento
  descargarDocumento: async (documentoId) => {
    try {
      const response = await api.get(`/api/documentos/descargar/${documentoId}`, {
        responseType: 'blob', // Importante para archivos
      });
      
      return { success: true, data: response.data, headers: response.headers };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al descargar documento',
      };
    }
  },

  // Verificar integridad de documentos (solo admin)
  verificarIntegridad: async () => {
    try {
      const response = await api.post('/api/documentos/verificar-integridad');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al verificar integridad',
      };
    }
  },

  // Tipos de documentos disponibles
  getTiposDocumento: () => {
    return [
      { value: 'DNI', label: 'DNI' },
      { value: 'RUC', label: 'RUC' },
      { value: 'recibo_servicios', label: 'Recibo de Servicios' },
      { value: 'plano_ubicacion', label: 'Plano de Ubicación' },
      { value: 'certificado_compatibilidad', label: 'Certificado de Compatibilidad' },
      { value: 'planos_arquitectonicos', label: 'Planos Arquitectónicos' },
      { value: 'memoria_descriptiva', label: 'Memoria Descriptiva' },
      { value: 'estudio_suelos', label: 'Estudio de Suelos' },
      { value: 'declaracion_jurada', label: 'Declaración Jurada' },
      { value: 'general', label: 'General' },
    ];
  },

  // Estados de validación
  getEstadosValidacion: () => {
    return [
      { value: 'pendiente', label: 'Pendiente', color: 'gray' },
      { value: 'valido', label: 'Válido', color: 'green' },
      { value: 'invalido', label: 'Inválido', color: 'red' },
      { value: 'observado', label: 'Observado', color: 'yellow' },
    ];
  },

  // Formatear tamaño de archivo
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validar tipo de archivo
  validateFileType: (file) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return allowedTypes.includes(file.type);
  },

  // Validar tamaño de archivo (máximo 10MB)
  validateFileSize: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  },
};

export default documentosService;
