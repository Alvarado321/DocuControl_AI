from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json

class Usuario(db.Model):
    """Modelo para la tabla usuarios"""
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    dni = db.Column(db.String(20), unique=True, nullable=False, index=True)
    nombres = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    telefono = db.Column(db.String(20))
    direccion = db.Column(db.Text)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.Enum('ciudadano', 'administrativo', 'supervisor', 'admin'), default='ciudadano')
    estado = db.Column(db.Enum('activo', 'inactivo', 'suspendido'), default='activo')
    fecha_registro = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    ultima_actividad = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    solicitudes = db.relationship('Solicitud', foreign_keys='Solicitud.usuario_id', backref='usuario')
    solicitudes_asignadas = db.relationship('Solicitud', foreign_keys='Solicitud.asignado_a', backref='asignado')
    documentos_subidos = db.relationship('Documento', backref='subido_por_usuario')
    acciones_historial = db.relationship('HistorialEstado', backref='realizado_por_usuario')
    
    def set_password(self, password):
        """Hashear y guardar contraseña"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verificar contraseña"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'dni': self.dni,
            'nombres': self.nombres,
            'apellidos': self.apellidos,
            'email': self.email,
            'telefono': self.telefono,
            'direccion': self.direccion,
            'rol': self.rol,
            'estado': self.estado,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
            'ultima_actividad': self.ultima_actividad.isoformat() if self.ultima_actividad else None
        }

class Tramite(db.Model):
    """Modelo para la tabla tramites"""
    __tablename__ = 'tramites'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False, index=True)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    categoria = db.Column(db.Enum('licencias', 'permisos', 'servicios', 'certificados', 'otros'), nullable=False)
    requisitos = db.Column(db.Text)  # JSON como texto
    tiempo_estimado_dias = db.Column(db.Integer, default=15)
    costo = db.Column(db.DECIMAL(10, 2), default=0.00)
    prioridad_default = db.Column(db.Enum('baja', 'media', 'alta', 'critica'), default='media')
    documentos_requeridos = db.Column(db.Text)  # JSON como texto
    estado = db.Column(db.Enum('activo', 'inactivo'), default='activo')
    fecha_creacion = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    
    # Relaciones
    solicitudes = db.relationship('Solicitud', backref='tramite')
    
    def get_requisitos(self):
        """Obtener requisitos como lista"""
        try:
            return json.loads(self.requisitos) if self.requisitos else []
        except:
            return []
    
    def set_requisitos(self, requisitos_list):
        """Guardar requisitos como JSON"""
        self.requisitos = json.dumps(requisitos_list)
    
    def get_documentos_requeridos(self):
        """Obtener documentos requeridos como lista"""
        try:
            return json.loads(self.documentos_requeridos) if self.documentos_requeridos else []
        except:
            return []
    
    def set_documentos_requeridos(self, docs_list):
        """Guardar documentos requeridos como JSON"""
        self.documentos_requeridos = json.dumps(docs_list)
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'categoria': self.categoria,
            'requisitos': self.get_requisitos(),
            'tiempo_estimado_dias': self.tiempo_estimado_dias,
            'costo': float(self.costo) if self.costo else 0.0,
            'prioridad_default': self.prioridad_default,
            'documentos_requeridos': self.get_documentos_requeridos(),
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

class Solicitud(db.Model):
    """Modelo para la tabla solicitudes"""
    __tablename__ = 'solicitudes'
    
    id = db.Column(db.Integer, primary_key=True)
    numero_expediente = db.Column(db.String(50), unique=True, nullable=False, index=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    tramite_id = db.Column(db.Integer, db.ForeignKey('tramites.id'), nullable=False)
    estado_actual = db.Column(db.Enum('pendiente', 'en_revision', 'observado', 'aprobado', 'rechazado', 'finalizado'), default='pendiente')
    prioridad = db.Column(db.Enum('baja', 'media', 'alta', 'critica'), default='media')
    prioridad_ml = db.Column(db.Enum('baja', 'media', 'alta', 'critica'))
    fecha_solicitud = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    fecha_limite = db.Column(db.TIMESTAMP)
    fecha_finalizacion = db.Column(db.TIMESTAMP)
    observaciones = db.Column(db.Text)
    datos_adicionales = db.Column(db.Text)  # JSON como texto
    puntuacion_ml = db.Column(db.DECIMAL(5, 2))
    procesado_ml = db.Column(db.Boolean, default=False)
    asignado_a = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    
    # Relaciones
    documentos = db.relationship('Documento', backref='solicitud')
    historial = db.relationship('HistorialEstado', backref='solicitud')
    
    def get_datos_adicionales(self):
        """Obtener datos adicionales como diccionario"""
        try:
            return json.loads(self.datos_adicionales) if self.datos_adicionales else {}
        except:
            return {}
    
    def set_datos_adicionales(self, datos_dict):
        """Guardar datos adicionales como JSON"""
        self.datos_adicionales = json.dumps(datos_dict)
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'numero_expediente': self.numero_expediente,
            'usuario_id': self.usuario_id,
            'tramite_id': self.tramite_id,
            'estado_actual': self.estado_actual,
            'prioridad': self.prioridad,
            'prioridad_ml': self.prioridad_ml,
            'fecha_solicitud': self.fecha_solicitud.isoformat() if self.fecha_solicitud else None,
            'fecha_limite': self.fecha_limite.isoformat() if self.fecha_limite else None,
            'fecha_finalizacion': self.fecha_finalizacion.isoformat() if self.fecha_finalizacion else None,
            'observaciones': self.observaciones,
            'datos_adicionales': self.get_datos_adicionales(),
            'puntuacion_ml': float(self.puntuacion_ml) if self.puntuacion_ml else None,
            'procesado_ml': self.procesado_ml,
            'asignado_a': self.asignado_a
        }

class Documento(db.Model):
    """Modelo para la tabla documentos"""
    __tablename__ = 'documentos'
    
    id = db.Column(db.Integer, primary_key=True)
    solicitud_id = db.Column(db.Integer, db.ForeignKey('solicitudes.id'), nullable=False)
    nombre_archivo = db.Column(db.String(255), nullable=False)
    nombre_original = db.Column(db.String(255), nullable=False)
    tipo_documento = db.Column(db.String(100), nullable=False)
    ruta_archivo = db.Column(db.String(500), nullable=False)
    tamano_bytes = db.Column(db.BigInteger, nullable=False)
    tipo_mime = db.Column(db.String(100), nullable=False)
    hash_archivo = db.Column(db.String(64))
    estado_validacion = db.Column(db.Enum('pendiente', 'valido', 'invalido', 'observado'), default='pendiente')
    observaciones_validacion = db.Column(db.Text)
    procesado_ml = db.Column(db.Boolean, default=False)
    resultado_ml = db.Column(db.Text)  # JSON como texto
    fecha_subida = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    subido_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    def get_resultado_ml(self):
        """Obtener resultado ML como diccionario"""
        try:
            return json.loads(self.resultado_ml) if self.resultado_ml else {}
        except:
            return {}
    
    def set_resultado_ml(self, resultado_dict):
        """Guardar resultado ML como JSON"""
        self.resultado_ml = json.dumps(resultado_dict)
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'solicitud_id': self.solicitud_id,
            'nombre_archivo': self.nombre_archivo,
            'nombre_original': self.nombre_original,
            'tipo_documento': self.tipo_documento,
            'ruta_archivo': self.ruta_archivo,
            'tamano_bytes': self.tamano_bytes,
            'tipo_mime': self.tipo_mime,
            'hash_archivo': self.hash_archivo,
            'estado_validacion': self.estado_validacion,
            'observaciones_validacion': self.observaciones_validacion,
            'procesado_ml': self.procesado_ml,
            'resultado_ml': self.get_resultado_ml(),
            'fecha_subida': self.fecha_subida.isoformat() if self.fecha_subida else None,
            'subido_por': self.subido_por
        }

class HistorialEstado(db.Model):
    """Modelo para la tabla historial_estado"""
    __tablename__ = 'historial_estado'
    
    id = db.Column(db.Integer, primary_key=True)
    solicitud_id = db.Column(db.Integer, db.ForeignKey('solicitudes.id'), nullable=False)
    estado_anterior = db.Column(db.Enum('pendiente', 'en_revision', 'observado', 'aprobado', 'rechazado', 'finalizado'))
    estado_nuevo = db.Column(db.Enum('pendiente', 'en_revision', 'observado', 'aprobado', 'rechazado', 'finalizado'), nullable=False)
    accion = db.Column(db.String(100), nullable=False)
    comentarios = db.Column(db.Text)
    realizado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    automatico = db.Column(db.Boolean, default=False)
    datos_adicionales = db.Column(db.Text)  # JSON como texto
    fecha_accion = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    
    def get_datos_adicionales(self):
        """Obtener datos adicionales como diccionario"""
        try:
            return json.loads(self.datos_adicionales) if self.datos_adicionales else {}
        except:
            return {}
    
    def set_datos_adicionales(self, datos_dict):
        """Guardar datos adicionales como JSON"""
        self.datos_adicionales = json.dumps(datos_dict)
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'solicitud_id': self.solicitud_id,
            'estado_anterior': self.estado_anterior,
            'estado_nuevo': self.estado_nuevo,
            'accion': self.accion,
            'comentarios': self.comentarios,
            'realizado_por': self.realizado_por,
            'automatico': self.automatico,
            'datos_adicionales': self.get_datos_adicionales(),
            'fecha_accion': self.fecha_accion.isoformat() if self.fecha_accion else None
        }
