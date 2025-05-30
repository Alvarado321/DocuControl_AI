// Configuración y constantes de la aplicación

export const APP_CONFIG = {
  name: 'DocuControl AI',
  version: '1.0.0',
  description: 'Sistema automatizado de gestión documental municipal con ML',
};

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
};

export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Rutas del ciudadano
  DASHBOARD: '/dashboard',
  TRAMITES: '/tramites',
  MIS_SOLICITUDES: '/mis-solicitudes',
  NUEVA_SOLICITUD: '/nueva-solicitud',
  SOLICITUD_DETAIL: '/solicitud/:id',
  
  // Rutas administrativas
  ADMIN_DASHBOARD: '/admin/dashboard',
  GESTION_SOLICITUDES: '/admin/solicitudes',
  ML_MANAGEMENT: '/admin/ml',
  USER_MANAGEMENT: '/admin/usuarios',
  REPORTS: '/admin/reportes',
};

export const ROLES = {
  CIUDADANO: 'ciudadano',
  ADMINISTRATIVO: 'administrativo',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
};

export const ESTADOS_SOLICITUD = {
  PENDIENTE: 'pendiente',
  EN_REVISION: 'en_revision',
  OBSERVADO: 'observado',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  FINALIZADO: 'finalizado',
};

export const PRIORIDADES = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica',
};

export const CATEGORIAS_TRAMITE = {
  LICENCIAS: 'licencias',
  PERMISOS: 'permisos',
  SERVICIOS: 'servicios',
  CERTIFICADOS: 'certificados',
  OTROS: 'otros',
};

export const TIPOS_DOCUMENTO = {
  DNI: 'DNI',
  RUC: 'RUC',
  RECIBO_SERVICIOS: 'recibo_servicios',
  PLANO_UBICACION: 'plano_ubicacion',
  CERTIFICADO_COMPATIBILIDAD: 'certificado_compatibilidad',
  PLANOS_ARQUITECTONICOS: 'planos_arquitectonicos',
  MEMORIA_DESCRIPTIVA: 'memoria_descriptiva',
  ESTUDIO_SUELOS: 'estudio_suelos',
  DECLARACION_JURADA: 'declaracion_jurada',
  GENERAL: 'general',
};

export const ESTADOS_VALIDACION = {
  PENDIENTE: 'pendiente',
  VALIDO: 'valido',
  INVALIDO: 'invalido',
  OBSERVADO: 'observado',
};

export const ML_CONFIG = {
  SCORE_THRESHOLDS: {
    CRITICAL: 80,
    HIGH: 60,
    MEDIUM: 40,
    LOW: 0,
  },
  CONFIDENCE_LEVELS: {
    VERY_HIGH: 90,
    HIGH: 75,
    MEDIUM: 60,
    LOW: 40,
  },
  AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
};

export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
};

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  ISO: 'YYYY-MM-DDTHH:mm:ss',
};
