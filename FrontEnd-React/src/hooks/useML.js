import { useState, useCallback } from 'react';
import mlService from '../services/mlService';

const useML = () => {
  const [processing, setProcessing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);

  // Procesar solicitudes con ML
  const procesarSolicitudes = useCallback(async () => {
    try {
      setProcessing(true);
      setError(null);
      const result = await mlService.procesarSolicitudes();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al procesar solicitudes';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  }, []);

  // Obtener estadísticas ML
  const getEstadisticas = useCallback(async () => {
    try {
      setError(null);
      const result = await mlService.getEstadisticasML();
      
      if (result.success) {
        setStatistics(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al obtener estadísticas';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Obtener datos de tendencias mock
  const getTendencias = useCallback(() => {
    return mlService.getMockTrends();
  }, []);

  // Utilidades ML
  const getPriorityColor = useCallback((priority) => {
    return mlService.getPriorityColor(priority);
  }, []);

  const getPriorityBadge = useCallback((priority) => {
    return mlService.getPriorityBadge(priority);
  }, []);

  const formatMLScore = useCallback((score) => {
    return mlService.formatMLScore(score);
  }, []);

  const getConfidenceLevel = useCallback((score) => {
    return mlService.getConfidenceLevel(score);
  }, []);

  return {
    processing,
    statistics,
    error,
    procesarSolicitudes,
    getEstadisticas,
    getTendencias,
    getPriorityColor,
    getPriorityBadge,
    formatMLScore,
    getConfidenceLevel,
  };
};

export default useML;
