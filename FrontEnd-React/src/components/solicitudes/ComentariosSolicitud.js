import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';

const ComentariosSolicitud = ({ solicitudId }) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Obtener comentarios de la solicitud
  const {
    data: comentarios,
    isLoading,
    error
  } = useQuery({
    queryKey: ['comentarios', solicitudId],
    queryFn: async () => {
      // Por ahora simulamos datos de comentarios
      // En el futuro esto vendría del backend: solicitudesService.getComentarios(solicitudId)
      return [
        {
          id: 1,
          mensaje: 'Solicitud recibida correctamente. Se procederá con la revisión de documentos.',
          usuario: {
            nombre: 'Ana García',
            rol: 'Funcionario',
            avatar: null
          },
          fecha: new Date(Date.now() - 86400000).toISOString(),
          esInterno: false,
          editado: false
        },
        {
          id: 2,
          mensaje: 'Se requiere documentación adicional. Favor adjuntar certificado de residencia actualizado (no mayor a 30 días).',
          usuario: {
            nombre: 'Carlos López',
            rol: 'Supervisor',
            avatar: null
          },
          fecha: new Date(Date.now() - 43200000).toISOString(),
          esInterno: false,
          editado: false
        },
        {
          id: 3,
          mensaje: 'He adjuntado el certificado de residencia solicitado. ¿Necesitan algún documento adicional?',
          usuario: {
            nombre: user?.nombre_completo || 'Usuario',
            rol: 'Ciudadano',
            avatar: null
          },
          fecha: new Date(Date.now() - 21600000).toISOString(),
          esInterno: false,
          editado: false
        }
      ];
    },
    enabled: !!solicitudId
  });

  // Mutación para enviar comentario
  const enviarComentarioMutation = useMutation({
    mutationFn: async (comentarioData) => {
      // Simular envío de comentario
      // En el futuro: await solicitudesService.agregarComentario(solicitudId, comentarioData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now(),
        mensaje: comentarioData.mensaje,
        usuario: {
          nombre: user?.nombre_completo || 'Usuario',
          rol: 'Ciudadano',
          avatar: null
        },
        fecha: new Date().toISOString(),
        esInterno: false,
        editado: false
      };
    },
    onSuccess: (nuevoComentarioData) => {
      // Actualizar la cache con el nuevo comentario
      queryClient.setQueryData(['comentarios', solicitudId], (old) => [
        nuevoComentarioData,
        ...(old || [])
      ]);
      setNuevoComentario('');
      showNotification('Comentario enviado exitosamente', 'success');
    },
    onError: (error) => {
      showNotification('Error al enviar comentario', 'error');
    }
  });

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) {
      showNotification('Escriba un comentario antes de enviar', 'warning');
      return;
    }

    setEnviandoComentario(true);
    try {
      await enviarComentarioMutation.mutateAsync({
        mensaje: nuevoComentario.trim()
      });
    } finally {
      setEnviandoComentario(false);
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getInitials = (nombre) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRolColor = (rol) => {
    switch (rol?.toLowerCase()) {
      case 'funcionario':
        return 'bg-blue-500';
      case 'supervisor':
        return 'bg-purple-500';
      case 'admin':
        return 'bg-red-500';
      case 'ciudadano':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          No se pudieron cargar los comentarios
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario para nuevo comentario */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500 mr-2" />
            Agregar Comentario
          </h3>
          
          <form onSubmit={handleEnviarComentario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu comentario
              </label>
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Escribe tu comentario o pregunta aquí..."
                disabled={enviandoComentario}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={enviandoComentario || !nuevoComentario.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviandoComentario ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Enviar Comentario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Card>

      {/* Lista de comentarios */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Conversación ({comentarios?.length || 0} comentarios)
          </h3>

          {comentarios && comentarios.length > 0 ? (
            <div className="space-y-6">
              {comentarios.map((comentario) => (
                <div key={comentario.id} className="flex space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comentario.usuario.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={comentario.usuario.avatar}
                        alt={comentario.usuario.nombre}
                      />
                    ) : (
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium
                        ${getRolColor(comentario.usuario.rol)}
                      `}>
                        {getInitials(comentario.usuario.nombre)}
                      </div>
                    )}
                  </div>

                  {/* Contenido del comentario */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-4">
                      {/* Header del comentario */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {comentario.usuario.nombre}
                          </h4>
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${getRolColor(comentario.usuario.rol)} text-white
                          `}>
                            {comentario.usuario.rol}
                          </span>
                          {comentario.esInterno && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Interno
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatDate(comentario.fecha)}</span>
                          {comentario.editado && (
                            <span className="text-gray-400">(editado)</span>
                          )}
                        </div>
                      </div>

                      {/* Mensaje */}
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comentario.mensaje}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay comentarios todavía
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Sé el primero en comentar sobre esta solicitud
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Información sobre comentarios */}
      <Card>
        <div className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Sobre los Comentarios
          </h4>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Comunicación en tiempo real
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Los comentarios se comparten con todos los participantes del trámite</li>
                    <li>Recibirás notificaciones cuando haya nuevos comentarios</li>
                    <li>Los funcionarios pueden responder y solicitar información adicional</li>
                    <li>Mantén un tono profesional y cordial en tus comentarios</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComentariosSolicitud;
