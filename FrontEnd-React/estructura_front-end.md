# 🚀 DocuControl AI - Frontend React Structure

## 📋 **Resumen del Proyecto**
Sistema de gestión documental municipal con Machine Learning para priorización automática de trámites y análisis inteligente de documentos.

## 🏗️ **Arquitectura Frontend**

### 📁 **Estructura de Carpetas**

```
FrontEnd-React/
├── public/
│   ├── index.html                  # HTML principal
│   ├── favicon.ico                 # Icono del sistema
│   ├── manifest.json               # PWA manifest
│   └── logo192.png                 # Logo municipalidad
│
├── src/
│   ├── components/                 # 🧩 COMPONENTES REUTILIZABLES
│   │   ├── common/                 # Componentes base
│   │   │   ├── Header.jsx          # Cabecera con navegación
│   │   │   ├── Sidebar.jsx         # Menú lateral responsive
│   │   │   ├── Loading.jsx         # Spinner de carga
│   │   │   ├── Modal.jsx           # Modal genérico
│   │   │   ├── ConfirmDialog.jsx   # Diálogo de confirmación
│   │   │   ├── ErrorBoundary.jsx   # Manejo de errores
│   │   │   └── Layout.jsx          # Layout principal
│   │   │
│   │   ├── auth/                   # 🔐 AUTENTICACIÓN
│   │   │   ├── LoginForm.jsx       # Formulario de login
│   │   │   ├── RegisterForm.jsx    # Formulario de registro
│   │   │   ├── ProtectedRoute.jsx  # Rutas protegidas
│   │   │   └── RoleGuard.jsx       # Control de roles
│   │   │
│   │   ├── dashboard/              # 📊 DASHBOARD & MÉTRICAS
│   │   │   ├── DashboardCard.jsx   # Tarjeta de métricas
│   │   │   ├── StatsWidget.jsx     # Widget estadísticas
│   │   │   ├── MLMetricsPanel.jsx  # Panel métricas ML
│   │   │   ├── PriorityChart.jsx   # Gráfico prioridades
│   │   │   ├── TrendChart.jsx      # Gráfico tendencias
│   │   │   └── KPICard.jsx         # Tarjeta KPI
│   │   │
│   │   ├── tramites/               # 📋 GESTIÓN DE TRÁMITES
│   │   │   ├── TramiteCard.jsx     # Tarjeta de trámite
│   │   │   ├── TramiteList.jsx     # Lista de trámites
│   │   │   ├── TramiteDetails.jsx  # Detalles de trámite
│   │   │   ├── TramiteFilter.jsx   # Filtros de búsqueda
│   │   │   └── CategoryBadge.jsx   # Badge de categoría
│   │   │
│   │   ├── solicitudes/            # 📝 SOLICITUDES
│   │   │   ├── SolicitudForm.jsx   # Formulario nueva solicitud
│   │   │   ├── SolicitudCard.jsx   # Tarjeta de solicitud
│   │   │   ├── SolicitudList.jsx   # Lista de solicitudes
│   │   │   ├── SolicitudDetails.jsx # Detalles completos
│   │   │   ├── PriorityBadge.jsx   # Badge de prioridad ML
│   │   │   ├── StatusBadge.jsx     # Badge de estado
│   │   │   ├── TimelineView.jsx    # Vista temporal historial
│   │   │   └── MLScoreDisplay.jsx  # Visualización score ML
│   │   │
│   │   ├── documentos/             # 📎 GESTIÓN DOCUMENTOS
│   │   │   ├── DocumentUpload.jsx  # Subida de archivos
│   │   │   ├── DocumentList.jsx    # Lista de documentos
│   │   │   ├── DocumentViewer.jsx  # Visor de documentos
│   │   │   ├── MLValidationStatus.jsx # Estado validación ML
│   │   │   ├── DocumentType.jsx    # Detector tipo documento
│   │   │   └── UploadProgress.jsx  # Progreso de subida
│   │   │
│   │   └── ml/                     # 🤖 MACHINE LEARNING
│   │       ├── MLProcessor.jsx     # Procesador ML manual
│   │       ├── PriorityMatrix.jsx  # Matriz de prioridades
│   │       ├── MLStatistics.jsx    # Estadísticas ML
│   │       ├── AlertsPanel.jsx     # Panel de alertas
│   │       ├── MLConfigPanel.jsx   # Configuración ML
│   │       ├── ScoreVisualization.jsx # Visualización scores
│   │       └── PredictionPanel.jsx # Panel predicciones
│   │
│   ├── pages/                      # 📄 PÁGINAS PRINCIPALES
│   │   ├── auth/                   # Autenticación
│   │   │   ├── Login.jsx           # Página de login
│   │   │   ├── Register.jsx        # Página de registro
│   │   │   └── ForgotPassword.jsx  # Recuperar contraseña
│   │   │
│   │   ├── dashboard/              # Dashboards
│   │   │   ├── Dashboard.jsx       # Dashboard ciudadano
│   │   │   ├── AdminDashboard.jsx  # Dashboard administrativo
│   │   │   └── MLDashboard.jsx     # Dashboard ML específico
│   │   │
│   │   ├── tramites/               # Trámites
│   │   │   ├── TramitesPage.jsx    # Lista general trámites
│   │   │   ├── TramiteDetailPage.jsx # Detalle específico
│   │   │   └── CategoryPage.jsx    # Trámites por categoría
│   │   │
│   │   ├── solicitudes/            # Solicitudes
│   │   │   ├── MisSolicitudes.jsx  # Mis solicitudes (ciudadano)
│   │   │   ├── NuevaSolicitud.jsx  # Crear nueva solicitud
│   │   │   ├── SolicitudDetail.jsx # Detalle solicitud
│   │   │   ├── GestionSolicitudes.jsx # Gestión (admin)
│   │   │   └── PrioridadesMl.jsx   # Vista prioridades ML
│   │   │
│   │   └── admin/                  # Administración
│   │       ├── MLManagement.jsx    # Gestión ML
│   │       ├── UserManagement.jsx  # Gestión usuarios
│   │       ├── SystemReports.jsx   # Reportes sistema
│   │       ├── MLConfiguration.jsx # Configuración ML
│   │       └── SystemStats.jsx     # Estadísticas sistema
│   │
│   ├── services/                   # 🔧 SERVICIOS API
│   │   ├── api.js                  # Cliente HTTP base (Axios)
│   │   ├── authService.js          # Servicios autenticación
│   │   ├── tramitesService.js      # Servicios trámites
│   │   ├── solicitudesService.js   # Servicios solicitudes
│   │   ├── documentosService.js    # Servicios documentos
│   │   ├── mlService.js            # Servicios ML específicos
│   │   └── notificationService.js  # Servicios notificaciones
│   │
│   ├── hooks/                      # 🪝 CUSTOM HOOKS
│   │   ├── useAuth.js              # Hook autenticación
│   │   ├── useLocalStorage.js      # Hook local storage
│   │   ├── useAPI.js               # Hook llamadas API
│   │   ├── useML.js                # Hook Machine Learning
│   │   ├── useNotifications.js     # Hook notificaciones
│   │   ├── usePagination.js        # Hook paginación
│   │   └── useWebSocket.js         # Hook WebSocket (tiempo real)
│   │
│   ├── context/                    # 🏪 CONTEXT PROVIDERS
│   │   ├── AuthContext.js          # Context autenticación
│   │   ├── NotificationContext.js  # Context notificaciones
│   │   ├── MLContext.js            # Context Machine Learning
│   │   └── ThemeContext.js         # Context tema UI
│   │
│   ├── utils/                      # 🛠️ UTILIDADES
│   │   ├── constants.js            # Constantes del sistema
│   │   ├── helpers.js              # Funciones auxiliares
│   │   ├── dateUtils.js            # Utilidades de fechas
│   │   ├── validators.js           # Validadores formularios
│   │   ├── formatters.js           # Formateadores datos
│   │   ├── mlUtils.js              # Utilidades ML frontend
│   │   └── permissions.js          # Control permisos
│   │
│   ├── styles/                     # 🎨 ESTILOS
│   │   ├── globals.css             # Estilos globales
│   │   ├── components.css          # Estilos componentes
│   │   ├── themes.css              # Temas y variables
│   │   ├── animations.css          # Animaciones
│   │   └── responsive.css          # Responsive design
│   │
│   ├── assets/                     # 📦 RECURSOS
│   │   ├── images/                 # Imágenes
│   │   ├── icons/                  # Iconos
│   │   └── fonts/                  # Fuentes
│   │
│   ├── App.jsx                     # 🏠 Componente principal
│   ├── App.css                     # Estilos App
│   ├── index.js                    # 🚀 Punto de entrada
│   └── index.css                   # Estilos base
│
├── package.json                    # 📦 Dependencias npm
├── package-lock.json               # Lock dependencias
├── tailwind.config.js              # Configuración Tailwind
├── postcss.config.js               # Configuración PostCSS
├── .env                            # Variables entorno
├── .env.example                    # Ejemplo variables
├── .gitignore                      # Git ignore
└── README.md                       # Documentación
```

