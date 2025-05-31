import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

import tramitesService from '../../services/tramitesService';
import solicitudesService from '../../services/solicitudesService';
import documentosService from '../../services/documentosService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TempDocumentUpload from '../../components/tramites/TempDocumentUpload';
import { useNotification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';

const SolicitarTramitePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();  const [formData, setFormData] = useState({
    // Datos personales
    nombre_completo: user?.nombre_completo || '',
    documento: user?.documento || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
    direccion: user?.direccion || '',
    // Datos del trámite
    observaciones: '',
    datos_adicionales: {}
  });  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [documentosSubidos, setDocumentosSubidos] = useState({}); // Para almacenar archivos temporalmente
  const [solicitudCreada, setSolicitudCreada] = useState(null); // Para almacenar la solicitud creada
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false); // Estado de envío
  // Obtener detalles del trámite
  const {
    data: tramite,
    isLoading: loadingTramite,
    error: tramiteError
  } = useQuery({
    queryKey: ['tramite', id],
    queryFn: async () => {
      const result = await tramitesService.getTramiteById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };  const validateForm = () => {
    const newErrors = {};

    if (currentStep === 1) {
      // Validar información personal
      if (!formData.nombre_completo.trim()) {
        newErrors.nombre_completo = 'El nombre completo es requerido';
      }
      if (!formData.documento.trim()) {
        newErrors.documento = 'El número de documento es requerido';
      }
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es requerido';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'El email no tiene un formato válido';
      }      if (!formData.direccion.trim()) {
        newErrors.direccion = 'La dirección es requerida';
      }
    }

    if (currentStep === 2) {
      
      // Validar datos adicionales según la categoría
      if (tramite?.categoria === 'licencias') {
        if (!formData.datos_adicionales.direccion_obra) {
          newErrors.direccion_obra = 'La dirección de la obra es requerida';
        }
        if (!formData.datos_adicionales.area_construccion || formData.datos_adicionales.area_construccion <= 0) {
          newErrors.area_construccion = 'El área de construcción es requerida y debe ser mayor a 0';
        }
      }
      if (tramite?.categoria === 'certificados') {
        if (!formData.datos_adicionales.cantidad || formData.datos_adicionales.cantidad <= 0) {
          newErrors.cantidad = 'La cantidad de certificados es requerida y debe ser mayor a 0';
        }
      }
      if (tramite?.categoria === 'permisos') {
        if (!formData.datos_adicionales.duracion_meses || formData.datos_adicionales.duracion_meses <= 0) {
          newErrors.duracion_meses = 'La duración en meses es requerida y debe ser mayor a 0';
        }      }
    }    if (currentStep === 3) {
      // Paso 3: Validar que al menos los documentos obligatorios estén seleccionados
      if (tramite.documentos_requeridos && tramite.documentos_requeridos.length > 0) {
        const documentosFaltantes = tramite.documentos_requeridos.filter((documento, index) => {
          const docId = `doc_${index}`;
          return !documentosSubidos[docId];
        });
        
        if (documentosFaltantes.length > 0) {
          newErrors.documentos = `Faltan documentos obligatorios: ${documentosFaltantes.join(', ')}`;
        }
      }
    }

    // Paso 4 es solo revisión, no requiere validación adicional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  const handleDatosAdicionalesChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      datos_adicionales: {
        ...prev.datos_adicionales,
        [field]: value
      }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar selección de archivos temporales
  const handleFileSelected = (documentoId, fileData) => {
    setDocumentosSubidos(prev => ({
      ...prev,
      [documentoId]: fileData
    }));
    
    // Limpiar errores de documentos si hay alguno
    if (errors.documentos) {
      setErrors(prev => ({
        ...prev,
        documentos: undefined
      }));
    }
  };

  // Validar documentos requeridos
  const validateDocuments = () => {
    if (!tramite?.documentos_requeridos || tramite.documentos_requeridos.length === 0) {
      return true; // No hay documentos requeridos
    }

    const documentosObligatorios = tramite.documentos_requeridos.filter(doc => {
      try {
        const docObj = typeof doc === 'string' ? JSON.parse(doc) : doc;
        return docObj.obligatorio;
      } catch {
        return false;
      }
    });

    if (documentosObligatorios.length === 0) {
      return true; // No hay documentos obligatorios
    }

    // Verificar que todos los documentos obligatorios estén seleccionados
    return documentosObligatorios.every(doc => {
      try {
        const docObj = typeof doc === 'string' ? JSON.parse(doc) : doc;
        const docId = docObj.id || docObj.nombre;
        return documentosSubidos[docId] && documentosSubidos[docId].file;
      } catch {
        return false;
      }
    });
  };
  const handleEnviarSolicitud = async () => {
    setEnviandoSolicitud(true);
    
    try {
      // 1. Crear la solicitud
      const solicitudData = {
        tramite_id: parseInt(id),
        observaciones: formData.observaciones || 'Solicitud creada desde el wizard',
        datos_adicionales: formData.datos_adicionales,
        solicitante: {
          nombre_completo: formData.nombre_completo,
          documento: formData.documento,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion
        }
      };

      showNotification('Creando solicitud...', 'info');
      const solicitudResult = await solicitudesService.crearSolicitud(solicitudData);
      
      if (!solicitudResult.success) {
        throw new Error(solicitudResult.error || 'Error al crear la solicitud');
      }

      const solicitudCreada = solicitudResult.data.solicitud || solicitudResult.data;
      setSolicitudCreada(solicitudCreada);

      // 2. Subir documentos si hay alguno seleccionado
      const documentosKeys = Object.keys(documentosSubidos);
      if (documentosKeys.length > 0) {
        showNotification('Subiendo documentos...', 'info');
        
        for (const docId of documentosKeys) {
          const fileData = documentosSubidos[docId];
          if (fileData && fileData.file) {
            try {
              const formData = new FormData();
              formData.append('archivo', fileData.file);
              formData.append('tipo_documento', fileData.name || 'documento');
              
              await documentosService.subirDocumento(solicitudCreada.id, formData);
            } catch (error) {
              console.error(`Error subiendo documento ${fileData.name}:`, error);
              // Continuar con otros documentos aunque uno falle
            }
          }
        }
      }

      showNotification('Solicitud creada exitosamente', 'success');
      setCurrentStep(4); // Avanzar al paso final
      
    } catch (error) {
      showNotification(error.message || 'Error al procesar la solicitud', 'error');
    } finally {
      setEnviandoSolicitud(false);
    }
  };  const handleNext = async () => {
    const isValid = validateForm();
    
    if (isValid) {
      // Navegación normal entre pasos 1-3
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else if (currentStep === 3) {
        // En el paso 3, crear solicitud y subir documentos
        await handleEnviarSolicitud();
      }
    } else {
      showNotification('Por favor completa todos los campos requeridos', 'error');
    }
  };
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (loadingTramite) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (tramiteError || !tramite) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error al cargar trámite
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo cargar la información del trámite
        </p>
        <div className="mt-6">
          <Link
            to="/tramites"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a trámites
          </Link>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información Personal
              </h3>
              
              {/* Formulario de datos personales */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre_completo || ''}
                      onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.nombre_completo ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre_completo && (
                      <p className="mt-1 text-sm text-red-600">{errors.nombre_completo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de documento *
                    </label>
                    <input
                      type="text"
                      value={formData.documento || ''}
                      onChange={(e) => handleInputChange('documento', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.documento ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Cédula, pasaporte, etc."
                    />
                    {errors.documento && (
                      <p className="mt-1 text-sm text-red-600">{errors.documento}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono || ''}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.telefono ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tu número de teléfono"
                    />
                    {errors.telefono && (
                      <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion || ''}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.direccion ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu dirección completa"
                  />
                  {errors.direccion && (
                    <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                  )}
                </div>
              </div>

              {/* Información del trámite */}
              <div className="bg-blue-50 rounded-lg p-6 mt-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">
                      {tramite.nombre}
                    </h4>
                    <p className="text-blue-800 mb-4">
                      {tramite.descripcion}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-blue-800">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">
                          Costo: {tramite.costo > 0 ? formatCurrency(tramite.costo) : 'Gratuito'}
                        </span>
                      </div>
                      <div className="flex items-center text-blue-800">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        <span>Tiempo estimado: {tramite.tiempo_estimado_dias} días hábiles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información Adicional
              </h3>
              
              <div className="space-y-4">                {/* Campos específicos según el tipo de trámite */}
                {tramite.categoria === 'licencias' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección de la obra *
                      </label>
                      <input
                        type="text"
                        value={formData.datos_adicionales.direccion_obra || ''}
                        onChange={(e) => handleDatosAdicionalesChange('direccion_obra', e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.direccion_obra ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa la dirección completa donde se realizará la obra"
                      />
                      {errors.direccion_obra && (
                        <p className="mt-1 text-sm text-red-600">{errors.direccion_obra}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Área de construcción (m²) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.datos_adicionales.area_construccion || ''}
                        onChange={(e) => handleDatosAdicionalesChange('area_construccion', e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.area_construccion ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el área en metros cuadrados"
                      />
                      {errors.area_construccion && (
                        <p className="mt-1 text-sm text-red-600">{errors.area_construccion}</p>
                      )}
                    </div>
                  </div>
                )}

                {tramite.categoria === 'certificados' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad de certificados *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.datos_adicionales.cantidad || ''}
                        onChange={(e) => handleDatosAdicionalesChange('cantidad', e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.cantidad ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Número de certificados a solicitar"
                      />
                      {errors.cantidad && (
                        <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo del certificado
                      </label>
                      <select
                        value={formData.datos_adicionales.motivo || ''}
                        onChange={(e) => handleDatosAdicionalesChange('motivo', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Selecciona el motivo</option>
                        <option value="trabajo">Trabajo</option>
                        <option value="estudio">Estudio</option>
                        <option value="tramite_bancario">Trámite bancario</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                )}

                {tramite.categoria === 'permisos' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración solicitada (meses) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={formData.datos_adicionales.duracion_meses || ''}
                        onChange={(e) => handleDatosAdicionalesChange('duracion_meses', e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.duracion_meses ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Duración del permiso en meses"
                      />
                      {errors.duracion_meses && (
                        <p className="mt-1 text-sm text-red-600">{errors.duracion_meses}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de actividad
                      </label>
                      <select
                        value={formData.datos_adicionales.tipo_actividad || ''}
                        onChange={(e) => handleDatosAdicionalesChange('tipo_actividad', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Selecciona el tipo de actividad</option>
                        <option value="comercial">Comercial</option>
                        <option value="eventos">Eventos</option>
                        <option value="construccion">Construcción</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.datos_adicionales.telefono_contacto || ''}
                    onChange={(e) => handleDatosAdicionalesChange('telefono_contacto', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Número de teléfono para notificaciones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico de contacto
                  </label>
                  <input
                    type="email"
                    value={formData.datos_adicionales.email_contacto || user?.email || ''}
                    onChange={(e) => handleDatosAdicionalesChange('email_contacto', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Correo para recibir notificaciones"
                  />
                </div>
              </div>
            </div>
          </div>        );      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Documentos Requeridos
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Selecciona los documentos necesarios para tu trámite. Una vez que confirmes, se creará tu solicitud y se subirán los documentos automáticamente.
              </p>
              
              {tramite.documentos_requeridos && tramite.documentos_requeridos.length > 0 ? (
                <div className="space-y-4">
                  {tramite.documentos_requeridos.map((documento, index) => {
                    // Transform simple string to expected object structure
                    const documentoObj = typeof documento === 'string' ? {
                      id: `doc_${index}`,
                      nombre: documento,
                      formato: 'PDF, JPG, PNG',
                      tamaño_max: '5MB',
                      descripcion: `Documento requerido: ${documento}`,
                      obligatorio: true
                    } : documento;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">{documentoObj.nombre}</h5>
                          {documentoObj.obligatorio && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Obligatorio
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <p><strong>Formato:</strong> {documentoObj.formato}</p>
                          <p><strong>Tamaño máximo:</strong> {documentoObj.tamaño_max}</p>
                          <p><strong>Descripción:</strong> {documentoObj.descripcion}</p>
                        </div>
                        <TempDocumentUpload 
                          documento={documentoObj}
                          onFileSelected={handleFileSelected}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No hay documentos específicos requeridos para este trámite.
                  </p>
                </div>
              )}
              
              {errors.documentos && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{errors.documentos}</p>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <div className="flex">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Al confirmar:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Se creará tu solicitud de trámite</li>
                      <li>• Los documentos seleccionados se subirán automáticamente</li>
                      <li>• Recibirás un número de expediente único</li>
                      <li>• Podrás hacer seguimiento desde "Mis Solicitudes"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Subir Documentos
              </h3>
                {solicitudCreada ? (
                <div className="space-y-6">
                  {/* Información de la solicitud creada */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Solicitud Creada Exitosamente</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Número de expediente: <span className="font-mono font-bold">{solicitudCreada.numero_expediente}</span>
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          ID de solicitud: <span className="font-mono font-bold">{solicitudCreada.id}</span>
                        </p>
                        <p className="text-sm text-green-700">
                          Ahora puedes subir los documentos requeridos para completar tu solicitud.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interface de subida de documentos */}
                  <div className="space-y-4">                    <h4 className="text-md font-medium text-gray-900">Documentos Requeridos</h4>
                    <p className="text-sm text-gray-600">
                      Ahora que tu solicitud ha sido creada, sube los documentos necesarios. 
                      Puedes subir todos los documentos ahora o hacerlo más tarde desde "Mis Solicitudes".
                      Los documentos obligatorios son necesarios para que tu solicitud sea procesada.
                    </p>                      {tramite.documentos_requeridos && tramite.documentos_requeridos.length > 0 ? (
                      <div className="space-y-4">
                        {/* Verificar que tenemos el ID de solicitud */}
                        {!solicitudCreada?.id ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-medium text-red-900">Error de Configuración</h4>
                                <p className="text-sm text-red-700 mt-1">
                                  No se pudo obtener el ID de la solicitud. Por favor, recarga la página e intenta nuevamente.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          tramite.documentos_requeridos.map((documento, index) => {
                          // Transform simple string to expected object structure
                          const documentoObj = typeof documento === 'string' ? {
                            id: `doc_${index}`,
                            nombre: documento,
                            formato: 'PDF, JPG, PNG',
                            tamaño_max: '5MB',
                            descripcion: `Documento requerido: ${documento}`,
                            obligatorio: true
                          } : documento;
                          
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-gray-900">{documentoObj.nombre}</h5>
                                {documentoObj.obligatorio && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Obligatorio
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mb-3">
                                <p><strong>Formato:</strong> {documentoObj.formato}</p>
                                <p><strong>Tamaño máximo:</strong> {documentoObj.tamaño_max}</p>
                                <p><strong>Descripción:</strong> {documentoObj.descripcion}</p>
                              </div>                              <DocumentUpload 
                                documento={documentoObj}
                                solicitudId={solicitudCreada?.id}
                                onUploadComplete={(documentoId, fileData) => {
                                  // Manejar la subida completada
                                  if (fileData) {
                                    showNotification(`Documento "${documentoObj.nombre}" subido exitosamente`, 'success');
                                  }
                                }}
                              />
                            </div>                          );
                        })
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          No hay documentos específicos requeridos para este trámite.
                        </p>
                      </div>
                    )}

                    {/* Opciones finales */}
                    <div className="bg-blue-50 rounded-lg p-4 mt-6">
                      <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">¿Qué hacer ahora?</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Puedes subir todos los documentos ahora para acelerar el proceso</li>
                            <li>• O puedes subir los documentos más tarde desde "Mis Solicitudes"</li>
                            <li>• Una vez subidos todos los documentos obligatorios, tu solicitud será procesada</li>
                            <li>• Recibirás notificaciones sobre el estado de tu trámite</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => navigate('/solicitudes/mis-solicitudes')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Ver Mis Solicitudes
                      </button>
                      <div className="space-x-3">
                        <button
                          type="button"
                          onClick={() => navigate('/tramites')}
                          className="px-4 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Solicitar Otro Trámite
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard')}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Ir al Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Preparando la interfaz de documentos...</p>
                </div>
              )}
            </div>
          </div>        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Solicitud Creada Exitosamente!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Tu solicitud ha sido procesada y se ha asignado el número de seguimiento
              </p>
              
              {solicitudCreada && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Número de Solicitud:</span>
                      <span className="text-sm font-bold text-blue-600">#{solicitudCreada.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Estado:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        En Proceso
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Fecha de Creación:</span>
                      <span className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    {tramite && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Tiempo Estimado:</span>
                        <span className="text-sm text-gray-600">
                          {tramite.tiempo_estimado_dias} días hábiles
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium mb-1">¿Qué sigue ahora?</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Recibirás notificaciones sobre el progreso de tu solicitud</li>
                      <li>• Puedes consultar el estado en cualquier momento desde tu dashboard</li>
                      <li>• Si requieres documentos adicionales, te contactaremos</li>
                      <li>• El tiempo estimado puede variar según la complejidad del caso</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/tramites')}
                  className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Solicitar Otro Trámite
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Ir al Dashboard
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/tramites" className="text-gray-400 hover:text-gray-500">
              Trámites
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to={`/tramites/${id}`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                {tramite.nombre}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-900">
                Solicitar
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitar Trámite
          </h1>
          <p className="mt-2 text-gray-600">
            Completa la información requerida para iniciar tu solicitud
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <Card>
        <div className="px-6 py-4">          <nav aria-label="Progress">
            <ol className="flex items-center">
              {[1, 2, 3, 4].map((step, stepIdx) => (
                <li
                  key={step}
                  className={`${stepIdx !== 3 ? 'pr-4 sm:pr-12' : ''} relative`}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        currentStep >= step
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            currentStep >= step ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {step}
                        </span>
                      )}
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        currentStep >= step ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >                      {step === 1 && 'Información'}
                      {step === 2 && 'Detalles'}
                      {step === 3 && 'Documentos'}
                      {step === 4 && 'Confirmación'}
                    </span>
                  </div>
                  {stepIdx !== 3 && (
                    <div className="absolute top-4 left-8 -ml-px h-0.5 w-full bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </Card>      {/* Form content */}
      <Card>
        <div>
          <div className="px-6 py-6">
            {renderStep()}
          </div>          {/* Actions */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div>
              {currentStep > 1 && currentStep < 4 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Anterior
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentStep < 4 && (
                <Link
                  to={`/tramites/${id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </Link>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Siguiente
                </button>              ) : currentStep === 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={enviandoSolicitud || !validateDocuments()}
                  className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoSolicitud ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Crear Solicitud
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SolicitarTramitePage;
