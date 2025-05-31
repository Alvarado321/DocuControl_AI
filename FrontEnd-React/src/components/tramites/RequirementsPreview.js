import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import DocumentUpload from './DocumentUpload';

const RequirementsPreview = ({ tramite, datosAdicionales = {}, onRequirementsChange }) => {
  const [checkedRequisitos, setCheckedRequisitos] = useState({});
  const [checkedDocumentos, setCheckedDocumentos] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showRequisitos, setShowRequisitos] = useState(true);
  const [showDocumentos, setShowDocumentos] = useState(true);
  const [expandedRequisito, setExpandedRequisito] = useState(null);

  // Requisitos adicionales según la categoría y datos adicionales
  const getRequisitosAdicionales = () => {
    const adicionales = [];
    
    switch (tramite.categoria) {
      case 'licencias':
        if (datosAdicionales.area_construccion > 500) {
          adicionales.push({
            id: 'estudio_impacto',
            texto: 'Estudio de impacto ambiental (para construcciones mayores a 500m²)',
            categoria: 'ambiental',
            obligatorio: true,
            descripcion: 'Documento que evalúa el impacto ambiental de la construcción propuesta.'
          });
        }
        if (datosAdicionales.urgente) {
          adicionales.push({
            id: 'justificacion_urgencia',
            texto: 'Justificación escrita para procesamiento urgente',
            categoria: 'administrativa',
            obligatorio: true,
            descripcion: 'Carta explicando las razones por las cuales requiere el trámite urgente.'
          });
        }
        break;
        
      case 'certificados':
        if (datosAdicionales.cantidad > 1) {
          adicionales.push({
            id: 'listado_certificados',
            texto: 'Listado detallado de todos los certificados requeridos',
            categoria: 'administrativa',
            obligatorio: true,
            descripcion: 'Especificar claramente qué certificados necesita y para qué uso.'
          });
        }
        break;
          case 'permisos':
        if (datosAdicionales.requiere_inspeccion) {
          adicionales.push({
            id: 'solicitud_inspeccion',
            texto: 'Solicitud formal de inspección técnica',
            categoria: 'tecnica',
            obligatorio: true,
            descripcion: 'Formulario específico para solicitar la visita de inspección técnica.'
          });
        }
        break;
        
      default:
        // No hay requisitos adicionales para otras categorías
        break;
    }
    
    return adicionales;
  };

  // Documentos adicionales según la categoría
  const getDocumentosAdicionales = () => {
    const adicionales = [];
    
    switch (tramite.categoria) {
      case 'licencias':
        if (datosAdicionales.area_construccion > 1000) {
          adicionales.push({
            id: 'planos_arquitectonicos',
            nombre: 'Planos arquitectónicos certificados',
            formato: 'PDF, DWG',
            tamaño_max: '10MB',
            obligatorio: true,
            descripcion: 'Planos firmados por arquitecto matriculado'
          });
        }
        break;
        
      case 'certificados':
        if (datosAdicionales.motivo === 'trabajo') {
          adicionales.push({
            id: 'carta_empresa',
            nombre: 'Carta de la empresa solicitante',
            formato: 'PDF',
            tamaño_max: '2MB',
            obligatorio: true,
            descripcion: 'Carta oficial de la empresa explicando el motivo del certificado'
          });        }
        break;
        
      default:
        // No hay documentos adicionales para otras categorías
        break;
    }
    
    return adicionales;
  };
  const handleRequisitoCheck = (requisitoId, checked) => {
    const newCheckedRequisitos = {
      ...checkedRequisitos,
      [requisitoId]: checked
    };
    setCheckedRequisitos(newCheckedRequisitos);
    
    // Calcular si todos los requisitos obligatorios están completos
    const allCompleted = calculateCompletion(newCheckedRequisitos, checkedDocumentos);
    
    if (onRequirementsChange) {
      onRequirementsChange({
        requisitos: newCheckedRequisitos,
        documentos: checkedDocumentos,
        completed: allCompleted
      });
    }
  };
  const handleDocumentoCheck = (documentoId, checked) => {
    const newCheckedDocumentos = {
      ...checkedDocumentos,
      [documentoId]: checked
    };
    setCheckedDocumentos(newCheckedDocumentos);
    
    // Calcular si todos los requisitos obligatorios están completos
    const allCompleted = calculateCompletion(checkedRequisitos, newCheckedDocumentos);
    
    if (onRequirementsChange) {
      onRequirementsChange({
        requisitos: checkedRequisitos,
        documentos: newCheckedDocumentos,
        uploadedFiles,
        completed: allCompleted
      });
    }
  };

  // Manejar upload de archivos
  const handleFileUpload = (documentoId, fileData) => {
    const newUploadedFiles = {
      ...uploadedFiles,
      [documentoId]: fileData
    };
    setUploadedFiles(newUploadedFiles);
    
    // Automáticamente marcar el documento como completado si se sube un archivo
    if (fileData) {
      const newCheckedDocumentos = {
        ...checkedDocumentos,
        [documentoId]: true
      };
      setCheckedDocumentos(newCheckedDocumentos);
      
      // Calcular si todos los requisitos obligatorios están completos
      const allCompleted = calculateCompletion(checkedRequisitos, newCheckedDocumentos);
      
      if (onRequirementsChange) {
        onRequirementsChange({
          requisitos: checkedRequisitos,
          documentos: newCheckedDocumentos,
          uploadedFiles: newUploadedFiles,
          completed: allCompleted
        });
      }
    } else {
      // Si se elimina el archivo, desmarcar el documento
      const newCheckedDocumentos = {
        ...checkedDocumentos,
        [documentoId]: false
      };
      setCheckedDocumentos(newCheckedDocumentos);
      
      const allCompleted = calculateCompletion(checkedRequisitos, newCheckedDocumentos);
      
      if (onRequirementsChange) {
        onRequirementsChange({
          requisitos: checkedRequisitos,
          documentos: newCheckedDocumentos,
          uploadedFiles: newUploadedFiles,
          completed: allCompleted
        });
      }
    }
  };  // Función para calcular si todos los requisitos obligatorios están completos
  const calculateCompletion = (requisitoState, documentoState) => {
    const todosRequisitos = [...(tramite.requisitos || []), ...getRequisitosAdicionales()];
    const todosDocumentos = [...(tramite.documentos || []), ...getDocumentosAdicionales()];
    
    // Verificar requisitos obligatorios
    const requisitosObligatorios = todosRequisitos.filter(r => r.obligatorio !== false);
    const requisitosCompletos = requisitosObligatorios.length === 0 || requisitosObligatorios.every(r => requisitoState[r.id] === true);
    
    // Verificar documentos obligatorios
    const documentosObligatorios = todosDocumentos.filter(d => d.obligatorio !== false);
    const documentosCompletos = documentosObligatorios.length === 0 || documentosObligatorios.every(d => {
      return documentoState[d.id] === true;
    });
    
    const allCompleted = requisitosCompletos && documentosCompletos;
    
    return allCompleted;
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      'administrativa': 'bg-blue-100 text-blue-800',
      'tecnica': 'bg-green-100 text-green-800',
      'ambiental': 'bg-emerald-100 text-emerald-800',
      'legal': 'bg-purple-100 text-purple-800',
      'financiera': 'bg-yellow-100 text-yellow-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const requisitosBase = tramite.requisitos || [];
  const requisitosAdicionales = getRequisitosAdicionales();
  const todosRequisitos = [
    ...requisitosBase.map((req, index) => ({
      id: `base_${index}`,
      texto: req,
      categoria: 'administrativa',
      obligatorio: true,
      descripcion: 'Requisito estándar para este tipo de trámite.'
    })),
    ...requisitosAdicionales
  ];

  const documentosBase = tramite.documentos_requeridos || [];
  const documentosAdicionales = getDocumentosAdicionales();
  const todosDocumentos = [
    ...documentosBase.map((doc, index) => ({
      id: `base_doc_${index}`,
      nombre: doc,
      formato: 'PDF, JPG, PNG',
      tamaño_max: '5MB',
      obligatorio: true,
      descripcion: 'Documento requerido para el procesamiento del trámite.'
    })),
    ...documentosAdicionales
  ];

  const getCompletionStats = () => {
    const totalRequisitos = todosRequisitos.length;
    const requisitosCompletos = Object.values(checkedRequisitos).filter(Boolean).length;
    const totalDocumentos = todosDocumentos.length;
    const documentosCompletos = Object.values(checkedDocumentos).filter(Boolean).length;
    
    return {
      requisitos: {
        completos: requisitosCompletos,
        total: totalRequisitos,
        porcentaje: totalRequisitos > 0 ? Math.round((requisitosCompletos / totalRequisitos) * 100) : 0
      },
      documentos: {
        completos: documentosCompletos,
        total: totalDocumentos,
        porcentaje: totalDocumentos > 0 ? Math.round((documentosCompletos / totalDocumentos) * 100) : 0
      }
    };
  };

  const stats = getCompletionStats();
  const isComplete = stats.requisitos.porcentaje === 100 && stats.documentos.porcentaje === 100;

  if (!tramite) return null;

  return (
    <div className="space-y-6">
      {/* Resumen de progreso */}
      <Card className={`border-2 ${isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Lista de Verificación
            </h3>
            {isComplete && (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Requisitos</span>
                <span className="text-sm text-gray-500">
                  {stats.requisitos.completos}/{stats.requisitos.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.requisitos.porcentaje}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{stats.requisitos.porcentaje}% completo</span>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Documentos</span>
                <span className="text-sm text-gray-500">
                  {stats.documentos.completos}/{stats.documentos.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.documentos.porcentaje}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{stats.documentos.porcentaje}% completo</span>
            </div>
          </div>

          {isComplete ? (
            <div className="bg-green-100 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  ¡Perfecto! Has completado todos los requisitos y documentos necesarios.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 rounded-lg p-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Revisa y marca todos los requisitos y documentos antes de continuar.
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Requisitos */}
      {todosRequisitos.length > 0 && (
        <Card>
          <div className="p-6">            <button
              type="button"
              onClick={() => setShowRequisitos(!showRequisitos)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                Requisitos ({todosRequisitos.length})
              </h3>
              {showRequisitos ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {showRequisitos && (
              <div className="space-y-3">
                {todosRequisitos.map((requisito) => (
                  <div
                    key={requisito.id}
                    className={`border rounded-lg p-4 transition-all ${
                      checkedRequisitos[requisito.id] 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={checkedRequisitos[requisito.id] || false}
                          onChange={(e) => handleRequisitoCheck(requisito.id, e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${
                            checkedRequisitos[requisito.id] 
                              ? 'line-through text-gray-500' 
                              : 'text-gray-900'
                          }`}>
                            {requisito.texto}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(requisito.categoria)}`}>
                              {requisito.categoria}
                            </span>
                            {requisito.obligatorio && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Obligatorio
                              </span>
                            )}
                          </div>
                        </div>                        <button
                          type="button"
                          onClick={() => setExpandedRequisito(
                            expandedRequisito === requisito.id ? null : requisito.id
                          )}
                          className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
                        >
                          {expandedRequisito === requisito.id ? 'Ocultar detalles' : 'Ver detalles'}
                        </button>
                        
                        {expandedRequisito === requisito.id && (
                          <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                            <p className="text-xs text-indigo-700">{requisito.descripcion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Documentos */}
      {todosDocumentos.length > 0 && (
        <Card>
          <div className="p-6">            <button
              type="button"
              onClick={() => setShowDocumentos(!showDocumentos)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                Documentos Requeridos ({todosDocumentos.length})
              </h3>
              {showDocumentos ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {showDocumentos && (
              <div className="space-y-3">
                {todosDocumentos.map((documento) => (
                  <div
                    key={documento.id}
                    className={`border rounded-lg p-4 transition-all ${
                      checkedDocumentos[documento.id] 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={checkedDocumentos[documento.id] || false}
                          onChange={(e) => handleDocumentoCheck(documento.id, e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-medium ${
                            checkedDocumentos[documento.id] 
                              ? 'line-through text-gray-500' 
                              : 'text-gray-900'
                          }`}>
                            {documento.nombre}
                          </p>
                          {documento.obligatorio && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Obligatorio
                            </span>
                          )}
                        </div>
                          <div className="text-xs text-gray-600 space-y-1 mb-3">
                          <p><strong>Formato aceptado:</strong> {documento.formato}</p>
                          <p><strong>Tamaño máximo:</strong> {documento.tamaño_max}</p>
                          <p><strong>Descripción:</strong> {documento.descripcion}</p>
                        </div>
                        
                        {/* Componente de upload */}
                        <DocumentUpload 
                          documento={documento}
                          onUploadComplete={handleFileUpload}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Importante sobre los documentos:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Todos los documentos deben estar en formato digital</li>
                        <li>• Los documentos deben ser legibles y en buena calidad</li>
                        <li>• No se aceptan documentos vencidos o con información incompleta</li>
                        <li>• Puedes subir los documentos después de crear la solicitud</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RequirementsPreview;
