import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import useML from '../../hooks/useML';
import LoadingSpinner from '../common/LoadingSpinner';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const PRIORITY_LABELS = ['critica', 'alta', 'media', 'baja'];
const PRIORITY_COLORS = {
  critica: '#ef4444',
  alta: '#f59e42',
  media: '#facc15',
  baja: '#22c55e',
};

function getPriorityCounts(data, key) {
  const counts = { critica: 0, alta: 0, media: 0, baja: 0 };
  data.forEach(item => {
    const val = item[key];
    if (counts[val] !== undefined) counts[val]++;
  });
  return counts;
}

const MLPriorityComparison = () => {
  const { getComparacionPrioridad } = useML();
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getComparacionPrioridad().then(result => {
      if (result.success) {
        setComparisonData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
  }, [getComparacionPrioridad]);

  if (loading) return <LoadingSpinner label="Cargando comparación ML..." />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!comparisonData.length) return <div>No hay datos para mostrar.</div>;

  // Agrupar por prioridad real y predicha
  const realCounts = getPriorityCounts(comparisonData, 'prioridad');
  const predCounts = getPriorityCounts(comparisonData, 'prioridad_predicha');

  // Datos para gráfico de barras
  const barData = {
    labels: PRIORITY_LABELS.map(l => l.toUpperCase()),
    datasets: [
      {
        label: 'Real',
        data: PRIORITY_LABELS.map(l => realCounts[l]),
        backgroundColor: 'rgba(59,130,246,0.7)',
      },
      {
        label: 'Predicha ML',
        data: PRIORITY_LABELS.map(l => predCounts[l]),
        backgroundColor: 'rgba(16,185,129,0.7)',
      },
    ],
  };

  // Datos para gráfico de pastel (distribución real)
  const doughnutData = {
    labels: PRIORITY_LABELS.map(l => l.toUpperCase()),
    datasets: [
      {
        data: PRIORITY_LABELS.map(l => realCounts[l]),
        backgroundColor: PRIORITY_LABELS.map(l => PRIORITY_COLORS[l]),
      },
    ],
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Comparación de Prioridad (Real vs ML)</h3>
        <Bar data={barData} options={{
          responsive: true,
          plugins: { legend: { position: 'top' }, title: { display: false } },
        }} />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Distribución Real de Prioridades</h3>
        <Doughnut data={doughnutData} options={{
          plugins: { legend: { position: 'bottom' } },
        }} />
      </div>
    </div>
  );
};

export default MLPriorityComparison;
