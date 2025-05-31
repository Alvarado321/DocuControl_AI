import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

import tramitesService from '../../services/tramitesService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

const TramiteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showRequirements, setShowRequirements] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);

  // Obtener detalles del trámite
  const {
    data: tramite,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tramite', id],
    queryFn: async () => {
      const result = await tramitesService.getTramiteById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error) => {
      showNotification(`Error al cargar trámite: ${error.message}`, 'error');
    }
  });

  const categorias = tramitesService.getCategorias();

  const getCategoryInfo = (categoria) => {
    const found = categorias.find(c => c.value === categoria);
    return found || { label: categoria, value: categoria };
  };

  const getPriorityColor = (prioridad) => {
    const colors = {
      'baja': 'text-green-600 bg-green-100',
      'media': 'text-yellow-600 bg-yellow-100',
      'alta': 'text-orange-600 bg-orange-100',
      'critica': 'text-red-600 bg-red-100'
    };
    return colors[prioridad] || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSolicitar = () => {
    navigate(`/tramites/${id}/solicitar`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !tramite) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {error ? 'Error al cargar trámite' : 'Trámite no encontrado'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error?.message || 'El trámite solicitado no existe'}
        </p>
        <div className="mt-6 space-x-3">
          <button
            onClick={() => navigate('/tramites')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a trámites
          </button>
          {error && (
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/tramites" className="text-gray-400 hover:text-gray-500">
              <DocumentTextIcon className="flex-shrink-0 h-5 w-5" />
              <span className="sr-only">Trámites</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/tramites" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                Trámites
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-900 truncate">
                {tramite.nombre}
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800`}>
                  <TagIcon className="h-4 w-4 mr-1" />
                  {getCategoryInfo(tramite.categoria).label}
                </span>
                <span className="text-sm text-gray-500">#{tramite.codigo}</span>
                {tramite.estado === 'activo' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Activo
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {tramite.nombre}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {tramite.descripcion}
              </p>

              {/* Información clave */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Costo</p>
                      <p className="text-lg font-bold text-green-600">
                        {tramite.costo > 0 ? formatCurrency(tramite.costo) : 'Gratuito'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Tiempo estimado</p>
                      <p className="text-lg font-bold text-blue-600">
                        {tramite.tiempo_estimado_dias} días hábiles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-900">Prioridad</p>
                      <p className="text-lg font-bold text-orange-600 capitalize">
                        {tramite.prioridad_default}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de acción principal */}
            <div className="flex-shrink-0 ml-6">
              <button
                onClick={handleSolicitar}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Solicitar Trámite
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requisitos */}
          {tramite.requisitos && tramite.requisitos.length > 0 && (
            <Card>
              <div className="p-6">
                <button
                  onClick={() => setShowRequirements(!showRequirements)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                    Requisitos ({tramite.requisitos.length})
                  </h2>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${showRequirements ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showRequirements && (
                  <div className="mt-4">
                    <ul className="space-y-3">
                      {tramite.requisitos.map((requisito, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requisito}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Documentos requeridos */}
          {tramite.documentos_requeridos && tramite.documentos_requeridos.length > 0 && (
            <Card>
              <div className="p-6">
                <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <DocumentArrowDownIcon className="h-6 w-6 text-blue-500 mr-2" />
                    Documentos Requeridos ({tramite.documentos_requeridos.length})
                  </h2>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${showDocuments ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDocuments && (
                  <div className="mt-4">
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2" />
                        <p className="text-sm text-blue-700">
                          Asegúrate de tener todos los documentos en formato digital (PDF o imagen) antes de iniciar la solicitud.
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {tramite.documentos_requeridos.map((documento, index) => (
                        <li key={index} className="flex items-start bg-gray-50 rounded-lg p-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{documento}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información adicional */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Trámite
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Código</dt>
                  <dd className="text-sm text-gray-900">{tramite.codigo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Categoría</dt>
                  <dd className="text-sm text-gray-900">{getCategoryInfo(tramite.categoria).label}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="text-sm text-gray-900 capitalize">{tramite.estado}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de creación</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(tramite.fecha_creacion).toLocaleDateString('es-CO')}
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          {/* Acciones */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleSolicitar}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Solicitar Trámite
                </button>
                
                <Link
                  to="/tramites"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Volver a Trámites
                </Link>
              </div>
            </div>
          </Card>

          {/* Ayuda */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Si tienes dudas sobre este trámite, puedes contactar con nuestro equipo de soporte.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Teléfono:</strong> (123) 456-7890
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> soporte@municipio.gov.co
                </p>
                <p className="text-sm">
                  <strong>Horario:</strong> Lun-Vie 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TramiteDetailPage;
