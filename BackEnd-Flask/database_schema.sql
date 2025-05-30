-- ================================================================================================
-- DOCUCONTROL AI - ESQUEMA DE BASE DE DATOS
-- Sistema automatizado de gestión documental y trámites municipales
-- ================================================================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS docucontrol_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE docucontrol_ai;

-- ================================================================================================
-- TABLA: usuarios
-- Almacena información de ciudadanos y personal administrativo
-- ================================================================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('ciudadano', 'administrativo', 'supervisor', 'admin') DEFAULT 'ciudadano',
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_dni (dni),
    KEY idx_email (email),
    KEY idx_rol (rol)
);

-- ================================================================================================
-- TABLA: tramites
-- Define los tipos de trámites disponibles en la municipalidad
-- ================================================================================================
CREATE TABLE tramites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria ENUM('licencias', 'permisos', 'servicios', 'certificados', 'otros') NOT NULL,
    requisitos TEXT, -- JSON como texto para compatibilidad
    tiempo_estimado_dias INT DEFAULT 15,
    costo DECIMAL(10,2) DEFAULT 0.00,
    prioridad_default ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    documentos_requeridos TEXT, -- JSON como texto para compatibilidad
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_codigo (codigo),
    KEY idx_categoria (categoria),
    KEY idx_estado (estado)
);

-- ================================================================================================
-- TABLA: solicitudes
-- Registra las solicitudes específicas de cada ciudadano
-- ================================================================================================
CREATE TABLE solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_expediente VARCHAR(50) UNIQUE NOT NULL,
    usuario_id INT NOT NULL,
    tramite_id INT NOT NULL,
    estado_actual ENUM('pendiente', 'en_revision', 'observado', 'aprobado', 'rechazado', 'finalizado') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    prioridad_ml ENUM('baja', 'media', 'alta', 'critica') NULL, -- Prioridad calculada por ML
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite TIMESTAMP NULL,
    fecha_finalizacion TIMESTAMP NULL,
    observaciones TEXT,
    datos_adicionales TEXT, -- JSON como texto para compatibilidad
    puntuacion_ml DECIMAL(5,2) NULL, -- Puntuación de prioridad calculada por ML
    procesado_ml TINYINT(1) DEFAULT 0,
    asignado_a INT NULL, -- ID del usuario administrativo asignado
    
    KEY idx_numero_expediente (numero_expediente),
    KEY idx_estado_actual (estado_actual),
    KEY idx_prioridad (prioridad),
    KEY idx_fecha_solicitud (fecha_solicitud),
    KEY idx_usuario_id (usuario_id),
    KEY idx_tramite_id (tramite_id),
    KEY idx_procesado_ml (procesado_ml),
    
    CONSTRAINT fk_solicitudes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_solicitudes_tramite FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitudes_asignado FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ================================================================================================
-- TABLA: documentos
-- Almacena información de archivos adjuntos y documentación
-- ================================================================================================
CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL, -- DNI, recibo, plano, etc.
    ruta_archivo VARCHAR(500) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    hash_archivo VARCHAR(64), -- Para verificar integridad
    estado_validacion ENUM('pendiente', 'valido', 'invalido', 'observado') DEFAULT 'pendiente',
    observaciones_validacion TEXT,
    procesado_ml TINYINT(1) DEFAULT 0,
    resultado_ml TEXT, -- JSON como texto para compatibilidad
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subido_por INT NOT NULL,
    
    KEY idx_solicitud_id (solicitud_id),
    KEY idx_tipo_documento (tipo_documento),
    KEY idx_estado_validacion (estado_validacion),
    KEY idx_procesado_ml (procesado_ml),
    KEY idx_fecha_subida (fecha_subida),
    
    CONSTRAINT fk_documentos_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    CONSTRAINT fk_documentos_usuario FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ================================================================================================
