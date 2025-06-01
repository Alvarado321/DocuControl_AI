import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import '../../components/common/EnhancedStepper.css';
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
  const { user } = useAuth();const [formData, setFormData] = useState({
    // Datos personales
    nombre_completo: user?.nombre_completo || '',
    documento: user?.documento || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
    direccion: user?.direccion || '',
    // Datos del trámite
    observaciones: '',
    datos_adicionales: {}
  }); const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [documentosSubidos, setDocumentosSubidos] = useState({}); // Para almacenar archivos temporalmente
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
  }; const validateForm = () => {
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
      } if (!formData.direccion.trim()) {
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
        }
      }
    }    if (currentStep === 3) {
      // Paso 3: Validar que al menos los documentos obligatorios estén seleccionados (opcional por ahora)
      // Ya no requerimos que todos los documentos estén subidos para continuar al paso 4
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
    }  };

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
      };      showNotification('Creando solicitud...', 'info');
      const solicitudResult = await solicitudesService.crearSolicitud(solicitudData);

      if (!solicitudResult.success) {
        throw new Error(solicitudResult.error || 'Error al crear la solicitud');
      }

      const solicitudCreada = solicitudResult.data.solicitud || solicitudResult.data;      // 2. Subir documentos si hay alguno seleccionado
      const documentosKeys = Object.keys(documentosSubidos);
      let documentosSubidosCount = 0;
      let documentosErrorCount = 0;
      
      if (documentosKeys.length > 0) {
        showNotification(`Subiendo ${documentosKeys.length} documento(s)...`, 'info');
        console.log(`Iniciando subida de ${documentosKeys.length} documentos para solicitud ${solicitudCreada.id}`);

        for (const docId of documentosKeys) {
          const fileData = documentosSubidos[docId];
          if (fileData && fileData.file) {
            try {
              console.log(`Subiendo documento: ${fileData.name} (${fileData.file.size} bytes)`);
              
              const formData = new FormData();
              formData.append('archivo', fileData.file);
              formData.append('tipo_documento', fileData.name || 'documento');

              const result = await documentosService.subirDocumento(solicitudCreada.id, formData);
              
              if (result.success) {
                documentosSubidosCount++;
                console.log(`Documento subido exitosamente: ${fileData.name}`);
              } else {
                documentosErrorCount++;
                console.error(`Error subiendo documento ${fileData.name}:`, result.error);
              }
            } catch (error) {
              documentosErrorCount++;
              console.error(`Error inesperado subiendo documento ${fileData.name}:`, error);
            }
          } else {
            console.warn(`Documento ${docId} no tiene archivo válido`);
          }
        }
        
        // Mostrar resultado de la subida de documentos
        if (documentosErrorCount === 0) {
          showNotification(`Todos los documentos (${documentosSubidosCount}) fueron subidos exitosamente`, 'success');
        } else if (documentosSubidosCount > 0) {
          showNotification(`${documentosSubidosCount} documentos subidos, ${documentosErrorCount} con errores`, 'warning');
        } else {
          showNotification(`Error: No se pudieron subir los documentos`, 'error');
        }
      }showNotification('Solicitud creada exitosamente', 'success');
      
      // Navegar al dashboard después de crear la solicitud
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje

    } catch (error) {
      showNotification(error.message || 'Error al procesar la solicitud', 'error');
    } finally {
      setEnviandoSolicitud(false);
    }
  };  const handleNext = async () => {
    const isValid = validateForm();

    if (isValid) {
      // Navegación normal entre pasos 1-4
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
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
    switch (currentStep) {
      case 1:
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
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.nombre_completo ? 'border-red-300' : 'border-gray-300'
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
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.documento ? 'border-red-300' : 'border-gray-300'
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
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.telefono ? 'border-red-300' : 'border-gray-300'
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
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
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
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.direccion ? 'border-red-300' : 'border-gray-300'
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
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.direccion_obra ? 'border-red-300' : 'border-gray-300'
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
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.area_construccion ? 'border-red-300' : 'border-gray-300'
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
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.cantidad ? 'border-red-300' : 'border-gray-300'
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
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.duracion_meses ? 'border-red-300' : 'border-gray-300'
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
                </div>              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Documentos Requeridos
              </h3>              <p className="text-sm text-gray-600 mb-6">
                Adjunta los documentos necesarios para tu trámite. Los documentos son opcionales en este paso, podrás subirlos después si prefieres.
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
                          <h5 className="font-medium text-gray-900">{documentoObj.nombre}</h5>                          {documentoObj.obligatorio && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Requerido
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
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Información importante:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Puedes continuar sin subir documentos y agregarlos después</li>
                      <li>• Los documentos marcados como "Requeridos" son necesarios para procesar tu solicitud</li>
                      <li>• Los archivos deben estar en formato PDF, JPG o PNG</li>
                      <li>• Si no tienes algún documento, podrás subirlo desde "Mis Solicitudes"</li>
                    </ul>
                  </div>
                </div>              </div>            </div>          </div>);      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmación de Solicitud
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Revisa toda la información antes de crear tu solicitud. Una vez confirmada, se generará tu número de expediente.
              </p>

              {/* Resumen del trámite */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Resumen del Trámite</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nombre del trámite:</span>
                    <p className="text-sm text-gray-900 font-semibold">{tramite.nombre}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Categoría:</span>
                    <p className="text-sm text-gray-900 capitalize">{tramite.categoria}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Costo estimado:</span>
                    <p className="text-sm text-gray-900 font-semibold">
                      {tramite.costo > 0 ? formatCurrency(tramite.costo) : 'Gratuito'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tiempo estimado:</span>
                    <p className="text-sm text-gray-900">{tramite.tiempo_estimado_dias} días hábiles</p>
                  </div>
                </div>
                
                {/* Fecha estimada de finalización */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Fecha estimada de finalización:</span>
                  <p className="text-sm text-blue-900 font-semibold">
                    {(() => {
                      const today = new Date();
                      const estimatedDate = new Date(today);
                      estimatedDate.setDate(today.getDate() + tramite.tiempo_estimado_dias);
                      return estimatedDate.toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>
                </div>
              </div>

              {/* Información del solicitante */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información del Solicitante</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nombre completo:</span>
                    <p className="text-sm text-gray-900">{formData.nombre_completo}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Documento:</span>
                    <p className="text-sm text-gray-900">{formData.documento}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Teléfono:</span>
                    <p className="text-sm text-gray-900">{formData.telefono}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-sm text-gray-900">{formData.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">Dirección:</span>
                    <p className="text-sm text-gray-900">{formData.direccion}</p>
                  </div>
                </div>
              </div>

              {/* Datos adicionales del trámite */}
              {Object.keys(formData.datos_adicionales).length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos Específicos del Trámite</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tramite.categoria === 'licencias' && (
                      <>
                        {formData.datos_adicionales.direccion_obra && (
                          <div className="md:col-span-2">
                            <span className="text-sm font-medium text-gray-700">Dirección de la obra:</span>
                            <p className="text-sm text-gray-900">{formData.datos_adicionales.direccion_obra}</p>
                          </div>
                        )}
                        {formData.datos_adicionales.area_construccion && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Área de construcción:</span>
                            <p className="text-sm text-gray-900">{formData.datos_adicionales.area_construccion} m²</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {tramite.categoria === 'certificados' && (
                      <>
                        {formData.datos_adicionales.cantidad && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Cantidad de certificados:</span>
                            <p className="text-sm text-gray-900">{formData.datos_adicionales.cantidad}</p>
                          </div>
                        )}
                        {formData.datos_adicionales.motivo && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Motivo:</span>
                            <p className="text-sm text-gray-900 capitalize">{formData.datos_adicionales.motivo}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {tramite.categoria === 'permisos' && (
                      <>
                        {formData.datos_adicionales.duracion_meses && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Duración solicitada:</span>
                            <p className="text-sm text-gray-900">{formData.datos_adicionales.duracion_meses} meses</p>
                          </div>
                        )}
                        {formData.datos_adicionales.tipo_actividad && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Tipo de actividad:</span>
                            <p className="text-sm text-gray-900 capitalize">{formData.datos_adicionales.tipo_actividad}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Documentos adjuntados */}
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Documentos Adjuntados</h4>
                {Object.keys(documentosSubidos).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(documentosSubidos).map(([docId, fileData]) => (
                      <div key={docId} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{fileData.name}</span>
                        </div>
                        <span className="text-xs text-green-600 font-medium">✓ Adjuntado</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <DocumentIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No se han adjuntado documentos</p>
                    <p className="text-xs text-gray-400 mt-1">Podrás subirlos después desde "Mis Solicitudes"</p>
                  </div>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="bg-red-50 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-2">Importante antes de continuar:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Al crear la solicitud, se generará un número de expediente único</li>
                      <li>• La información proporcionada debe ser veraz y completa</li>
                      <li>• Podrás hacer seguimiento del estado desde tu dashboard</li>
                      <li>• Si falta documentación, te contactaremos para completarla</li>
                      <li>• Los tiempos de procesamiento pueden variar según la carga de trabajo</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botón de confirmación */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleEnviarSolicitud}
                  disabled={enviandoSolicitud}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoSolicitud ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creando Solicitud...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 mr-3" />
                      Crear Solicitud
                    </>
                  )}
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
      </div>      {/* Progress indicator */}
      <Card>
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Progreso de Solicitud</h2>            <p className="text-sm text-gray-600">
              Paso {currentStep} de 4 - {
                currentStep === 1 ? 'Completa tu información personal' :
                currentStep === 2 ? 'Proporciona los detalles específicos del trámite' :
                currentStep === 3 ? 'Adjunta los documentos requeridos' :
                'Revisa toda la información y crea tu solicitud'
              }
            </p>
          </div>
          
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step, stepIdx) => {                const stepConfig = {
                  1: { 
                    icon: InformationCircleIcon, 
                    title: 'Información', 
                    description: 'Datos personales',
                    color: 'blue'
                  },
                  2: { 
                    icon: DocumentIcon, 
                    title: 'Detalles', 
                    description: 'Info del trámite',
                    color: 'indigo'
                  },                  3: { 
                    icon: DocumentIcon, 
                    title: 'Documentos', 
                    description: 'Archivos requeridos',
                    color: 'purple'
                  },
                  4: { 
                    icon: CheckCircleIcon, 
                    title: 'Confirmación', 
                    description: 'Revisar y crear solicitud',
                    color: 'green'
                  }
                };
                
                const config = stepConfig[step];
                const IconComponent = config.icon;                const isCompleted = currentStep > step;
                const isActive = currentStep === step;
                
                return (
                  <li key={step} className="relative flex-1">
                    <div className="flex flex-col items-center group">                      {/* Círculo del paso */}                      <div className={`
                        relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out
                        ${isCompleted 
                          ? 'bg-green-600 border-green-600 shadow-lg transform scale-110' 
                          : isActive 
                            ? 'bg-white border-blue-600 shadow-lg ring-4 ring-blue-100' 
                            : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircleIcon className="h-6 w-6 text-white" />
                        ) : (
                          <IconComponent className={`h-6 w-6 ${
                            isActive ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        )}
                        
                        {/* Número del paso (pequeño, en esquina) */}
                        <span className={`
                          absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold
                          ${isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }
                        `}>
                          {step}
                        </span>
                      </div>
                      
                      {/* Información del paso */}
                      <div className="mt-3 text-center min-w-0 flex-1">
                        <h3 className={`
                          text-sm font-semibold transition-colors duration-200
                          ${isCompleted 
                            ? 'text-green-600' 
                            : isActive 
                              ? 'text-blue-600' 
                              : 'text-gray-500'
                          }
                        `}>
                          {config.title}
                        </h3>
                        <p className={`
                          text-xs mt-1 transition-colors duration-200
                          ${isActive 
                            ? 'text-gray-700 font-medium' 
                            : 'text-gray-500'
                          }
                        `}>
                          {config.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Línea conectora */}
                    {stepIdx !== 3 && (
                      <div className="absolute top-6 left-1/2 w-full h-0.5 -z-0">
                        <div className={`
                          h-full transition-all duration-500 ease-in-out
                          ${currentStep > step 
                            ? 'bg-green-500' 
                            : 'bg-gray-200'
                          }
                        `} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
          
          {/* Barra de progreso global */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Progreso general</span>
              <span>{Math.round((currentStep / 4) * 100)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-green-500 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>{/* Form content */}
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
              )}              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Siguiente
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
