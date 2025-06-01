import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  HashtagIcon,
  TagIcon
} from '@heroicons/react/24/outline';

import solicitudesService from '../../services/solicitudesService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

const SolicitudesPage = () => {
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedPrioridad, setSelectedPrioridad] = useState('');
  const [sortBy, setSortBy] = useState('fecha_creacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Obtener solicitudes con React Query
  const {
    data: solicitudesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['mis-solicitudes'],
    queryFn: async () => {
      const result = await solicitudesService.getMisSolicitudes();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error) => {
      showNotification(`Error al cargar solicitudes: ${error.message}`, 'error');
    }
  });

  const estados = solicitudesService.getEstados();
  const prioridades = solicitudesService.getPrioridades();

  // Filtrar y ordenar solicitudes
  const filteredSolicitudes = useMemo(() => {
    if (!solicitudesData) return [];

    let filtered = solicitudesData.filter(solicitud => {
      const matchesSearch = solicitud.numero_expediente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           solicitud.tramite?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           solicitud.observaciones?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = !selectedEstado || solicitud.estado === selectedEstado;
      const matchesPrioridad = !selectedPrioridad || solicitud.prioridad === selectedPrioridad;

      return matchesSearch && matchesEstado && matchesPrioridad;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];      if (sortBy === 'fecha_creacion' || sortBy === 'fecha_actualizacion') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
        
        // Verificar si las fechas son válidas
        if (isNaN(aValue.getTime())) aValue = new Date(0);
        if (isNaN(bValue.getTime())) bValue = new Date(0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [solicitudesData, searchTerm, selectedEstado, selectedPrioridad, sortBy, sortOrder]);

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
        month: 'short',
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar solicitudes</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        <div className="mt-6">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mt-[60px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis Solicitudes</h1>
            <p className="mt-2 text-blue-100">
              Gestiona y da seguimiento a todas tus solicitudes de trámites
            </p>
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                <span>{filteredSolicitudes.length} solicitudes</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span>{filteredSolicitudes.filter(s => s.estado === 'aprobado').length} aprobadas</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{filteredSolicitudes.filter(s => s.estado === 'pendiente' || s.estado === 'en_revision').length} en proceso</span>
              </div>
            </div>
          </div>
          <Link
            to="/tramites"
            className="inline-flex items-center px-4 py-2 border border-white border-opacity-30 rounded-md shadow-sm text-sm font-medium text-white bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por expediente, trámite o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Controles de filtro y ordenamiento */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  showFilters ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtros
              </button>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="fecha_creacion-desc">Más recientes</option>
                <option value="fecha_creacion-asc">Más antiguos</option>
                <option value="fecha_actualizacion-desc">Última actualización</option>
                <option value="numero_expediente-asc">Número de expediente</option>
              </select>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">Todos los estados</option>
                    {estados.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={selectedPrioridad}
                    onChange={(e) => setSelectedPrioridad(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">Todas las prioridades</option>
                    {prioridades.map(prioridad => (
                      <option key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedEstado('');
                      setSelectedPrioridad('');
                      setSearchTerm('');
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de solicitudes */}
      {filteredSolicitudes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {solicitudesData?.length === 0 ? 'No tienes solicitudes' : 'No se encontraron solicitudes'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {solicitudesData?.length === 0 
                ? 'Inicia tu primera solicitud de trámite'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {solicitudesData?.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/tramites"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ver Trámites Disponibles
                </Link>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSolicitudes.map((solicitud) => {
            const estadoInfo = getEstadoInfo(solicitud.estado);
            const prioridadInfo = getPrioridadInfo(solicitud.prioridad);

            return (
              <Card key={solicitud.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header de la solicitud */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <HashtagIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-900">
                            {solicitud.numero_expediente}
                          </span>
                        </div>
                        <Badge 
                          variant={estadoInfo.color}
                          className="text-xs"
                        >
                          {estadoInfo.label}
                        </Badge>
                        <Badge 
                          variant={prioridadInfo.color}
                          className="text-xs"
                        >
                          {prioridadInfo.label}
                        </Badge>
                      </div>

                      {/* Título del trámite */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {solicitud.tramite?.nombre || 'Trámite no especificado'}
                      </h3>

                      {/* Descripción/Observaciones */}
                      {solicitud.observaciones && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {solicitud.observaciones}
                        </p>
                      )}

                      {/* Información adicional */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>Creado: {formatDate(solicitud.fecha_creacion)}</span>
                        </div>
                        
                        {solicitud.fecha_actualizacion && (
                          <div className="flex items-center text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span>Actualizado: {formatDate(solicitud.fecha_actualizacion)}</span>
                          </div>
                        )}

                        {solicitud.tramite?.costo && solicitud.tramite.costo > 0 && (
                          <div className="flex items-center text-gray-500">
                            <TagIcon className="h-4 w-4 mr-2" />
                            <span>Costo: {formatCurrency(solicitud.tramite.costo)}</span>
                          </div>
                        )}
                      </div>

                      {/* Datos adicionales específicos */}
                      {solicitud.datos_adicionales && Object.keys(solicitud.datos_adicionales).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Datos específicos:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                            {Object.entries(solicitud.datos_adicionales).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex-shrink-0 ml-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/solicitudes/${solicitud.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SolicitudesPage;