-- TABLA: historial_estado
-- Registra todos los cambios de estado y acciones sobre las solicitudes
-- ================================================================================================
CREATE TABLE historial_estado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    estado_anterior ENUM('pendiente', 'en_revision', 'observado', 'aprobado', 'rechazado', 'finalizado') NULL,
    estado_nuevo ENUM('pendiente', 'en_revision', 'observado', 'aprobado', 'rechazado', 'finalizado') NOT NULL,
    accion VARCHAR(100) NOT NULL, -- 'creacion', 'revision', 'observacion', 'aprobacion', etc.
    comentarios TEXT,
    realizado_por INT NOT NULL,
    automatico TINYINT(1) DEFAULT 0, -- Indica si fue una acción automática del sistema/ML
    datos_adicionales TEXT, -- JSON como texto para compatibilidad
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_solicitud_id (solicitud_id),
    KEY idx_fecha_accion (fecha_accion),
    KEY idx_realizado_por (realizado_por),
    KEY idx_automatico (automatico),
    
    CONSTRAINT fk_historial_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (realizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ================================================================================================
-- DATOS INICIALES
-- ================================================================================================

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (dni, nombres, apellidos, email, password_hash, rol) VALUES 
('12345678', 'Administrador', 'Sistema', 'admin@municipalidad.gob.pe', 'admin123', 'admin');

-- Insertar algunos tipos de trámites comunes
INSERT INTO tramites (codigo, nombre, categoria, tiempo_estimado_dias, costo, documentos_requeridos) VALUES 
('LIC-COM-001', 'Licencia de Funcionamiento Comercial', 'licencias', 30, 150.00, '["DNI", "RUC", "Plano de ubicación", "Certificado de compatibilidad de uso"]'),
('PER-CON-001', 'Permiso de Construcción', 'permisos', 45, 500.00, '["DNI", "Planos arquitectónicos", "Memoria descriptiva", "Certificado de parámetros"]'),
('CER-DOM-001', 'Certificado de Domicilio', 'certificados', 7, 25.00, '["DNI", "Recibo de servicios"]'),
('SER-LIM-001', 'Servicio de Limpieza Pública', 'servicios', 15, 80.00, '["DNI", "Declaración jurada"]'),
('LIC-EDI-001', 'Licencia de Edificación', 'licencias', 60, 800.00, '["DNI", "Proyecto arquitectónico", "Estudio de suelos", "Certificado de factibilidad"]');

-- ================================================================================================
-- VISTAS ÚTILES
-- ================================================================================================

-- Vista para resumen de solicitudes por usuario
CREATE VIEW vista_solicitudes_usuario AS
SELECT 
    s.id,
    s.numero_expediente,
    u.nombres,
    u.apellidos,
    u.dni,
    t.nombre as tramite_nombre,
    s.estado_actual,
    s.prioridad,
    s.fecha_solicitud,
    s.fecha_limite,
    DATEDIFF(s.fecha_limite, NOW()) as dias_restantes
FROM solicitudes s
JOIN usuarios u ON s.usuario_id = u.id
JOIN tramites t ON s.tramite_id = t.id;

-- Vista para solicitudes pendientes de ML
CREATE VIEW vista_pendientes_ml AS
SELECT 
    s.id,
    s.numero_expediente,
    t.nombre as tramite_nombre,
    s.fecha_solicitud,
    COUNT(d.id) as documentos_adjuntos
FROM solicitudes s
JOIN tramites t ON s.tramite_id = t.id
LEFT JOIN documentos d ON s.id = d.solicitud_id
WHERE s.procesado_ml = 0
GROUP BY s.id, s.numero_expediente, t.nombre, s.fecha_solicitud;

-- ================================================================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ================================================================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_solicitudes_estado_fecha ON solicitudes(estado_actual, fecha_solicitud);
CREATE INDEX idx_solicitudes_prioridad_fecha ON solicitudes(prioridad, fecha_solicitud);
CREATE INDEX idx_documentos_solicitud_tipo ON documentos(solicitud_id, tipo_documento);
CREATE INDEX idx_historial_solicitud_fecha ON historial_estado(solicitud_id, fecha_accion);

-- ================================================================================================
-- COMENTARIOS FINALES
-- ================================================================================================
-- Este esquema está optimizado para:
-- 1. Gestión eficiente de trámites municipales
-- 2. Integración con algoritmos de Machine Learning
-- 3. Seguimiento completo del estado de solicitudes
-- 4. Almacenamiento flexible de documentos
-- 5. Auditoría completa de acciones
-- 6. Escalabilidad y rendimiento
-- ================================================================================================