## 🎯 **Funcionalidades por Rol**

### 👤 **Ciudadano**
- **Dashboard Personal**
  - Resumen solicitudes activas
  - Alertas ML de estado
  - Próximos vencimientos
  - Estadísticas personales

- **Gestión Solicitudes**
  - Crear nueva solicitud
  - Seguimiento tiempo real
  - Predicción ML tiempos
  - Historial completo

- **Documentos Inteligentes**
  - Upload con drag & drop
  - Validación automática ML
  - Detección tipo documento
  - Feedback inmediato

### 🏛️ **Administrativo**
- **Dashboard Operativo**
  - Cola de trabajo priorizada
  - Solicitudes asignadas
  - Métricas rendimiento
  - Alertas urgentes

- **Gestión Avanzada**
  - Procesamiento batch ML
  - Asignación inteligente
  - Cambio estados masivo
  - Reportes operativos

### 👑 **Supervisor/Admin**
- **Dashboard Ejecutivo**
  - KPIs sistema completo
  - Métricas ML tiempo real
  - Tendencias predictivas
  - Alertas sistema

- **Configuración ML**
  - Ajuste parámetros
  - Reentrenamiento modelos
  - Configuración alertas
  - Análisis rendimiento

## 🛠️ **Stack Tecnológico**

### **Core Frontend**
- ⚛️ **React 18** - Library principal
- 🛣️ **React Router 6** - Navegación SPA
- 📦 **Axios** - Cliente HTTP
- 🎨 **Tailwind CSS** - Framework CSS

