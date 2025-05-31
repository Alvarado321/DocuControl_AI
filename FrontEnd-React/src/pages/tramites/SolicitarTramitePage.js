import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

import tramitesService from '../../services/tramitesService';
import solicitudesService from '../../services/solicitudesService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CostCalculator from '../../components/tramites/CostCalculator';
import TimeEstimator from '../../components/tramites/TimeEstimator';
import RequirementsPreview from '../../components/tramites/RequirementsPreview';
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
  const totalSteps = 4; // Agregamos un paso más
  const [costoCalculado, setCostoCalculado] = useState(null);
  const [tiempoEstimado, setTiempoEstimado] = useState(null);
  const [requirementsCompleted, setRequirementsCompleted] = useState(false); // Inicialmente false para requerir validación

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

  // Mutation para crear solicitud
  const crearSolicitudMutation = useMutation({
    mutationFn: async (solicitudData) => {
      const result = await solicitudesService.crearSolicitud(solicitudData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      showNotification('Solicitud creada exitosamente', 'success');
      navigate(`/solicitudes/${data.solicitud.id}`);
    },
    onError: (error) => {
      showNotification(`Error al crear solicitud: ${error.message}`, 'error');
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
      // Validar que los requisitos obligatorios estén completos
      if (!requirementsCompleted) {
        newErrors.requirements = 'Debes completar todos los requisitos y documentos obligatorios antes de continuar';
      }
    }

    if (currentStep === 4) {
      if (!formData.observaciones.trim()) {
        newErrors.observaciones = 'Las observaciones son requeridas para finalizar la solicitud';
      }    }

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
  };  const handleNext = () => {
    const isValid = validateForm();
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      showNotification('Por favor completa todos los campos requeridos', 'error');
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación paso por paso más estricta
    
    // Validar paso 1: Datos personales
    if (!formData.nombre_completo?.trim() || !formData.documento?.trim() || 
        !formData.telefono?.trim() || !formData.email?.trim() || !formData.direccion?.trim()) {
      showNotification('Faltan datos personales obligatorios', 'error');
      setCurrentStep(1);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showNotification('El email no tiene un formato válido', 'error');
      setCurrentStep(1);
      return;
    }
    
    // Validar paso 2: Datos adicionales según categoría
    if (tramite?.categoria === 'licencias') {
      if (!formData.datos_adicionales?.direccion_obra || 
          !formData.datos_adicionales?.area_construccion || 
          formData.datos_adicionales.area_construccion <= 0) {
        showNotification('Faltan datos requeridos para licencias: dirección de obra y área de construcción', 'error');
        setCurrentStep(2);
        return;
      }
    }
    
    if (tramite?.categoria === 'certificados') {
      if (!formData.datos_adicionales?.cantidad || formData.datos_adicionales.cantidad <= 0) {
        showNotification('Debes especificar la cantidad de certificados requeridos', 'error');
        setCurrentStep(2);
        return;
      }
    }
    
    if (tramite?.categoria === 'permisos') {
      if (!formData.datos_adicionales?.duracion_meses || formData.datos_adicionales.duracion_meses <= 0) {
        showNotification('Debes especificar la duración en meses para el permiso', 'error');
        setCurrentStep(2);
        return;
      }
    }
    
    // Validar paso 3: Requisitos y documentos
    if (!requirementsCompleted) {
      showNotification('Debes completar todos los requisitos y documentos obligatorios antes de enviar la solicitud', 'error');
      setCurrentStep(3);
      return;
    }
    
    // Validar paso 4: Observaciones
    if (!formData.observaciones?.trim()) {
      showNotification('Las observaciones son requeridas para finalizar la solicitud', 'error');
      setCurrentStep(4);
      return;    }

    const solicitudData = {
      tramite_id: parseInt(id),
      observaciones: formData.observaciones,
      datos_adicionales: formData.datos_adicionales,
      // Agregar datos personales
      solicitante: {
        nombre_completo: formData.nombre_completo,
        documento: formData.documento,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion
      }
    };

    crearSolicitudMutation.mutate(solicitudData);
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
                Revisión de Requisitos y Documentos
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Revisa y confirma que cumples con todos los requisitos y tienes los documentos necesarios.              </p>
              
              <RequirementsPreview 
                tramite={tramite}
                datosAdicionales={formData.datos_adicionales}
                onRequirementsChange={(data) => {
                  setRequirementsCompleted(data.completed || false);
                }}
              />
              
              {errors.requirements && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{errors.requirements}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cálculos y Confirmación Final
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Revisa los costos y tiempos estimados antes de enviar tu solicitud.
              </p>
              
              {/* Calculadoras */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <CostCalculator 
                  tramite={tramite}
                  datosAdicionales={formData.datos_adicionales}
                  onCostChange={setCostoCalculado}
                />
                
                <TimeEstimator 
                  tramite={tramite}
                  datosAdicionales={formData.datos_adicionales}
                  onTimeChange={setTiempoEstimado}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones adicionales *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.observaciones ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe cualquier información adicional relevante para tu solicitud..."
                  />
                  {errors.observaciones && (
                    <p className="mt-1 text-sm text-red-600">{errors.observaciones}</p>
                  )}
                </div>

                {/* Resumen mejorado de la solicitud */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Resumen final de tu solicitud:
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Trámite:</dt>
                      <dd className="text-sm font-medium text-gray-900">{tramite.nombre}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Categoría:</dt>
                      <dd className="text-sm font-medium text-gray-900 capitalize">{tramite.categoria}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Costo estimado:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {costoCalculado ? (
                          costoCalculado.costoTotal === 0 
                            ? 'Gratuito' 
                            : tramitesService.formatearMoneda(costoCalculado.costoTotal)
                        ) : (
                          tramite.costo > 0 ? formatCurrency(tramite.costo) : 'Gratuito'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Tiempo estimado:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {tiempoEstimado 
                          ? tramitesService.formatearTiempo(tiempoEstimado.tiempoEstimado)
                          : `${tramite.tiempo_estimado_dias} días hábiles`
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Solicitante:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {user?.nombres} {user?.apellidos}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Fecha estimada:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {tiempoEstimado 
                          ? tiempoEstimado.fechaEstimadaFinalizacion.toLocaleDateString('es-CO')
                          : 'Por calcular'
                        }
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <p className="text-sm text-blue-700">
                      Al confirmar esta solicitud, recibirás un número de expediente y podrás hacer seguimiento del estado de tu trámite.
                      {costoCalculado && costoCalculado.costoTotal > 0 && (
                        <span className="block mt-2 font-medium">
                          Recuerda que deberás realizar el pago correspondiente una vez aprobada la solicitud.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
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
                    >
                      {step === 1 && 'Información'}
                      {step === 2 && 'Detalles'}
                      {step === 3 && 'Requisitos'}
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
      </Card>

      {/* Form content */}
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6">
            {renderStep()}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div>
              {currentStep > 1 && (
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
              <Link
                to={`/tramites/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </Link>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={crearSolicitudMutation.isLoading}
                  className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {crearSolicitudMutation.isLoading ? (
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  )}
                  Crear Solicitud
                </button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SolicitarTramitePage;
