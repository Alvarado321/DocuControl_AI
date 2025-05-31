import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import tramitesService from '../../services/tramitesService';

const TimeEstimator = ({ tramite, datosAdicionales = {}, onTimeChange }) => {
  const [estimacionTiempo, setEstimacionTiempo] = useState(null);
  const [showFactores, setShowFactores] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tramite) {
      estimarTiempo();
    }
  }, [tramite, datosAdicionales]);

  const estimarTiempo = async () => {
    setLoading(true);
    try {
      const resultado = tramitesService.estimarTiempoProcesamiento(tramite, datosAdicionales);
      setEstimacionTiempo(resultado);
      
      // Notificar al componente padre sobre el cambio de tiempo
      if (onTimeChange) {
        onTimeChange(resultado);
      }
    } catch (error) {
      console.error('Error al estimar tiempo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (tiempoEstimado) => {
    if (tiempoEstimado <= 3) return 'text-green-600 bg-green-100';
    if (tiempoEstimado <= 7) return 'text-yellow-600 bg-yellow-100';
    if (tiempoEstimado <= 15) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (tiempoEstimado) => {
    if (tiempoEstimado <= 7) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
        });
  };

  if (!tramite) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
            Estimación de Tiempos
          </h3>
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>

        {estimacionTiempo && (
          <div className="space-y-4">
            {/* Tiempo principal */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(estimacionTiempo.tiempoEstimado)}
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Tiempo estimado de procesamiento</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {tramitesService.formatearTiempo(estimacionTiempo.tiempoEstimado)}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estimacionTiempo.tiempoEstimado)}`}>
                  {estimacionTiempo.tiempoEstimado <= 3 && 'Rápido'}
                  {estimacionTiempo.tiempoEstimado > 3 && estimacionTiempo.tiempoEstimado <= 7 && 'Normal'}
                  {estimacionTiempo.tiempoEstimado > 7 && estimacionTiempo.tiempoEstimado <= 15 && 'Moderado'}
                  {estimacionTiempo.tiempoEstimado > 15 && 'Extenso'}
                </div>
              </div>
              
              {/* Comparación con tiempo base */}
              {estimacionTiempo.tiempoEstimado !== estimacionTiempo.tiempoBase && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tiempo base del trámite:</span>
                    <span className="text-gray-500">
                      {tramitesService.formatearTiempo(estimacionTiempo.tiempoBase)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Diferencia:</span>
                    <span className={
                      estimacionTiempo.tiempoEstimado > estimacionTiempo.tiempoBase 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }>
                      {estimacionTiempo.tiempoEstimado > estimacionTiempo.tiempoBase ? '+' : ''}
                      {estimacionTiempo.tiempoEstimado - estimacionTiempo.tiempoBase} días
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fecha estimada de finalización */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Fecha estimada de finalización</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {formatearFecha(estimacionTiempo.fechaEstimadaFinalizacion)}
                  </p>
                </div>
              </div>
            </div>

            {/* Factores que afectan el tiempo */}
            {estimacionTiempo.factores && estimacionTiempo.factores.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowFactores(!showFactores)}
                  className="w-full flex items-center justify-between p-3 text-left bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-blue-800">
                    Factores que afectan el tiempo ({estimacionTiempo.factores.length})
                  </span>
                  {showFactores ? (
                    <ChevronUpIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-blue-600" />
                  )}
                </button>

                {showFactores && (
                  <div className="bg-white rounded-lg border border-blue-200">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Factores considerados en la estimación:
                      </h4>
                      <div className="space-y-3">
                        {estimacionTiempo.factores.map((factor, index) => (
                          <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 mr-3">
                              {factor.efecto && factor.efecto.includes('Reduce') ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              ) : (
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{factor.factor}</p>
                              <p className="text-xs text-gray-600 mt-1">{factor.efecto}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Información adicional */}
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-indigo-700">
                  <p className="font-medium mb-1">Consideraciones importantes:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Los tiempos se calculan solo en días hábiles (lunes a viernes)</li>
                    <li>• No incluye días festivos ni cierres administrativos</li>
                    <li>• El tiempo puede variar si se requiere información adicional</li>
                    <li>• Recibirás notificaciones sobre el progreso de tu solicitud</li>
                    <li>• Puedes acelerar el proceso con el servicio urgente (donde aplique)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Opciones para acelerar el proceso */}
            {tramite.categoria === 'licencias' && !datosAdicionales.urgente && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      ¿Necesitas el trámite más rápido?
                    </h4>
                    <p className="text-xs text-yellow-700 mb-2">
                      Puedes solicitar el procesamiento urgente para reducir el tiempo a{' '}
                      {tramitesService.formatearTiempo(Math.max(1, Math.ceil(estimacionTiempo.tiempoBase * 0.3)))}
                    </p>
                    <p className="text-xs text-yellow-600 font-medium">
                      * Costo adicional del 50% sobre la tarifa base
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TimeEstimator;
