import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import solicitudesService from '../../services/solicitudesService';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';

const TimelineEstados = ({ solicitudId }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Obtener timeline de la solicitud
  const {
    data: timeline,
    isLoading,
    error
  } = useQuery({
    queryKey: ['timeline', solicitudId],
    queryFn: async () => {
      // Por ahora simulamos datos del timeline
      // En el futuro esto vendría del backend
      return [
        {
          id: 1,
          estado: 'pendiente',
          fecha: new Date().toISOString(),
          usuario: 'Sistema',
          comentario: 'Solicitud creada y en espera de revisión inicial',
          automatico: true
        },
        {
          id: 2,
          estado: 'en_revision',
          fecha: new Date(Date.now() - 86400000).toISOString(),
          usuario: 'Ana García',
          comentario: 'Solicitud asignada para revisión de documentos',
          automatico: false
        },
        {
          id: 3,
          estado: 'observado',
          fecha: new Date(Date.now() - 172800000).toISOString(),
          usuario: 'Carlos López',
          comentario: 'Se requiere documentación adicional. Favor adjuntar certificado de residencia actualizado.',
          automatico: false
        }
      ];
    },
    enabled: !!solicitudId
  });

  const estados = solicitudesService.getEstados();

  const getEstadoInfo = (estado) => {
    const found = estados.find(e => e.value === estado);
    return found || { label: estado, value: estado, color: 'gray' };
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return ClockIcon;
      case 'en_revision':
        return EyeIcon;
      case 'observado':
        return ExclamationTriangleIcon;
      case 'aprobado':
        return CheckCircleIcon;
      case 'rechazado':
        return XCircleIcon;
      case 'finalizado':
        return CheckCircleIcon;
      default:
        return InformationCircleIcon;
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          No se pudo cargar el timeline de la solicitud
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline visual */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
            Historial de Estados
          </h3>

          <div className="flow-root">
            <ul className="-mb-8">
              {timeline.map((evento, eventoIdx) => {
                const estadoInfo = getEstadoInfo(evento.estado);
                const IconComponent = getEstadoIcon(evento.estado);
                const isLast = eventoIdx === timeline.length - 1;

                return (
                  <li key={evento.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                          aria-hidden="true" 
                        />
                      )}
                      
                      <div className="relative flex space-x-3">
                        {/* Icono del estado */}
                        <div>
                          <span className={`
                            h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                            bg-${estadoInfo.color}-500
                          `}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </span>
                        </div>

                        {/* Contenido del evento */}
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant={estadoInfo.color} className="text-xs">
                                {estadoInfo.label}
                              </Badge>
                              {evento.automatico && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Automático
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-900 mb-2">
                              {evento.comentario}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <UserIcon className="h-3 w-3 mr-1" />
                                {evento.usuario}
                              </div>
                              <div className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {formatDate(evento.fecha)}
                              </div>
                            </div>
                          </div>

                          {/* Botón de detalle */}
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <button
                              onClick={() => setSelectedEvent(evento)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Card>

      {/* Información adicional del timeline */}
      <Card>
        <div className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Información del Timeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-900">Total de eventos</div>
              <div className="text-blue-700">{timeline.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-900">Primer evento</div>
              <div className="text-green-700">
                {formatDate(timeline[timeline.length - 1]?.fecha)}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="font-medium text-orange-900">Último evento</div>
              <div className="text-orange-700">
                {formatDate(timeline[0]?.fecha)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de detalle del evento seleccionado */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalle del Evento
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge variant={getEstadoInfo(selectedEvent.estado).color}>
                    {getEstadoInfo(selectedEvent.estado).label}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha y hora</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedEvent.fecha)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="text-sm text-gray-900">{selectedEvent.usuario}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comentario</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedEvent.comentario}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-sm text-gray-900">
                    {selectedEvent.automatico ? 'Automático' : 'Manual'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineEstados;
