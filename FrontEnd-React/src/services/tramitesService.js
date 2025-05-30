import api from './api';

const tramitesService = {
  // Obtener todos los trámites
  getTramites: async () => {
    try {
      const response = await api.get('/api/tramites/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener trámites',
      };
    }
  },

  // Obtener trámite por ID
  getTramiteById: async (id) => {
    try {
      const response = await api.get(`/api/tramites/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener trámite',
      };
    }
  },

  // Obtener trámites por categoría
  getTramitesByCategoria: async (categoria) => {
    try {
      const response = await api.get(`/api/tramites/categoria/${categoria}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener trámites por categoría',
      };
    }
  },

  // Categorías disponibles
  getCategorias: () => {
    return [
      { value: 'licencias', label: 'Licencias' },
      { value: 'permisos', label: 'Permisos' },
      { value: 'servicios', label: 'Servicios' },
      { value: 'certificados', label: 'Certificados' },
      { value: 'otros', label: 'Otros' },
    ];
  },
};

export default tramitesService;
