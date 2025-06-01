import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PrinterIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

import solicitudesService from '../../services/solicitudesService';
import tramitesService from '../../services/tramitesService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import TimelineEstados from '../../components/solicitudes/TimelineEstados';
import ComentariosSolicitud from '../../components/solicitudes/ComentariosSolicitud';
import HistorialCambios from '../../components/solicitudes/HistorialCambios';
import { useNotification } from '../../context/NotificationContext';

const SolicitudDetailPage = () => {
  const { id } = useParams();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('detalles');
  const [showTimeline, setShowTimeline] = useState(true);
  const [showDatosSolicitante, setShowDatosSolicitante] = useState(true);
  // Obtener detalles de la solicitud
  const {
    data: solicitud,
    isLoading: loadingSolicitud,
    error: solicitudError
  } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: async () => {
      const result = await solicitudesService.getSolicitudById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error) => {
      showNotification(`Error al cargar solicitud: ${error.message}`, 'error');
    }
  });
  // Obtener información del trámite relacionado
  const {
    data: tramite
  } = useQuery({
    queryKey: ['tramite', solicitud?.tramite_id],
    queryFn: async () => {
      if (!solicitud?.tramite_id) return null;
      const result = await tramitesService.getTramiteById(solicitud.tramite_id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!solicitud?.tramite_id
  });

  const estados = solicitudesService.getEstados();
  const prioridades = solicitudesService.getPrioridades();

  const getEstadoInfo = (estado) => {
    const found = estados.find(e => e.value === estado);
    return found || { label: estado, value: estado, color: 'gray' };
  };

  const getPrioridadInfo = (prioridad) => {
    const found = prioridades.find(p => p.value === prioridad);
    return found || { label: prioridad, value: prioridad, color: 'gray' };
  };
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Fecha no disponible';
    }
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn('Error formateando fecha:', dateString, error);
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: `Solicitud ${solicitud.numero_expediente}`,
        text: `Solicitud de trámite: ${tramite?.nombre || 'Trámite'}`,
        url: url,
      });
    } catch (error) {
      // Fallback para navegadores que no soportan Web Share API
      await navigator.clipboard.writeText(url);
      showNotification('Enlace copiado al portapapeles', 'success');
    }
  };

  if (loadingSolicitud) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (solicitudError || !solicitud) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error al cargar solicitud
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo cargar la información de la solicitud
        </p>
        <div className="mt-6">
          <Link
            to="/solicitudes"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Solicitudes
          </Link>
        </div>
      </div>
    );
  }

  const estadoInfo = getEstadoInfo(solicitud.estado);
  const prioridadInfo = getPrioridadInfo(solicitud.prioridad);

  const tabs = [
    { id: 'detalles', name: 'Detalles', icon: InformationCircleIcon },
    { id: 'timeline', name: 'Timeline', icon: ClockIcon },
    { id: 'comentarios', name: 'Comentarios', icon: ChatBubbleLeftRightIcon },
    { id: 'historial', name: 'Historial', icon: DocumentTextIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/solicitudes" className="text-gray-400 hover:text-gray-500">
              Mis Solicitudes
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-900 truncate">
                {solicitud.numero_expediente}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-mono text-gray-900">
                    {solicitud.numero_expediente}
                  </span>
                </div>
                <Badge variant={estadoInfo.color}>
                  {estadoInfo.label}
                </Badge>
                <Badge variant={prioridadInfo.color}>
                  {prioridadInfo.label}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {tramite?.nombre || 'Cargando trámite...'}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Fecha de Creación</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatDate(solicitud.fecha_creacion)}
                      </p>
                    </div>
                  </div>
                </div>

                {solicitud.fecha_actualizacion && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900">Última Actualización</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatDate(solicitud.fecha_actualizacion)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {tramite && tramite.costo > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TagIcon className="h-8 w-8 text-orange-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-900">Costo del Trámite</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(tramite.costo)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex-shrink-0 ml-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Imprimir
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de tabs */}
        <div className="p-6">
          {activeTab === 'detalles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contenido principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Información del trámite */}
                {tramite && (
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" />
                        Información del Trámite
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <p className="mt-1 text-sm text-gray-900">{tramite.nombre}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Descripción</label>
                          <p className="mt-1 text-sm text-gray-900">{tramite.descripcion}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <p className="mt-1 text-sm text-gray-900 capitalize">{tramite.categoria}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Tiempo estimado</label>
                            <p className="mt-1 text-sm text-gray-900">{tramite.tiempo_estimado_dias} días hábiles</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Observaciones de la solicitud */}
                {solicitud.observaciones && (
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500 mr-2" />
                        Observaciones
                      </h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {solicitud.observaciones}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Datos adicionales */}
                {solicitud.datos_adicionales && Object.keys(solicitud.datos_adicionales).length > 0 && (
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <InformationCircleIcon className="h-6 w-6 text-purple-500 mr-2" />
                        Datos Específicos del Trámite
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(solicitud.datos_adicionales).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </label>
                            <p className="mt-1 text-sm text-gray-900">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Datos del solicitante */}
                <Card>
                  <div className="p-6">
                    <button
                      onClick={() => setShowDatosSolicitante(!showDatosSolicitante)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <UserIcon className="h-6 w-6 text-indigo-500 mr-2" />
                        Datos del Solicitante
                      </h3>
                      <svg
                        className={`h-5 w-5 text-gray-500 transition-transform ${showDatosSolicitante ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showDatosSolicitante && (
                      <div className="mt-4 space-y-3">
                        {solicitud.solicitante?.nombre_completo && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                            <p className="mt-1 text-sm text-gray-900">{solicitud.solicitante.nombre_completo}</p>
                          </div>
                        )}
                        {solicitud.solicitante?.documento && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Documento</label>
                            <p className="mt-1 text-sm text-gray-900">{solicitud.solicitante.documento}</p>
                          </div>
                        )}
                        {solicitud.solicitante?.telefono && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <p className="mt-1 text-sm text-gray-900">{solicitud.solicitante.telefono}</p>
                          </div>
                        )}
                        {solicitud.solicitante?.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{solicitud.solicitante.email}</p>
                          </div>
                        )}
                        {solicitud.solicitante?.direccion && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <p className="mt-1 text-sm text-gray-900">{solicitud.solicitante.direccion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Timeline rápido */}
                <Card>
                  <div className="p-6">
                    <button
                      onClick={() => setShowTimeline(!showTimeline)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
                        Estado Actual
                      </h3>
                      <svg
                        className={`h-5 w-5 text-gray-500 transition-transform ${showTimeline ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showTimeline && (
                      <div className="mt-4">
                        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-${estadoInfo.color}-100 text-${estadoInfo.color}-800`}>
                          {estadoInfo.label}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {solicitud.fecha_actualizacion 
                            ? `Actualizado el ${formatDate(solicitud.fecha_actualizacion)}`
                            : `Creado el ${formatDate(solicitud.fecha_creacion)}`
                          }
                        </p>
                        <div className="mt-3">
                          <button
                            onClick={() => setActiveTab('timeline')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver timeline completo →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Acciones rápidas */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Acciones
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('comentarios')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                        Ver Comentarios
                      </button>
                      <button
                        onClick={() => setActiveTab('historial')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Ver Historial
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <TimelineEstados solicitudId={id} />
          )}

          {activeTab === 'comentarios' && (
            <ComentariosSolicitud solicitudId={id} />
          )}

          {activeTab === 'historial' && (
            <HistorialCambios solicitudId={id} />
          )}
        </div>
      </div>

      {/* Botón de regreso */}
      <div className="flex justify-start">
        <Link
          to="/solicitudes"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a Mis Solicitudes
        </Link>
      </div>
    </div>
  );
};

export default SolicitudDetailPage;
