import React from 'react';
import MLPriorityComparison from '../../components/dashboard/MLPriorityComparison';

const AnalisisMLPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Análisis de Prioridad ML</h1>
      <MLPriorityComparison />
    </div>
  );
};

export default AnalisisMLPage;
