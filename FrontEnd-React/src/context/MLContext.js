import React, { createContext, useContext, useState, useEffect } from 'react';
import useML from '../hooks/useML';

const MLContext = createContext({});

export const useMLContext = () => {
  const context = useContext(MLContext);
  if (!context) {
    throw new Error('useMLContext debe ser usado dentro de MLProvider');
  }
  return context;
};

export const MLProvider = ({ children }) => {
  const ml = useML();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos

  // Auto-refresh de estadísticas ML
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      ml.getEstadisticas();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, ml]);

  const value = {
    ...ml,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
  };

  return (
    <MLContext.Provider value={value}>
      {children}
    </MLContext.Provider>
  );
};
