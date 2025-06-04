from flask import Blueprint, request, jsonify, current_app, send_file # type: ignore
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token # type: ignore
from app import db
from app.models import Usuario, Tramite, Solicitud, Documento, HistorialEstado
from werkzeug.utils import secure_filename # type: ignore
import os
from datetime import datetime, timedelta
import hashlib
import json
from app.ml_utils import solicitud_processor

# Blueprints para organizar las rutas
main_bp = Blueprint('main', __name__)
auth_bp = Blueprint('auth', __name__)
tramites_bp = Blueprint('tramites', __name__)
solicitudes_bp = Blueprint('solicitudes', __name__)
documentos_bp = Blueprint('documentos', __name__)
ml_bp = Blueprint('ml', __name__)

# ================================================================================================
# RUTAS PRINCIPALES
# ================================================================================================

@main_bp.route('/')
def index():
    """Ruta principal de la API"""
    return jsonify({
        'message': 'DocuControl AI - API de gestión de trámites municipales',
        'version': '1.0.0',
        'status': 'active'
    })

@main_bp.route('/health')
def health_check():
    """Verificación de salud del sistema"""
    try:
        # Verificar conexión a la base de datos
        db.session.execute('SELECT 1')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# ================================================================================================
# RUTAS DE AUTENTICACIÓN
# ================================================================================================

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de nuevos usuarios"""    
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['dni', 'nombres', 'apellidos', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} es requerido'}), 400
        
        # Verificar si el usuario ya existe
        if Usuario.query.filter_by(dni=data['dni']).first():
            return jsonify({'error': 'DNI ya registrado'}), 400
        
        if Usuario.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email ya registrado'}), 400
        
        # Crear nuevo usuario
        usuario = Usuario(
            dni=data['dni'],
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            email=data['email'],
            telefono=data.get('telefono'),
            direccion=data.get('direccion'),
            rol=data.get('rol', 'ciudadano')
        )
        usuario.set_password(data['password'])
        
        db.session.add(usuario)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'usuario': usuario.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Autenticación de usuarios"""    
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        usuario = Usuario.query.filter_by(email=data['email']).first()
        
        if not usuario or not usuario.check_password(data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        if usuario.estado != 'activo':
            return jsonify({'error': 'Usuario inactivo'}), 401
        
        # Actualizar última actividad
        usuario.ultima_actividad = datetime.utcnow()
        db.session.commit()
          # Crear token de acceso
        access_token = create_access_token(identity=str(usuario.id))
        
        return jsonify({
            'access_token': access_token,
            'usuario': usuario.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario autenticado"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify(usuario.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================================================================
# RUTAS DE TRÁMITES
# ================================================================================================

@tramites_bp.route('/', methods=['GET'])
def get_tramites():
    """Obtener lista de trámites disponibles"""
    try:
        tramites = Tramite.query.filter_by(estado='activo').all()
        return jsonify([tramite.to_dict() for tramite in tramites])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tramites_bp.route('/<int:tramite_id>', methods=['GET'])
def get_tramite(tramite_id):
    """Obtener detalles de un trámite específico"""
    try:
        tramite = Tramite.query.get(tramite_id)
        
        if not tramite:
            return jsonify({'error': 'Trámite no encontrado'}), 404
        
        return jsonify(tramite.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tramites_bp.route('/categoria/<categoria>', methods=['GET'])
def get_tramites_por_categoria(categoria):
    """Obtener trámites por categoría"""
    try:
        tramites = Tramite.query.filter_by(categoria=categoria, estado='activo').all()
        return jsonify([tramite.to_dict() for tramite in tramites])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================================================================
# RUTAS DE SOLICITUDES
# ================================================================================================

@solicitudes_bp.route('/', methods=['POST'])
@jwt_required()
def crear_solicitud():
    """Crear nueva solicitud de trámite"""    
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if 'tramite_id' not in data:
            return jsonify({'error': 'ID del trámite es requerido'}), 400
        
        tramite = Tramite.query.get(data['tramite_id'])
        if not tramite:
            return jsonify({'error': 'Trámite no encontrado'}), 404
        
        # Generar número de expediente único
        from datetime import datetime
        import random
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        numero_expediente = f"{tramite.codigo}-{timestamp}-{random.randint(100, 999)}"
        
        # Calcular fecha límite
        fecha_limite = datetime.utcnow() + timedelta(days=tramite.tiempo_estimado_dias)
        
        # Crear solicitud
        solicitud = Solicitud(
            numero_expediente=numero_expediente,
            usuario_id=user_id,
            tramite_id=data['tramite_id'],
            prioridad=tramite.prioridad_default,
            fecha_limite=fecha_limite,
            observaciones=data.get('observaciones')
        )
        
        if 'datos_adicionales' in data:
            solicitud.set_datos_adicionales(data['datos_adicionales'])
        
        db.session.add(solicitud)
        db.session.flush()  # Para obtener el ID
        
        # Crear registro en historial
        historial = HistorialEstado(
            solicitud_id=solicitud.id,
            estado_nuevo='pendiente',
            accion='creacion',
            comentarios='Solicitud creada por el ciudadano',
            realizado_por=user_id
        )
        
        db.session.add(historial)
        db.session.commit()

        # Entrenar/actualizar modelo ML automáticamente
        try:
            solicitud_processor.train_priority_model_from_db()
        except Exception as ml_error:
            current_app.logger.warning(f"No se pudo actualizar el modelo ML: {ml_error}")

        return jsonify({
            'message': 'Solicitud creada exitosamente',
            'solicitud': solicitud.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@solicitudes_bp.route('/mis-solicitudes', methods=['GET'])
@jwt_required()
def get_mis_solicitudes():
    """Obtener solicitudes del usuario autenticado"""
    try:
        user_id = int(get_jwt_identity())
        solicitudes = Solicitud.query.filter_by(usuario_id=user_id).all()
        
        resultado = []
        for solicitud in solicitudes:
            solicitud_dict = solicitud.to_dict()
            solicitud_dict['tramite'] = solicitud.tramite.to_dict()
            resultado.append(solicitud_dict)
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@solicitudes_bp.route('/<int:solicitud_id>', methods=['GET'])
@jwt_required()
def get_solicitud(solicitud_id):
    """Obtener detalles de una solicitud específica"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        solicitud = Solicitud.query.get(solicitud_id)
        if not solicitud:
            return jsonify({'error': 'Solicitud no encontrada'}), 404
        
        # Verificar permisos
        if usuario.rol == 'ciudadano' and solicitud.usuario_id != user_id:
            return jsonify({'error': 'Sin permisos para acceder a esta solicitud'}), 403
        
        solicitud_dict = solicitud.to_dict()
        solicitud_dict['tramite'] = solicitud.tramite.to_dict()
        solicitud_dict['usuario'] = solicitud.usuario.to_dict()
        solicitud_dict['documentos'] = [doc.to_dict() for doc in solicitud.documentos]
        solicitud_dict['historial'] = [hist.to_dict() for hist in solicitud.historial]
        
        return jsonify(solicitud_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================================================================
# RUTAS DE DOCUMENTOS
# ================================================================================================

def allowed_file(filename):
    """Verificar si el archivo tiene una extensión permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@documentos_bp.route('/subir/<int:solicitud_id>', methods=['POST'])
@jwt_required()
def subir_documento(solicitud_id):
    """Subir documento para una solicitud"""
    try:
        user_id = int(get_jwt_identity())
        
        # Verificar que existe la solicitud y el usuario tiene permisos
        solicitud = Solicitud.query.get(solicitud_id)
        if not solicitud:
            return jsonify({'error': 'Solicitud no encontrada'}), 404
        
        usuario = Usuario.query.get(user_id)
        if not usuario:
            return jsonify({'error': 'Usuario no válido'}), 401
        
        # Verificar permisos (ciudadano solo puede subir a sus solicitudes)
        if usuario.rol == 'ciudadano' and solicitud.usuario_id != user_id:
            return jsonify({'error': 'Sin permisos para subir documentos a esta solicitud'}), 403
        
        # Validar que se envió un archivo
        if 'archivo' not in request.files:
            return jsonify({'error': 'No se encontró archivo en la petición'}), 400
        
        archivo = request.files['archivo']
        tipo_documento = request.form.get('tipo_documento', 'general')
        
        if archivo.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Validar extensión del archivo
        if not allowed_file(archivo.filename):
            return jsonify({
                'error': f'Tipo de archivo no permitido. Extensiones permitidas: {", ".join(current_app.config["ALLOWED_EXTENSIONS"])}'
            }), 400
        
        # Asegurar que el directorio de uploads existe
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder, exist_ok=True)
            current_app.logger.info(f"Directorio de uploads creado: {upload_folder}")
        
        # Generar nombre seguro y único
        filename = secure_filename(archivo.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        import random
        random_suffix = random.randint(1000, 9999)
        nombre_archivo = f"{solicitud_id}_{timestamp}_{random_suffix}_{filename}"
        
        # Ruta completa del archivo
        ruta_archivo = os.path.join(upload_folder, nombre_archivo)
        
        # Guardar archivo en el sistema de archivos
        try:
            archivo.save(ruta_archivo)
            current_app.logger.info(f"Archivo guardado exitosamente: {ruta_archivo}")
        except Exception as save_error:
            current_app.logger.error(f"Error al guardar archivo: {save_error}")
            return jsonify({'error': f'Error al guardar archivo: {str(save_error)}'}), 500
        
        # Verificar que el archivo se guardó correctamente
        if not os.path.exists(ruta_archivo):
            return jsonify({'error': 'Error: El archivo no se guardó correctamente'}), 500
        
        # Calcular hash del archivo para verificar integridad
        try:
            with open(ruta_archivo, 'rb') as f:
                hash_archivo = hashlib.sha256(f.read()).hexdigest()
        except Exception as hash_error:
            current_app.logger.error(f"Error al calcular hash: {hash_error}")
            # Eliminar archivo si no se puede calcular el hash
            if os.path.exists(ruta_archivo):
                os.remove(ruta_archivo)
            return jsonify({'error': 'Error al procesar archivo'}), 500
        
        # Obtener información del archivo
        tamano_bytes = os.path.getsize(ruta_archivo)
        tipo_mime = archivo.content_type or 'application/octet-stream'
        
        # Crear registro en base de datos
        documento = Documento(
            solicitud_id=solicitud_id,
            nombre_archivo=nombre_archivo,
            nombre_original=filename,
            tipo_documento=tipo_documento,
            ruta_archivo=ruta_archivo,
            tamano_bytes=tamano_bytes,
            tipo_mime=tipo_mime,
            hash_archivo=hash_archivo,
            subido_por=user_id
        )
        
        try:
            db.session.add(documento)
            db.session.commit()
            current_app.logger.info(f"Documento registrado en BD: ID {documento.id}")
        except Exception as db_error:
            db.session.rollback()
            # Eliminar archivo físico si falla la BD
            if os.path.exists(ruta_archivo):
                os.remove(ruta_archivo)
            current_app.logger.error(f"Error en base de datos: {db_error}")
            return jsonify({'error': f'Error al guardar en base de datos: {str(db_error)}'}), 500
        
        return jsonify({
            'message': 'Documento subido exitosamente',
            'documento': documento.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error general al subir documento: {e}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@documentos_bp.route('/<int:documento_id>', methods=['GET'])
@jwt_required()
def obtener_documento(documento_id):
    """Obtener información de un documento específico"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        documento = Documento.query.get(documento_id)
        if not documento:
            return jsonify({'error': 'Documento no encontrado'}), 404
        
        # Verificar permisos
        if usuario.rol == 'ciudadano' and documento.solicitud.usuario_id != user_id:
            return jsonify({'error': 'Sin permisos para acceder a este documento'}), 403
        
        # Verificar que el archivo físico existe
        if not os.path.exists(documento.ruta_archivo):
            return jsonify({
                'error': 'Archivo físico no encontrado',
                'documento': documento.to_dict()
            }), 404
        
        return jsonify({
            'documento': documento.to_dict(),
            'archivo_existe': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documentos_bp.route('/solicitud/<int:solicitud_id>', methods=['GET'])
@jwt_required()
def obtener_documentos_solicitud(solicitud_id):
    """Obtener todos los documentos de una solicitud"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        solicitud = Solicitud.query.get(solicitud_id)
        if not solicitud:
            return jsonify({'error': 'Solicitud no encontrada'}), 404
        
        # Verificar permisos
        if usuario.rol == 'ciudadano' and solicitud.usuario_id != user_id:
            return jsonify({'error': 'Sin permisos para acceder a esta solicitud'}), 403
        
        documentos = Documento.query.filter_by(solicitud_id=solicitud_id).all()
        
        documentos_data = []
        for doc in documentos:
            doc_data = doc.to_dict()
            doc_data['archivo_existe'] = os.path.exists(doc.ruta_archivo)
            documentos_data.append(doc_data)
        
        return jsonify({
            'documentos': documentos_data,
            'total': len(documentos_data)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documentos_bp.route('/descargar/<int:documento_id>', methods=['GET'])
@jwt_required()
def descargar_documento(documento_id):
    """Descargar un documento"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        documento = Documento.query.get(documento_id)
        if not documento:
            return jsonify({'error': 'Documento no encontrado'}), 404
        
        # Verificar permisos
        if usuario.rol == 'ciudadano' and documento.solicitud.usuario_id != user_id:
            return jsonify({'error': 'Sin permisos para descargar este documento'}), 403
        
        # Verificar que el archivo existe
        if not os.path.exists(documento.ruta_archivo):
            return jsonify({'error': 'Archivo físico no encontrado'}), 404
        
        # Verificar integridad del archivo (opcional)
        try:
            with open(documento.ruta_archivo, 'rb') as f:
                hash_actual = hashlib.sha256(f.read()).hexdigest()
            
            if hash_actual != documento.hash_archivo:
                current_app.logger.warning(f"Hash del archivo {documento_id} no coincide")
                return jsonify({'error': 'Archivo corrupto o modificado'}), 422
        except Exception as hash_error:
            current_app.logger.error(f"Error verificando hash: {hash_error}")
        
        return send_file(
            documento.ruta_archivo,
            as_attachment=True,
            download_name=documento.nombre_original,
            mimetype=documento.tipo_mime
        )
        
    except Exception as e:
        current_app.logger.error(f"Error descargando documento: {e}")
        return jsonify({'error': str(e)}), 500

@documentos_bp.route('/<int:documento_id>', methods=['DELETE'])
@jwt_required()
def eliminar_documento(documento_id):
    """Eliminar un documento (solo para administradores)"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        # Solo administradores pueden eliminar documentos
        if usuario.rol not in ['admin', 'supervisor']:
            return jsonify({'error': 'Sin permisos para eliminar documentos'}), 403
        
        documento = Documento.query.get(documento_id)
        if not documento:
            return jsonify({'error': 'Documento no encontrado'}), 404
        
        # Eliminar archivo físico si existe
        if os.path.exists(documento.ruta_archivo):
            try:
                os.remove(documento.ruta_archivo)
                current_app.logger.info(f"Archivo físico eliminado: {documento.ruta_archivo}")
            except Exception as delete_error:
                current_app.logger.error(f"Error eliminando archivo físico: {delete_error}")
        
        # Eliminar registro de la base de datos
        db.session.delete(documento)
        db.session.commit()
        
        return jsonify({
            'message': 'Documento eliminado exitosamente',
            'documento_id': documento_id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documentos_bp.route('/verificar-integridad', methods=['POST'])
@jwt_required()
def verificar_integridad_documentos():
    """Verificar la integridad de todos los documentos"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        # Solo administradores pueden verificar integridad
        if usuario.rol not in ['admin', 'supervisor']:
            return jsonify({'error': 'Sin permisos para verificar integridad'}), 403
        
        documentos = Documento.query.all()
        resultados = {
            'total_documentos': len(documentos),
            'archivos_faltantes': [],
            'hashes_incorrectos': [],
            'documentos_validos': 0
        }
        
        for documento in documentos:
            # Verificar que el archivo existe
            if not os.path.exists(documento.ruta_archivo):
                resultados['archivos_faltantes'].append({
                    'id': documento.id,
                    'nombre': documento.nombre_original,
                    'ruta': documento.ruta_archivo
                })
                continue
            
            # Verificar hash
            try:
                with open(documento.ruta_archivo, 'rb') as f:
                    hash_actual = hashlib.sha256(f.read()).hexdigest()
                
                if hash_actual != documento.hash_archivo:
                    resultados['hashes_incorrectos'].append({
                        'id': documento.id,
                        'nombre': documento.nombre_original,
                        'hash_esperado': documento.hash_archivo,
                        'hash_actual': hash_actual
                    })
                else:
                    resultados['documentos_validos'] += 1
                    
            except Exception as hash_error:
                resultados['hashes_incorrectos'].append({
                    'id': documento.id,
                    'nombre': documento.nombre_original,
                    'error': str(hash_error)
                })
        
        return jsonify(resultados)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================================================================
# RUTAS DE MACHINE LEARNING
# ================================================================================================

@ml_bp.route('/procesar-solicitudes', methods=['POST'])
@jwt_required()
def procesar_solicitudes_ml():
    """Procesar solicitudes pendientes con Machine Learning"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        
        # Solo usuarios administrativos pueden ejecutar ML
        if usuario.rol not in ['administrativo', 'supervisor', 'admin']:
            return jsonify({'error': 'Sin permisos para ejecutar procesamiento ML'}), 403
        
        # Obtener solicitudes pendientes de procesamiento
        solicitudes_pendientes = Solicitud.query.filter_by(procesado_ml=False).all()
        
        procesadas = 0
        for solicitud in solicitudes_pendientes:
            # Aquí iría la lógica de ML real
            # Por ahora, asignamos prioridad basada en tipo de trámite
            if solicitud.tramite.categoria == 'licencias':
                solicitud.prioridad_ml = 'alta'
                solicitud.puntuacion_ml = 85.0
            elif solicitud.tramite.categoria == 'certificados':
                solicitud.prioridad_ml = 'media'
                solicitud.puntuacion_ml = 65.0
            else:
                solicitud.prioridad_ml = 'baja'
                solicitud.puntuacion_ml = 45.0
            
            solicitud.procesado_ml = True
            procesadas += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Se procesaron {procesadas} solicitudes con ML',
            'solicitudes_procesadas': procesadas
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def get_estadisticas_ml():
    """Obtener estadísticas del sistema ML"""
    try:
        # Estadísticas generales
        total_solicitudes = Solicitud.query.count()
        procesadas_ml = Solicitud.query.filter_by(procesado_ml=True).count()
        pendientes_ml = total_solicitudes - procesadas_ml
        
        # Distribución por prioridad ML
        prioridades = db.session.query(
            Solicitud.prioridad_ml,
            db.func.count(Solicitud.id)
        ).filter(
            Solicitud.prioridad_ml.isnot(None)
        ).group_by(Solicitud.prioridad_ml).all()
        
        return jsonify({
            'total_solicitudes': total_solicitudes,
            'procesadas_ml': procesadas_ml,
            'pendientes_ml': pendientes_ml,
            'porcentaje_procesado': round((procesadas_ml / total_solicitudes * 100), 2) if total_solicitudes > 0 else 0,
            'distribucion_prioridades': dict(prioridades)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/entrenar-modelo-prioridad', methods=['POST'])
@jwt_required()
def entrenar_modelo_prioridad():
    """Entrenar el modelo ML de prioridad con datos históricos"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        if usuario.rol not in ['administrativo', 'supervisor', 'admin']:
            return jsonify({'error': 'Sin permisos para entrenar el modelo ML'}), 403
        resultado = solicitud_processor.train_priority_model_from_db()
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/comparacion-prioridad', methods=['GET'])
@jwt_required()
def comparacion_prioridad():
    """Obtener datos de comparación entre prioridad real y predicha para gráficos"""
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        if usuario.rol not in ['administrativo', 'supervisor', 'admin']:
            return jsonify({'error': 'Sin permisos para ver comparación ML'}), 403
        data = solicitud_processor.get_priority_comparison_data()
        return jsonify({'data': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
