-- Base de Datos para DOCUCONTROL AI - MySQL Version
-- Sistema automatizado de gestión documental para Municipalidad Provincial de Yau
-- Diseñado para Django ORM con MySQL

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS docucontrol_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE docucontrol_ai;

-- Extensión del perfil de usuario de Django
CREATE TABLE users_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    direccion TEXT,
    tipo_usuario ENUM('ciudadano', 'funcionario', 'administrador') DEFAULT 'ciudadano',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_profile_user_id (user_id)
);

-- Tipos de trámites municipales
CREATE TABLE tipos_tramites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    departamento VARCHAR(50) NOT NULL,
    tiempo_estimado_dias INT DEFAULT 7,
    documentos_requeridos JSON,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estados de trámites
CREATE TABLE estados_tramite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    es_final BOOLEAN DEFAULT FALSE,
    orden_proceso INT
);

-- Trámites principales con campos ML
CREATE TABLE tramites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_expediente VARCHAR(20) UNIQUE NOT NULL,
    ciudadano_id INT NOT NULL,
    tipo_tramite_id INT,
    estado_id INT DEFAULT 1,
    descripcion TEXT,
    observaciones TEXT,
    
    -- Campos de fechas
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_estimada DATE,
    fecha_completado TIMESTAMP NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Campos ML
    prioridad_ml INT CHECK (prioridad_ml BETWEEN 1 AND 5) DEFAULT 3,
    riesgo_error DECIMAL(5,2) CHECK (riesgo_error BETWEEN 0 AND 100) DEFAULT 0,
    tiempo_estimado_ml INT, -- en días, calculado por ML
    requiere_atencion_urgente BOOLEAN DEFAULT FALSE,
    
    -- Funcionario asignado
    funcionario_asignado_id INT NULL,
    
    INDEX idx_tramites_ciudadano (ciudadano_id),
    INDEX idx_tramites_estado (estado_id),
    INDEX idx_tramites_fecha (fecha_solicitud),
    INDEX idx_tramites_prioridad (prioridad_ml),
    INDEX idx_tramites_expediente (numero_expediente),
    
    FOREIGN KEY (tipo_tramite_id) REFERENCES tipos_tramites(id),
    FOREIGN KEY (estado_id) REFERENCES estados_tramite(id)
);

-- Documentos adjuntos con validación ML
CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tramite_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamaño_kb INT,
    tipo_documento VARCHAR(100),
    
    -- Validación ML
    validado_ml BOOLEAN DEFAULT FALSE,
    confianza_validacion DECIMAL(5,2) CHECK (confianza_validacion BETWEEN 0 AND 100),
    requiere_revision_humana BOOLEAN DEFAULT TRUE,
    
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_documentos_tramite (tramite_id),
    
    FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE CASCADE
);

-- Sistema de notificaciones automatizadas
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tramite_id INT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'estado_cambio', 'documento_requerido', 'alerta_sistema'
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Control de envío
    enviado BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    canal ENUM('email', 'sms', 'sistema') DEFAULT 'sistema',
    leido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notificaciones_usuario (usuario_id),
    INDEX idx_notificaciones_no_leidas (usuario_id, leido),
    
    FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE CASCADE
);

-- Logs de predicciones ML para análisis
CREATE TABLE predicciones_ml (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tramite_id INT NOT NULL,
    algoritmo VARCHAR(50) NOT NULL, -- 'prioridad', 'tiempo_estimado', 'deteccion_errores'
    entrada_datos JSON, -- datos de entrada del algoritmo
    prediccion JSON, -- resultado de la predicción
    confianza DECIMAL(5,2) CHECK (confianza BETWEEN 0 AND 100),
    tiempo_procesamiento_ms INT,
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_predicciones_tramite (tramite_id),
    
    FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE CASCADE
);

-- Métricas del sistema para análisis de rendimiento
CREATE TABLE metricas_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE DEFAULT (CURRENT_DATE),
    tramites_creados INT DEFAULT 0,
    tramites_completados INT DEFAULT 0,
    tiempo_promedio_resolucion DECIMAL(5,2), -- en días
    precision_ml_prioridad DECIMAL(5,2),
    precision_ml_tiempo DECIMAL(5,2),
    satisfaccion_ciudadano DECIMAL(3,2), -- escala 1-5
    
    UNIQUE KEY unique_fecha (fecha)
);

-- Insertar estados básicos
INSERT INTO estados_tramite (nombre, descripcion, es_final, orden_proceso) VALUES
('pendiente', 'Trámite recibido, pendiente de revisión', FALSE, 1),
('en_revision', 'Documentos en proceso de revisión', FALSE, 2),
('observado', 'Trámite con observaciones, requiere corrección', FALSE, 3),
('en_proceso', 'Trámite en proceso de resolución', FALSE, 4),
('completado', 'Trámite completado exitosamente', TRUE, 5),
('rechazado', 'Trámite rechazado', TRUE, 6);

-- Insertar tipos de trámites comunes municipales
INSERT INTO tipos_tramites (nombre, descripcion, departamento, tiempo_estimado_dias, documentos_requeridos) VALUES
('Licencia de Funcionamiento', 'Autorización para operación de negocio', 'Desarrollo Económico', 15, JSON_ARRAY('DNI', 'RUC', 'Certificado de Zonificación')),
('Permiso de Construcción', 'Autorización para construcción o remodelación', 'Obras Públicas', 30, JSON_ARRAY('DNI', 'Planos', 'Estudio de Suelos')),
('Certificado de Residencia', 'Certificación de domicilio del ciudadano', 'Registros Civiles', 3, JSON_ARRAY('DNI', 'Recibo de Servicios')),
('Licencia de Conducir', 'Expedición de licencia de conducir', 'Transporte', 7, JSON_ARRAY('DNI', 'Certificado Médico', 'Examen Psicológico')),
('Certificado de Soltería', 'Certificación de estado civil', 'Registros Civiles', 5, JSON_ARRAY('DNI', 'Partida de Nacimiento'));

-- Trigger para generar número de expediente automático
DELIMITER //
CREATE TRIGGER generar_numero_expediente
    BEFORE INSERT ON tramites
    FOR EACH ROW
BEGIN
    IF NEW.numero_expediente IS NULL THEN
        SET NEW.numero_expediente = CONCAT('EXP-', YEAR(CURDATE()), '-', LPAD((
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_expediente, -6) AS UNSIGNED)), 0) + 1
            FROM tramites 
            WHERE numero_expediente LIKE CONCAT('EXP-', YEAR(CURDATE()), '-%')
        ), 6, '0'));
    END IF;
END//
DELIMITER ;
