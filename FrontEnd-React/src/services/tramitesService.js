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

  // Calcular costo dinámico del trámite
  calcularCostoDinamico: (tramite, datosAdicionales = {}) => {
    let costoBase = tramite.costo || 0;
    let costoTotal = costoBase;

    // Aplicar recargos según la categoría
    switch (tramite.categoria) {
      case 'licencias':
        // Recargo por urgencia
        if (datosAdicionales.urgente) {
          costoTotal += costoBase * 0.5; // 50% de recargo
        }
        // Recargo por área de construcción
        if (datosAdicionales.area_construccion > 500) {
          costoTotal += 50000; // Recargo fijo para construcciones grandes
        }
        break;

      case 'certificados':
        // Recargo por certificados múltiples
        if (datosAdicionales.cantidad > 1) {
          costoTotal += (datosAdicionales.cantidad - 1) * (costoBase * 0.3);
        }
        break;

      case 'permisos':
        // Recargo por duración del permiso
        if (datosAdicionales.duracion_meses > 12) {
          costoTotal += costoBase * 0.25; // 25% de recargo para permisos largos
        }
        break;
    }

    return {
      costoBase,
      costoTotal: Math.round(costoTotal),
      recargos: costoTotal - costoBase,
      desglose: this.getDesgloseCosto(tramite, datosAdicionales, costoBase, costoTotal)
    };
  },

  // Desglose detallado del costo
  getDesgloseCosto: (tramite, datosAdicionales, costoBase, costoTotal) => {
    const desglose = [
      { concepto: 'Costo base del trámite', valor: costoBase }
    ];

    if (tramite.categoria === 'licencias' && datosAdicionales.urgente) {
      desglose.push({ 
        concepto: 'Recargo por urgencia (50%)', 
        valor: costoBase * 0.5 
      });
    }

    if (tramite.categoria === 'licencias' && datosAdicionales.area_construccion > 500) {
      desglose.push({ 
        concepto: 'Recargo por construcción grande', 
        valor: 50000 
      });
    }

    if (tramite.categoria === 'certificados' && datosAdicionales.cantidad > 1) {
      desglose.push({ 
        concepto: `Certificados adicionales (${datosAdicionales.cantidad - 1})`, 
        valor: (datosAdicionales.cantidad - 1) * (costoBase * 0.3)
      });
    }

    if (tramite.categoria === 'permisos' && datosAdicionales.duracion_meses > 12) {
      desglose.push({ 
        concepto: 'Recargo por duración extendida (25%)', 
        valor: costoBase * 0.25 
      });
    }

    return desglose;
  },

  // Estimar tiempo de procesamiento dinámico
  estimarTiempoProcesamiento: (tramite, datosAdicionales = {}) => {
    let tiempoBase = tramite.tiempo_estimado_dias || 10;
    let tiempoTotal = tiempoBase;
    let factores = [];

    // Factores que afectan el tiempo según la categoría
    switch (tramite.categoria) {
      case 'licencias':
        if (datosAdicionales.urgente) {
          tiempoTotal = Math.max(1, Math.ceil(tiempoTotal * 0.3)); // Reducir a 30% del tiempo original
          factores.push({ factor: 'Trámite urgente', efecto: 'Reduce tiempo en 70%' });
        }
        if (datosAdicionales.area_construccion > 1000) {
          tiempoTotal += 5; // 5 días adicionales para construcciones muy grandes
          factores.push({ factor: 'Construcción de gran escala', efecto: '+5 días para revisión adicional' });
        }
        if (datosAdicionales.documentos_incompletos) {
          tiempoTotal += 3; // 3 días adicionales si faltan documentos
          factores.push({ factor: 'Documentos incompletos', efecto: '+3 días para completar información' });
        }
        break;

      case 'certificados':
        if (datosAdicionales.cantidad > 5) {
          tiempoTotal += 2; // 2 días adicionales para certificados múltiples
          factores.push({ factor: 'Múltiples certificados', efecto: '+2 días para procesamiento adicional' });
        }
        break;

      case 'permisos':
        if (datosAdicionales.requiere_inspeccion) {
          tiempoTotal += 7; // 7 días adicionales para inspección
          factores.push({ factor: 'Requiere inspección presencial', efecto: '+7 días para coordinación de visita' });
        }
        break;
    }

    // Factores generales
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    
    // Temporada alta (diciembre y enero)
    if (mesActual === 12 || mesActual === 1) {
      tiempoTotal += 2;
      factores.push({ factor: 'Temporada alta', efecto: '+2 días por alta demanda' });
    }

    return {
      tiempoBase,
      tiempoEstimado: Math.max(1, tiempoTotal), // Mínimo 1 día
      factores,
      fechaEstimadaFinalizacion: this.calcularFechaFinalizacion(tiempoTotal)
    };
  },

  // Calcular fecha estimada de finalización (solo días hábiles)
  calcularFechaFinalizacion: (diasHabiles) => {
    const fecha = new Date();
    let diasAgregados = 0;
    
    while (diasAgregados < diasHabiles) {
      fecha.setDate(fecha.getDate() + 1);
      
      // Saltar fines de semana (sábado = 6, domingo = 0)
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    return fecha;
  },

  // Buscar trámites con filtros avanzados
  buscarTramites: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.busqueda) params.append('q', filtros.busqueda);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.costo_min) params.append('costo_min', filtros.costo_min);
      if (filtros.costo_max) params.append('costo_max', filtros.costo_max);
      if (filtros.tiempo_max) params.append('tiempo_max', filtros.tiempo_max);
      if (filtros.solo_gratuitos) params.append('gratuitos', 'true');
      
      const response = await api.get(`/api/tramites/buscar?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en la búsqueda de trámites',
      };
    }
  },

  // Obtener estadísticas de trámites
  getEstadisticas: async () => {
    try {
      const response = await api.get('/api/tramites/estadisticas');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener estadísticas',
      };
    }
  },

  // Obtener trámites populares/recomendados
  getTramitesPopulares: async (limite = 5) => {
    try {
      const response = await api.get(`/api/tramites/populares?limite=${limite}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener trámites populares',
      };
    }
  },

  // Formatear moneda colombiana
  formatearMoneda: (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  },

  // Formatear tiempo estimado
  formatearTiempo: (dias) => {
    if (dias === 1) return '1 día hábil';
    if (dias < 7) return `${dias} días hábiles`;
    
    const semanas = Math.floor(dias / 5);
    const diasRestantes = dias % 5;
    
    if (diasRestantes === 0) {
      return semanas === 1 ? '1 semana' : `${semanas} semanas`;
    } else {
      return `${semanas} semana${semanas > 1 ? 's' : ''} y ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
    }
  }
};

export default tramitesService;
