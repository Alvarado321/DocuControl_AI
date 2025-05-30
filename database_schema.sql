-- Base de Datos para DOCUCONTROL AI
-- Sistema automatizado de gestión documental para Municipalidad Provincial de Yau
-- Diseñado para Django ORM

-- Tabla de usuarios (Django Auth User se extiende con perfil)
CREATE TABLE users_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES auth_user(id) ON DELETE CASCADE,
    dni VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    direccion TEXT,
    tipo_usuario VARCHAR(20) DEFAULT 'ciudadano' CHECK (tipo_usuario IN ('ciudadano', 'funcionario', 'administrador')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de trámites municipales
CREATE TABLE tipos_tramites (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    departamento VARCHAR(50) NOT NULL,
    tiempo_estimado_dias INTEGER DEFAULT 7,
    documentos_requeridos TEXT[],
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estados de trámites
CREATE TABLE estados_tramite (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    es_final BOOLEAN DEFAULT false,
    orden_proceso INTEGER
);

-- Trámites principales con campos ML
CREATE TABLE tramites (
    id SERIAL PRIMARY KEY,
    numero_expediente VARCHAR(20) UNIQUE NOT NULL,
    ciudadano_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
    tipo_tramite_id INTEGER REFERENCES tipos_tramites(id),
    estado_id INTEGER REFERENCES estados_tramite(id) DEFAULT 1,
    descripcion TEXT,
    observaciones TEXT,
    
    -- Campos de fechas
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_estimada DATE,
    fecha_completado TIMESTAMP NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos ML
    prioridad_ml INTEGER CHECK (prioridad_ml BETWEEN 1 AND 5) DEFAULT 3,
    riesgo_error DECIMAL(5,2) CHECK (riesgo_error BETWEEN 0 AND 100) DEFAULT 0,
    tiempo_estimado_ml INTEGER, -- en días, calculado por ML
    requiere_atencion_urgente BOOLEAN DEFAULT false,
    
    -- Funcionario asignado
    funcionario_asignado_id INTEGER REFERENCES auth_user(id) NULL
);

-- Documentos adjuntos con validación ML
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    tramite_id INTEGER REFERENCES tramites(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamaño_kb INTEGER,
    tipo_documento VARCHAR(100),
    
    -- Validación ML
    validado_ml BOOLEAN DEFAULT false,
    confianza_validacion DECIMAL(5,2) CHECK (confianza_validacion BETWEEN 0 AND 100),
    requiere_revision_humana BOOLEAN DEFAULT true,
    
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Sistema de notificaciones automatizadas
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
    tramite_id INTEGER REFERENCES tramites(id) ON DELETE CASCADE NULL,
    tipo VARCHAR(50) NOT NULL, -- 'estado_cambio', 'documento_requerido', 'alerta_sistema'
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Control de envío
    enviado BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP NULL,
    canal VARCHAR(20) DEFAULT 'sistema', -- 'email', 'sms', 'sistema'
    leido BOOLEAN DEFAULT false,
    fecha_lectura TIMESTAMP NULL,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de predicciones ML para análisis
CREATE TABLE predicciones_ml (
    id SERIAL PRIMARY KEY,
    tramite_id INTEGER REFERENCES tramites(id) ON DELETE CASCADE,
    algoritmo VARCHAR(50) NOT NULL, -- 'prioridad', 'tiempo_estimado', 'deteccion_errores'
    entrada_datos JSONB, -- datos de entrada del algoritmo
    prediccion JSONB, -- resultado de la predicción
    confianza DECIMAL(5,2) CHECK (confianza BETWEEN 0 AND 100),
    tiempo_procesamiento_ms INTEGER,
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métricas del sistema para análisis de rendimiento
CREATE TABLE metricas_sistema (
    id SERIAL PRIMARY KEY,
    fecha DATE DEFAULT CURRENT_DATE,
    tramites_creados INTEGER DEFAULT 0,
    tramites_completados INTEGER DEFAULT 0,
    tiempo_promedio_resolucion DECIMAL(5,2), -- en días
    precision_ml_prioridad DECIMAL(5,2),
    precision_ml_tiempo DECIMAL(5,2),
    satisfaccion_ciudadano DECIMAL(3,2), -- escala 1-5
    
    UNIQUE(fecha)
);

-- Insertar estados básicos
INSERT INTO estados_tramite (nombre, descripcion, es_final, orden_proceso) VALUES
('pendiente', 'Trámite recibido, pendiente de revisión', false, 1),
('en_revision', 'Documentos en proceso de revisión', false, 2),
('observado', 'Trámite con observaciones, requiere corrección', false, 3),
('en_proceso', 'Trámite en proceso de resolución', false, 4),
('completado', 'Trámite completado exitosamente', true, 5),
('rechazado', 'Trámite rechazado', true, 6);

-- Insertar tipos de trámites comunes municipales
INSERT INTO tipos_tramites (nombre, descripcion, departamento, tiempo_estimado_dias, documentos_requeridos) VALUES
('Licencia de Funcionamiento', 'Autorización para operación de negocio', 'Desarrollo Económico', 15, ARRAY['DNI', 'RUC', 'Certificado de Zonificación']),
('Permiso de Construcción', 'Autorización para construcción o remodelación', 'Obras Públicas', 30, ARRAY['DNI', 'Planos', 'Estudio de Suelos']),
('Certificado de Residencia', 'Certificación de domicilio del ciudadano', 'Registros Civiles', 3, ARRAY['DNI', 'Recibo de Servicios']),
('Licencia de Conducir', 'Expedición de licencia de conducir', 'Transporte', 7, ARRAY['DNI', 'Certificado Médico', 'Examen Psicológico']),
('Certificado de Soltería', 'Certificación de estado civil', 'Registros Civiles', 5, ARRAY['DNI', 'Partida de Nacimiento']);

-- Índices para optimización
CREATE INDEX idx_tramites_ciudadano ON tramites(ciudadano_id);
CREATE INDEX idx_tramites_estado ON tramites(estado_id);
CREATE INDEX idx_tramites_fecha ON tramites(fecha_solicitud);
CREATE INDEX idx_tramites_prioridad ON tramites(prioridad_ml);
CREATE INDEX idx_tramites_expediente ON tramites(numero_expediente);
CREATE INDEX idx_documentos_tramite ON documentos(tramite_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(usuario_id, leido) WHERE leido = false;
CREATE INDEX idx_predicciones_tramite ON predicciones_ml(tramite_id);

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tramites_updated
    BEFORE UPDATE ON tramites
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- Función para generar número de expediente automático
CREATE OR REPLACE FUNCTION generar_numero_expediente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_expediente = 'EXP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('expediente_seq'), 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE expediente_seq START 1;

CREATE TRIGGER trigger_generar_expediente
    BEFORE INSERT ON tramites
    FOR EACH ROW
    WHEN (NEW.numero_expediente IS NULL)
    EXECUTE FUNCTION generar_numero_expediente();

-- Comentarios para documentación
COMMENT ON TABLE tramites IS 'Tabla principal de trámites municipales con campos ML integrados';
COMMENT ON COLUMN tramites.prioridad_ml IS 'Prioridad calculada por algoritmo ML (1=muy alta, 5=muy baja)';
COMMENT ON COLUMN tramites.riesgo_error IS 'Porcentaje de riesgo de error detectado por ML';
COMMENT ON COLUMN tramites.tiempo_estimado_ml IS 'Tiempo estimado en días calculado por ML';
COMMENT ON TABLE predicciones_ml IS 'Log de todas las predicciones ML para análisis y mejora';
COMMENT ON TABLE metricas_sistema IS 'Métricas diarias del sistema para dashboard y análisis';