### **UI & UX**
- 🎯 **Headless UI** - Componentes accesibles
- 📊 **Chart.js/Recharts** - Gráficos y visualizaciones
- 🎨 **Heroicons** - Iconografía
- 🌈 **React Hot Toast** - Notificaciones
- 🖼️ **Framer Motion** - Animaciones

### **Estado & Datos**
- 🔄 **TanStack Query** - Estado servidor
- 🏪 **Context API** - Estado global
- 💾 **LocalStorage** - Persistencia local
- 🔌 **WebSocket** - Tiempo real

### **ML & Visualización**
- 📈 **D3.js** - Visualizaciones avanzadas
- 🎯 **Victory** - Gráficos estadísticos
- 📊 **Recharts** - Dashboards ML
- 🔥 **React Flow** - Diagramas flujo

### **Desarrollo & Calidad**
- 🛠️ **Vite** - Build tool
- 🔍 **ESLint** - Linting
- 💄 **Prettier** - Formatting
- 🧪 **Jest** - Testing
- 📱 **PWA** - Progressive Web App

## 🎨 **Design System**

### **Paleta de Colores**
```css
/* Colores Principales */
--primary-blue: #1e40af;      /* Azul institucional */
--secondary-green: #059669;   /* Verde éxito */
--warning-orange: #d97706;    /* Naranja alertas */
--danger-red: #dc2626;        /* Rojo crítico */
--info-cyan: #0891b2;         /* Cyan información */

/* Prioridades ML */
--priority-critical: #dc2626; /* Crítica - Rojo */
--priority-high: #ea580c;     /* Alta - Naranja */
--priority-medium: #ca8a04;   /* Media - Amarillo */
--priority-low: #16a34a;      /* Baja - Verde */

/* Grises */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### **Tipografía**
```css
/* Fuentes */
--font-primary: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Tamaños */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### **Espaciado**
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 🚀 **Características Avanzadas**

### **🤖 Integración ML**
- Visualización scores tiempo real
- Predicciones interactivas
- Configuración parámetros
- Métricas rendimiento

### **📱 Progressive Web App**
- Funcionamiento offline
- Instalación nativa
- Push notifications
- Caché inteligente

### **🔔 Sistema Alertas**
- Notificaciones tiempo real
- Alertas ML predictivas
- Sistema prioridades
- Configuración personalizada

### **📊 Analytics Avanzado**
- Dashboards interactivos
- Métricas ML especializadas
- Reportes predictivos
- Exportación datos

### **🔐 Seguridad**
- JWT token management
- Role-based access
- Secure API calls
- Input validation

## 🎯 **Próximos Pasos**

1. **Configuración Inicial**
   - ✅ Crear estructura proyecto
   - ⏳ Configurar dependencias
   - ⏳ Setup Tailwind CSS
   - ⏳ Configurar routing

2. **Autenticación Base**
   - ⏳ Context autenticación
   - ⏳ Formularios login/register
   - ⏳ Rutas protegidas
   - ⏳ Manejo tokens

3. **Componentes Core**
   - ⏳ Layout principal
   - ⏳ Navegación
   - ⏳ Componentes base
   - ⏳ Sistema notificaciones

4. **Funcionalidades ML**
   - ⏳ Servicios ML API
   - ⏳ Visualizaciones
   - ⏳ Dashboard ML
   - ⏳ Configuración parámetros

5. **Testing & Optimización**
   - ⏳ Tests unitarios
   - ⏳ Tests integración
   - ⏳ Optimización performance
   - ⏳ PWA setup

---

**DocuControl AI** - Sistema Municipal de Gestión Documental con Machine Learning
*Desarrollado para la Municipalidad Provincial de Yau*
