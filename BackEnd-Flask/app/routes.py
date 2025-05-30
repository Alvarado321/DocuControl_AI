from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app import db
from app.models import Usuario, Tramite, Solicitud, Documento, HistorialEstado
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
import hashlib
import json

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

@documentos_bp.route('/subir/<int:solicitud_id>', methods=['POST'])
@jwt_required()
def subir_documento(solicitud_id):
    """Subir documento para una solicitud"""
    try:
        user_id = int(get_jwt_identity())
        
        solicitud = Solicitud.query.get(solicitud_id)
        if not solicitud:
            return jsonify({'error': 'Solicitud no encontrada'}), 404
        
        # Verificar permisos
        if solicitud.usuario_id != user_id:
            return jsonify({'error': 'Sin permisos para subir documentos a esta solicitud'}), 403
        
        if 'archivo' not in request.files:
            return jsonify({'error': 'No se encontró archivo'}), 400
        
        archivo = request.files['archivo']
        tipo_documento = request.form.get('tipo_documento', 'general')
        
        if archivo.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Generar nombre seguro
        filename = secure_filename(archivo.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        nombre_archivo = f"{solicitud_id}_{timestamp}_{filename}"
        
        # Guardar archivo
        ruta_archivo = os.path.join(current_app.config['UPLOAD_FOLDER'], nombre_archivo)
        archivo.save(ruta_archivo)
        
        # Calcular hash del archivo
        with open(ruta_archivo, 'rb') as f:
            hash_archivo = hashlib.sha256(f.read()).hexdigest()
        
        # Crear registro en base de datos
        documento = Documento(
            solicitud_id=solicitud_id,
            nombre_archivo=nombre_archivo,
            nombre_original=filename,
            tipo_documento=tipo_documento,
            ruta_archivo=ruta_archivo,
            tamano_bytes=os.path.getsize(ruta_archivo),
            tipo_mime=archivo.content_type or 'application/octet-stream',
            hash_archivo=hash_archivo,
            subido_por=user_id
        )
        
        db.session.add(documento)
        db.session.commit()
        
        return jsonify({
            'message': 'Documento subido exitosamente',
            'documento': documento.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
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
