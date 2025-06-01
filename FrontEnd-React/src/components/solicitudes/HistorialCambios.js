import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClockIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

import Card from '../common/Card';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import solicitudesService from '../../services/solicitudesService';

const HistorialCambios = ({ solicitudId }) => {
  const [selectedChange, setSelectedChange] = useState(null);
  const [showAllChanges, setShowAllChanges] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const { data: historial = [], isLoading, error } = useQuery({
    queryKey: ['historial-cambios', solicitudId],
    queryFn: () => solicitudesService.getHistorialCambios(solicitudId),
    enabled: !!solicitudId
  });

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getChangeTypeInfo = (tipo) => {
    const types = {
      creacion: {
        label: 'Creación',
        icon: DocumentTextIcon,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      actualizacion: {
        label: 'Actualización',
        icon: PencilIcon,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      eliminacion: {
        label: 'Eliminación',
        icon: TrashIcon,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      cambio_estado: {
        label: 'Cambio de Estado',
        icon: ArrowPathIcon,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      comentario: {
        label: 'Comentario',
        icon: ChatBubbleLeftRightIcon,
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      },
      documento: {
        label: 'Documento',
        icon: DocumentTextIcon,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      sistema: {
        label: 'Sistema',
        icon: InformationCircleIcon,
        color: 'gray',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    };

    return types[tipo] || types.sistema;
  };

  const getUserInitials = (nombre) => {
    if (!nombre) return 'SYS';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRolColor = (rol) => {
    const colors = {
      ciudadano: 'bg-blue-500',
      funcionario: 'bg-green-500',
      admin: 'bg-purple-500',
      sistema: 'bg-gray-500'
    };
    return colors[rol] || 'bg-gray-500';
  };

  const filteredHistorial = historial.filter(change => {
    if (filterType === 'all') return true;
    return change.tipo === filterType;
  });

  const displayedHistorial = showAllChanges ? filteredHistorial : filteredHistorial.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error al cargar el historial
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo cargar el historial de cambios de esta solicitud.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Cambios
            </h3>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="all">Todos los cambios</option>
                <option value="creacion">Creación</option>
                <option value="actualizacion">Actualizaciones</option>
                <option value="cambio_estado">Cambios de Estado</option>
                <option value="comentario">Comentarios</option>
                <option value="documento">Documentos</option>
                <option value="sistema">Sistema</option>
              </select>
              
              <span className="text-sm text-gray-500">
                {filteredHistorial.length} cambio{filteredHistorial.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de cambios */}
      <Card>
        <div className="p-6">
          {filteredHistorial.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay cambios registrados
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterType === 'all' 
                  ? 'Aún no se han registrado cambios en esta solicitud.'
                  : `No hay cambios del tipo "${getChangeTypeInfo(filterType).label}" registrados.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedHistorial.map((cambio, index) => {
                const typeInfo = getChangeTypeInfo(cambio.tipo);
                const Icon = typeInfo.icon;
                
                return (
                  <div
                    key={cambio.id}
                    className={`border rounded-lg p-4 ${typeInfo.bgColor} ${typeInfo.borderColor} transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icono y avatar del usuario */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-full ${typeInfo.bgColor}`}>
                            <Icon className={`h-4 w-4 text-${typeInfo.color}-600`} />
                          </div>
                          
                          {cambio.usuario ? (
                            <div className={`
                              h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium
                              ${getRolColor(cambio.usuario.rol)}
                            `}>
                              {getUserInitials(cambio.usuario.nombre)}
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                              SYS
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contenido del cambio */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={typeInfo.color} size="sm">
                              {typeInfo.label}
                            </Badge>
                            {cambio.automatico && (
                              <Badge variant="gray" size="xs">
                                Automático
                              </Badge>
                            )}
                          </div>
                          
                          <button
                            onClick={() => setSelectedChange(cambio)}
                            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Ver detalle
                          </button>
                        </div>

                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {cambio.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {cambio.descripcion}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {cambio.usuario ? cambio.usuario.nombre : 'Sistema'}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDate(cambio.fecha)}
                            </div>
                          </div>
                          
                          {cambio.campos_modificados && cambio.campos_modificados.length > 0 && (
                            <span className="text-purple-600">
                              {cambio.campos_modificados.length} campo{cambio.campos_modificados.length !== 1 ? 's' : ''} modificado{cambio.campos_modificados.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Preview de cambios */}
                        {cambio.valor_anterior && cambio.valor_nuevo && (
                          <div className="mt-3 bg-white rounded-md p-3 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-gray-500 font-medium">Valor anterior:</span>
                                <div className="bg-red-50 rounded p-2 mt-1">
                                  <span className="text-red-800">{cambio.valor_anterior}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Valor nuevo:</span>
                                <div className="bg-green-50 rounded p-2 mt-1">
                                  <span className="text-green-800">{cambio.valor_nuevo}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Botón para mostrar más */}
              {filteredHistorial.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAllChanges(!showAllChanges)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {showAllChanges ? (
                      <>
                        <ChevronUpIcon className="h-4 w-4 mr-2" />
                        Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-4 w-4 mr-2" />
                        Mostrar {filteredHistorial.length - 5} cambio{filteredHistorial.length - 5 !== 1 ? 's' : ''} más
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de detalle */}
      <Modal
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
        title="Detalle del Cambio"
        size="lg"
      >
        {selectedChange && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${getChangeTypeInfo(selectedChange.tipo).bgColor}`}>
                {React.createElement(getChangeTypeInfo(selectedChange.tipo).icon, {
                  className: `h-6 w-6 text-${getChangeTypeInfo(selectedChange.tipo).color}-600`
                })}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedChange.titulo}
                </h3>
                <p className="text-sm text-gray-500">
                  {getChangeTypeInfo(selectedChange.tipo).label}
                </p>
              </div>
            </div>

            {/* Información del cambio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <div className="mt-1 flex items-center space-x-2">
                  {selectedChange.usuario ? (
                    <>
                      <div className={`
                        h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium
                        ${getRolColor(selectedChange.usuario.rol)}
                      `}>
                        {getUserInitials(selectedChange.usuario.nombre)}
                      </div>
                      <span className="text-sm text-gray-900">
                        {selectedChange.usuario.nombre}
                      </span>
                      <Badge variant={selectedChange.usuario.rol} size="xs">
                        {selectedChange.usuario.rol}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Sistema automático</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha y hora</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedChange.fecha)}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {selectedChange.descripcion}
              </p>
            </div>

            {/* Campos modificados */}
            {selectedChange.campos_modificados && selectedChange.campos_modificados.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campos modificados
                </label>
                <div className="space-y-3">
                  {selectedChange.campos_modificados.map((campo, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {campo.nombre}
                        </span>
                        <Badge variant="blue" size="xs">
                          {campo.tipo}
                        </Badge>
                      </div>
                      
                      {campo.valor_anterior && campo.valor_nuevo && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 font-medium">Anterior:</span>
                            <div className="bg-red-50 rounded p-2 mt-1 border border-red-100">
                              <span className="text-red-800">{campo.valor_anterior}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Nuevo:</span>
                            <div className="bg-green-50 rounded p-2 mt-1 border border-green-100">
                              <span className="text-green-800">{campo.valor_nuevo}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadatos adicionales */}
            {selectedChange.metadatos && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información adicional
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(selectedChange.metadatos, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistorialCambios;
