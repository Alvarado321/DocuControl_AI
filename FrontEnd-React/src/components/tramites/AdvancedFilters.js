import React, { useState } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import tramitesService from '../../services/tramitesService';

const AdvancedFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    costo_min: '',
    costo_max: '',
    tiempo_max: '',
    solo_gratuitos: false,
    prioridad: '',
    estado: 'activo',
    ...initialFilters
  });

  const categorias = tramitesService.getCategorias();
  const prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Si se activa "solo gratuitos", limpiar filtros de costo
    if (key === 'solo_gratuitos' && value) {
      newFilters.costo_min = '';
      newFilters.costo_max = '';
    }
    
    // Si se establece un costo, desactivar "solo gratuitos"
    if ((key === 'costo_min' || key === 'costo_max') && value) {
      newFilters.solo_gratuitos = false;
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categoria: '',
      costo_min: '',
      costo_max: '',
      tiempo_max: '',
      solo_gratuitos: false,
      prioridad: '',
      estado: 'activo'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'estado') return false; // No contar estado como filtro activo
      return value !== '' && value !== false;
    }).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Filtros Avanzados
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {activeFiltersCount}
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Ocultar' : 'Mostrar'} avanzados
              {showAdvanced ? (
                <ChevronUpIcon className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TagIcon className="h-4 w-4 inline mr-1" />
                Categoría
              </label>
              <select
                value={filters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Solo gratuitos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Costo
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.solo_gratuitos}
                  onChange={(e) => handleFilterChange('solo_gratuitos', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Solo trámites gratuitos
                </label>
              </div>
            </div>

            {/* Tiempo máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Tiempo máximo (días)
              </label>
              <select
                value={filters.tiempo_max}
                onChange={(e) => handleFilterChange('tiempo_max', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Sin límite</option>
                <option value="1">1 día (urgente)</option>
                <option value="3">Hasta 3 días</option>
                <option value="7">Hasta 1 semana</option>
                <option value="15">Hasta 15 días</option>
                <option value="30">Hasta 1 mes</option>
              </select>
            </div>
          </div>

          {/* Filtros avanzados */}
          {showAdvanced && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Rango de costos */}
                {!filters.solo_gratuitos && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo mínimo (COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={filters.costo_min}
                        onChange={(e) => handleFilterChange('costo_min', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo máximo (COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Sin límite"
                        value={filters.costo_max}
                        onChange={(e) => handleFilterChange('costo_max', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={filters.prioridad}
                    onChange={(e) => handleFilterChange('prioridad', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Todas las prioridades</option>
                    {prioridades.map(prioridad => (
                      <option key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="activo">Solo activos</option>
                    <option value="">Todos los estados</option>
                    <option value="inactivo">Solo inactivos</option>
                  </select>
                </div>
              </div>

              {/* Filtros rápidos predefinidos */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtros rápidos:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setFilters({ ...filters, solo_gratuitos: true, tiempo_max: '7' });
                      onFiltersChange({ ...filters, solo_gratuitos: true, tiempo_max: '7' });
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    Gratuitos y rápidos
                  </button>
                  
                  <button
                    onClick={() => {
                      setFilters({ ...filters, categoria: 'certificados', tiempo_max: '3' });
                      onFiltersChange({ ...filters, categoria: 'certificados', tiempo_max: '3' });
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    Certificados urgentes
                  </button>
                  
                  <button
                    onClick={() => {
                      setFilters({ ...filters, categoria: 'licencias', costo_max: '100000' });
                      onFiltersChange({ ...filters, categoria: 'licencias', costo_max: '100000' });
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    Licencias económicas
                  </button>
                  
                  <button
                    onClick={() => {
                      setFilters({ ...filters, prioridad: 'alta', tiempo_max: '1' });
                      onFiltersChange({ ...filters, prioridad: 'alta', tiempo_max: '1' });
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Alta prioridad
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resumen de filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(filters).map(([key, value]) => {
                    if (key === 'estado' || !value || value === false) return null;
                    
                    let displayValue = value;
                    if (key === 'categoria') {
                      const cat = categorias.find(c => c.value === value);
                      displayValue = cat ? cat.label : value;
                    } else if (key === 'solo_gratuitos' && value) {
                      displayValue = 'Gratuitos';
                    } else if (key === 'costo_min') {
                      displayValue = `Min: $${parseInt(value).toLocaleString()}`;
                    } else if (key === 'costo_max') {
                      displayValue = `Max: $${parseInt(value).toLocaleString()}`;
                    } else if (key === 'tiempo_max') {
                      displayValue = `≤${value} días`;
                    }
                    
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {displayValue}
                        <button
                          onClick={() => handleFilterChange(key, key === 'solo_gratuitos' ? false : '')}
                          className="ml-1 hover:text-indigo-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdvancedFilters;
