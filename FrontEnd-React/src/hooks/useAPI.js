import { useState, useEffect, useCallback } from 'react';

const useAPI = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = (...args) => {
    return fetchData(...args);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useAPI;
