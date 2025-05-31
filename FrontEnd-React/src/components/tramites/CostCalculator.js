import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import tramitesService from '../../services/tramitesService';

const CostCalculator = ({ tramite, datosAdicionales = {}, onCostChange }) => {
  const [costoCalculado, setCostoCalculado] = useState(null);
  const [showDesglose, setShowDesglose] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tramite) {
      calcularCosto();
    }
  }, [tramite, datosAdicionales]);

  const calcularCosto = async () => {
    setLoading(true);
    try {
      const resultado = tramitesService.calcularCostoDinamico(tramite, datosAdicionales);
      setCostoCalculado(resultado);
      
      // Notificar al componente padre sobre el cambio de costo
      if (onCostChange) {
        onCostChange(resultado);
      }
    } catch (error) {
      console.error('Error al calcular costo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tramite) return null;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalculatorIcon className="h-5 w-5 mr-2 text-green-600" />
            Calculadora de Costos
          </h3>
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
          )}
        </div>

        {costoCalculado && (
          <div className="space-y-4">
            {/* Costo principal */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Costo total estimado</p>
                  <p className="text-2xl font-bold text-green-600 flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 mr-1" />
                    {costoCalculado.costoTotal === 0 
                      ? 'Gratuito' 
                      : tramitesService.formatearMoneda(costoCalculado.costoTotal)
                    }
                  </p>
                </div>
                
                {costoCalculado.recargos > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Costo base</p>
                    <p className="text-lg text-gray-500 line-through">
                      {tramitesService.formatearMoneda(costoCalculado.costoBase)}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">
                      +{tramitesService.formatearMoneda(costoCalculado.recargos)} en recargos
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botón para mostrar desglose */}
            {costoCalculado.desglose.length > 1 && (
              <button
                onClick={() => setShowDesglose(!showDesglose)}
                className="w-full flex items-center justify-between p-3 text-left bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-green-800">
                  Ver desglose detallado
                </span>
                {showDesglose ? (
                  <ChevronUpIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-green-600" />
                )}
              </button>
            )}

            {/* Desglose detallado */}
            {showDesglose && (
              <div className="bg-white rounded-lg border border-green-200">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Desglose de costos:
                  </h4>
                  <div className="space-y-2">
                    {costoCalculado.desglose.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">{item.concepto}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.valor === 0 ? 'Incluido' : tramitesService.formatearMoneda(item.valor)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          {costoCalculado.costoTotal === 0 
                            ? 'Gratuito' 
                            : tramitesService.formatearMoneda(costoCalculado.costoTotal)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Los costos pueden variar según la complejidad del trámite</li>
                    <li>• Los recargos se aplican automáticamente según los datos proporcionados</li>
                    <li>• Este es un cálculo estimado, el costo final se confirmará al procesar la solicitud</li>
                    {costoCalculado.costoTotal > 0 && (
                      <li>• El pago se realizará al momento de presentar la documentación</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Opciones de pago si aplica */}
            {costoCalculado.costoTotal > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Formas de pago disponibles:
                </h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• Efectivo en la oficina de atención</p>
                  <p>• Transferencia bancaria</p>
                  <p>• PSE (Pagos Seguros en Línea)</p>
                  <p>• Tarjeta de crédito/débito</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CostCalculator;
