import React from 'react';
import useAuth from '../../hooks/useAuth';
import useML from '../../hooks/useML';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const { mlStats, loading: mlLoading } = useML();

  const stats = [
    {
      name: 'Mis Solicitudes',
      value: '12',
      change: '+2.1%',
      changeType: 'positive',
      icon: ClipboardDocumentListIcon,
      color: 'primary'
    },
    {
      name: 'Trámites Disponibles',
      value: '24',
      change: '+1 nuevo',
      changeType: 'positive',
      icon: DocumentTextIcon,
      color: 'secondary'
    },
    {
      name: 'Documentos',
      value: '8',
      change: '+3 este mes',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'info'
    },
    {
      name: 'IA Procesando',
      value: mlStats?.processing || '0',
      change: 'En tiempo real',
      changeType: 'neutral',
      icon: CpuChipIcon,
      color: 'warning'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'solicitud',
      title: 'Solicitud de Certificado de Residencia',
      status: 'en_proceso',
      date: '2025-05-29',
      priority: 'media'
    },
    {
      id: 2,
      type: 'documento',
      title: 'Cédula de Ciudadanía cargada',
      status: 'completado',
      date: '2025-05-28',
      priority: 'baja'
    },
    {
      id: 3,
      type: 'tramite',
      title: 'Nuevo trámite: Licencia de Construcción',
      status: 'disponible',
      date: '2025-05-27',
      priority: 'alta'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      completado: 'text-secondary-600 bg-secondary-50',
      en_proceso: 'text-warning-600 bg-warning-50',
      pendiente: 'text-danger-600 bg-danger-50',
      disponible: 'text-info-600 bg-info-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'alta') return <ExclamationTriangleIcon className="h-4 w-4 text-danger-500" />;
    if (priority === 'media') return <ExclamationTriangleIcon className="h-4 w-4 text-warning-500" />;
    return <CheckCircleIcon className="h-4 w-4 text-secondary-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          ¡Bienvenido, {user?.nombre}! 👋
        </h1>
        <p className="mt-2 text-primary-100">
          Gestiona tus trámites municipales de forma inteligente con DocuControl AI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="relative overflow-hidden">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-secondary-600' : 
                    stat.changeType === 'negative' ? 'text-danger-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card title="Actividad Reciente" subtitle="Últimas acciones en tu cuenta">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getPriorityIcon(activity.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ML Insights */}
        <div>
          <Card title="Inteligencia Artificial" subtitle="Análisis en tiempo real">
            {mlLoading ? (
              <LoadingSpinner className="py-8" />
            ) : (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CpuChipIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-primary-900">
                      IA Activa
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 mt-1">
                    Procesando {mlStats?.processing || 0} solicitudes
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precisión ML</span>
                    <span className="text-sm font-medium text-secondary-600">
                      {mlStats?.accuracy || '95.2%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tiempo promedio</span>
                    <span className="text-sm font-medium text-info-600">
                      {mlStats?.avgTime || '2.3s'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prioridades detectadas</span>
                    <span className="text-sm font-medium text-warning-600">
                      {mlStats?.priorities || '3'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Ver análisis completo →
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card title="Acciones Rápidas" subtitle="Tareas frecuentes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <DocumentTextIcon className="h-6 w-6 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Nueva Solicitud</h3>
            <p className="text-sm text-gray-500">Iniciar un nuevo trámite</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <ClipboardDocumentListIcon className="h-6 w-6 text-secondary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Mis Solicitudes</h3>
            <p className="text-sm text-gray-500">Ver estado de trámites</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <ChartBarIcon className="h-6 w-6 text-info-600 mb-2" />
            <h3 className="font-medium text-gray-900">Subir Documento</h3>
            <p className="text-sm text-gray-500">Cargar documentos necesarios</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
