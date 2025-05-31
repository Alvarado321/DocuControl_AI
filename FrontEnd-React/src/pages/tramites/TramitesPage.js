import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import tramitesService from '../../services/tramitesService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

const TramitesPage = () => {
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');

  // Obtener trámites con React Query
  const {
    data: tramitesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tramites'],
    queryFn: async () => {
      const result = await tramitesService.getTramites();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error) => {
      showNotification(`Error al cargar trámites: ${error.message}`, 'error');
    }
  });

  const categorias = tramitesService.getCategorias();

  // Filtrar y ordenar trámites
  const filteredTramites = useMemo(() => {
    if (!tramitesData) return [];

    let filtered = tramitesData.filter(tramite => {
      const matchesSearch = tramite.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tramite.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tramite.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || tramite.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Manejar casos especiales
      if (sortBy === 'costo') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tramitesData, searchTerm, selectedCategory, sortBy, sortOrder]);

  const getCategoryBadgeColor = (categoria) => {
    const colors = {
      'licencias': 'bg-primary-100 text-primary-800',
      'permisos': 'bg-secondary-100 text-secondary-800',
      'servicios': 'bg-info-100 text-info-800',
      'certificados': 'bg-warning-100 text-warning-800',
      'otros': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar trámites</h3>
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white mt-[60px]">
        <h1 className="text-3xl font-bold">Catálogo de Trámites</h1>
        <p className="mt-2 text-primary-100">
          Encuentra y solicita los trámites municipales que necesitas
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-1" />
            <span>{filteredTramites.length} trámites disponibles</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Buscar trámites por nombre, descripción o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="nombre">Nombre</option>
                <option value="categoria">Categoría</option>
                <option value="costo">Costo</option>
                <option value="tiempo_estimado_dias">Tiempo estimado</option>
              </select>
            </div>

            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de trámites */}
      {filteredTramites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron trámites</h3>
            <p className="mt-1 text-sm text-gray-500">
              Prueba cambiando los filtros de búsqueda
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTramites.map((tramite) => (
            <Card key={tramite.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header del trámite */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(tramite.categoria)}`}>
                        <TagIcon className="h-3 w-3 mr-1" />
                        {categorias.find(c => c.value === tramite.categoria)?.label}
                      </span>
                      <span className="text-xs text-gray-500">#{tramite.codigo}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tramite.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tramite.descripcion}
                    </p>
                  </div>
                </div>

                {/* Información del trámite */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">
                      {tramite.costo > 0 ? formatCurrency(tramite.costo) : 'Gratuito'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{tramite.tiempo_estimado_dias} días hábiles</span>
                  </div>
                </div>

                {/* Requisitos preview */}
                {tramite.requisitos && tramite.requisitos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Requisitos principales:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tramite.requisitos.slice(0, 2).map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                      {tramite.requisitos.length > 2 && (
                        <li className="text-primary-600 text-xs">
                          + {tramite.requisitos.length - 2} requisitos más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Link
                    to={`/tramites/${tramite.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    Ver detalles
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                  <Link
                    to={`/tramites/${tramite.id}/solicitar`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    Solicitar
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TramitesPage;
