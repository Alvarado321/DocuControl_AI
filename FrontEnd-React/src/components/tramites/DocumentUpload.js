import React, { useState } from 'react';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DocumentUpload = ({ documento, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const allowedTypes = documento.formato.split(', ').map(format => {
    switch(format.toLowerCase()) {
      case 'pdf': return 'application/pdf';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'dwg': return 'application/dwg';
      default: return format;
    }
  });

  const maxSize = parseFloat(documento.tamaño_max) * 1024 * 1024; // Convertir MB a bytes

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type) && !allowedTypes.some(type => file.name.toLowerCase().endsWith(type.split('/')[1]))) {
      setError(`Tipo de archivo no permitido. Formatos aceptados: ${documento.formato}`);
      return;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${documento.tamaño_max}`);
      return;
    }

    setUploading(true);
    
    // Simular upload (en implementación real, aquí iría la llamada al API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay de upload
      
      const uploadedFileData = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        url: URL.createObjectURL(file) // Solo para preview, en implementación real sería la URL del servidor
      };
      
      setUploadedFile(uploadedFileData);
      
      // Notificar al componente padre
      if (onUploadComplete) {
        onUploadComplete(documento.id, uploadedFileData);
      }
      
    } catch (err) {
      setError('Error al cargar el archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    if (onUploadComplete) {
      onUploadComplete(documento.id, null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploadedFile) {
    return (
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-medium text-green-900">{uploadedFile.name}</p>
              <p className="text-sm text-green-600">
                {formatFileSize(uploadedFile.size)} • Cargado exitosamente
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="text-green-600 hover:text-green-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : error 
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Cargando archivo...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {error ? (
              <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-red-500" />
            ) : (
              <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {error ? 'Error al cargar archivo' : 'Arrastra tu archivo aquí'}
              </p>
              <p className="text-xs text-gray-500">
                {error ? error : `o haz clic para seleccionar`}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Formatos: {documento.formato}</p>
              <p>Tamaño máximo: {documento.tamaño_max}</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-xs text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
