import api from './api';

const documentosService = {
  // Subir documento
  subirDocumento: async (solicitudId, formData) => {
    try {
      const response = await api.post(`/api/documentos/subir/${solicitudId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al subir documento',
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
