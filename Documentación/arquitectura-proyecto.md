# 🏗️ ARQUITECTURA DEL PROYECTO DOCUCONTROL AI

## 📋 Información del Proyecto
- **Nombre**: DocuControl AI
- **Objetivo**: Sistema automatizado de gestión documental para Municipalidad Provincial de Yau
- **Tecnologías**: Django 4.2 + React + MariaDB 10.4.32 + Machine Learning

---

## 🔧 **DJANGO (BACKEND) - Responsabilidades**

### **Funciones Principales:**
1. **API REST** - Proporcionar endpoints para el frontend
2. **Base de datos** - Gestionar modelos y datos (ORM)
3. **Autenticación** - Login, permisos, sesiones de usuario
4. **Lógica de negocio** - Reglas municipales, validaciones
5. **Machine Learning** - Algoritmos de priorización y predicción
6. **Archivos** - Subida y gestión de documentos
7. **Notificaciones** - Sistema de alertas automáticas
8. **Admin panel** - Interface administrativa

### **APIs que proporciona Django:**
```python
# Gestión de Trámites
POST /api/tramites/                    → Crear nuevo trámite
GET /api/tramites/                     → Listar trámites
GET /api/tramites/{id}/                → Obtener trámite específico
PUT /api/tramites/{id}/                → Actualizar trámite
DELETE /api/tramites/{id}/             → Eliminar trámite
PUT /api/tramites/{id}/estado/         → Cambiar estado del trámite

# Gestión de Documentos
POST /api/documentos/upload/           → Subir documento
GET /api/documentos/                   → Listar documentos
POST /api/documentos/{id}/validar/     → Validar documento con ML

# Usuarios y Autenticación
POST /api/auth/login/                  → Iniciar sesión
POST /api/auth/logout/                 → Cerrar sesión
POST /api/auth/register/               → Registrar usuario
GET /api/auth/profile/                 → Obtener perfil de usuario

# Machine Learning
GET /api/ml/priorizar/{tramite_id}/    → Calcular prioridad ML
GET /api/ml/tiempo-estimado/{id}/      → Estimar tiempo de resolución
POST /api/ml/detectar-errores/         → Detectar errores en documentos

# Notificaciones
GET /api/notificaciones/               → Obtener notificaciones del usuario
POST /api/notificaciones/              → Crear notificación
PUT /api/notificaciones/{id}/leer/     → Marcar como leída

# Tipos de Trámites
GET /api/tipos-tramites/               → Listar tipos disponibles
GET /api/tipos-tramites/{id}/          → Detalles del tipo de trámite

# Métricas y Reportes
GET /api/metricas/dashboard/           → Datos del dashboard
GET /api/reportes/tramites/            → Reporte de trámites
GET /api/reportes/ml-performance/      → Rendimiento de algoritmos ML
```

### **Modelos de Django (Base de Datos):**
```python
# Modelos principales
- UserProfile          → Perfiles de usuarios municipales
- TipoTramite          → Tipos de trámites disponibles
- EstadoTramite        → Estados del flujo de trámites
- Tramite              → Trámites principales con campos ML
- Documento            → Archivos adjuntos con validación ML
- Notificacion         → Sistema de alertas automáticas
- PrediccionML         → Logs de predicciones para análisis
- MetricaSistema       → Métricas de rendimiento del sistema
```

---

## ⚛️ **REACT (FRONTEND) - Responsabilidades**

### **Funciones Principales:**
1. **Interfaz de usuario** - Pantallas, formularios, botones
2. **Experiencia de usuario** - Navegación, interacciones
3. **Consumir API** - Hacer peticiones HTTP a Django
4. **Estados locales** - Datos temporales en el navegador
5. **Validación de formularios** - Verificar datos antes de enviar
6. **Visualización** - Gráficos, tablas, dashboards
7. **Responsive design** - Adaptable a móviles/tablets

### **Componentes principales de React:**
```jsx
// Componentes de Usuario
- LoginForm            → Formulario de inicio de sesión
- RegisterForm         → Formulario de registro
- UserProfile          → Perfil del usuario
- UserDashboard        → Dashboard del ciudadano

// Componentes de Trámites
- TramiteForm          → Crear nuevo trámite
- TramiteList          → Lista de trámites
- TramiteDetail        → Detalles del trámite
- TramiteStatus        → Estado y seguimiento
- TramiteSearch        → Búsqueda y filtros

// Componentes de Documentos
- DocumentUpload       → Subir archivos (drag & drop)
- DocumentList         → Lista de documentos
- DocumentPreview      → Visualizar documentos
- DocumentValidation   → Estado de validación ML

// Componentes de Notificaciones
- NotificationBell     → Campana de notificaciones
- NotificationList     → Lista de notificaciones
- NotificationItem     → Notificación individual

// Componentes de Administración
- AdminDashboard       → Panel administrativo
- UserManagement       → Gestión de usuarios
- TramiteManagement    → Gestión de trámites
- MetricsChart         → Gráficos de métricas
- MLPerformance        → Rendimiento de algoritmos ML

// Componentes de Layout
- Header               → Cabecera con navegación
- Sidebar              → Barra lateral de navegación
- Footer               → Pie de página
- LoadingSpinner       → Indicador de carga
- ErrorBoundary        → Manejo de errores
```

### **Páginas principales (Routing):**
```jsx
// Rutas públicas
/                      → Página principal
/login                 → Iniciar sesión
/register              → Registrarse
/about                 → Acerca del sistema

// Rutas de ciudadano
/dashboard             → Panel del ciudadano
/tramites              → Mis trámites
/tramites/nuevo        → Crear trámite
/tramites/{id}         → Detalle del trámite
/documentos            → Mis documentos
/notificaciones        → Mis notificaciones
/perfil                → Mi perfil

// Rutas de funcionario
/admin                 → Panel administrativo
/admin/tramites        → Gestión de trámites
/admin/usuarios        → Gestión de usuarios
/admin/reportes        → Reportes y métricas
/admin/ml              → Panel de Machine Learning

// Rutas de sistema
/404                   → Página no encontrada
/500                   → Error del servidor
```

---

## 🔄 **FLUJO DE TRABAJO COMPLETO**

### **Ejemplo 1: Crear un trámite**
1. **React**: Usuario llena formulario en `/tramites/nuevo`
2. **React**: Valida datos localmente (campos requeridos, formatos)
3. **React**: Envía `POST /api/tramites/` a Django
4. **Django**: Recibe datos, valida en servidor
5. **Django**: Guarda en base de datos MariaDB
6. **Django**: Ejecuta algoritmo ML para calcular prioridad
7. **Django**: Crea notificación automática
8. **Django**: Devuelve respuesta JSON con el trámite creado
9. **React**: Redirige a `/tramites/{id}` mostrando el nuevo trámite

### **Ejemplo 2: Sistema de notificaciones en tiempo real**
1. **Django**: Detecta cambio de estado de trámite (webhook/signal)
2. **Django**: Crea notificación en base de datos
3. **Django**: Envía email/SMS si está configurado
4. **React**: Polling cada 30 segundos a `/api/notificaciones/`
5. **React**: Actualiza campana de notificaciones
6. **React**: Muestra toast/popup con la nueva notificación

### **Ejemplo 3: Validación de documentos con ML**
1. **React**: Usuario sube documento en `DocumentUpload`
2. **React**: Envía `POST /api/documentos/upload/` con archivo
3. **Django**: Guarda archivo en sistema de archivos
4. **Django**: Ejecuta algoritmo ML para validar documento
5. **Django**: Calcula confianza de validación (0-100%)
6. **Django**: Marca si requiere revisión humana
7. **Django**: Devuelve estado de validación
8. **React**: Actualiza UI mostrando resultado de validación

---

## 📊 **ARQUITECTURA DEL SISTEMA**

```
┌─────────────────────┐    HTTP/JSON     ┌──────────────────────┐
│    REACT APP        │ ←──────────────→ │    DJANGO API        │
│   (Frontend)        │                  │    (Backend)         │
│                     │                  │                      │
│ • Componentes       │                  │ • Models (ORM)       │
│ • Estados           │                  │ • Views/APIs         │
│ • Rutas            │                  │ • ML Algorithms      │
│ • Formularios      │                  │ • File Handling      │
│ • UI/UX            │                  │ • Authentication     │
│ • Validaciones     │                  │ • Business Logic     │
│                     │                  │ • Notifications      │
└─────────────────────┘                  └──────────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────────┐
                                         │   MARIADB 10.4.32   │
                                         │   (Base de Datos)   │
                                         │                     │
                                         │ • Usuarios          │
                                         │ • Trámites          │
                                         │ • Documentos        │
                                         │ • Notificaciones    │
                                         │ • Métricas ML       │
                                         │ • Predicciones      │
                                         └─────────────────────┘
```

---

## 🎯 **DIVISIÓN CLARA DE RESPONSABILIDADES**

| **Django se encarga de:**               | **React se encarga de:**                 |
|-----------------------------------------|------------------------------------------|
| ✅ Guardar datos en base de datos       | ✅ Mostrar datos al usuario              |
| ✅ Validar permisos y autenticación     | ✅ Formularios interactivos              |
| ✅ Ejecutar algoritmos de ML            | ✅ Gráficos y visualizaciones            |
| ✅ Procesar y validar documentos        | ✅ Experiencia de usuario fluida         |
| ✅ Enviar emails y notificaciones       | ✅ Navegación entre páginas              |
| ✅ Lógica de negocio municipal          | ✅ Estados locales (filtros, carrito)    |
| ✅ Seguridad y validaciones servidor    | ✅ Validaciones inmediatas del cliente   |
| ✅ Generación de reportes               | ✅ Dashboards y métricas visuales        |
| ✅ Integración con sistemas externos    | ✅ Responsive design y accesibilidad     |

---

## 🔧 **TECNOLOGÍAS ESPECÍFICAS**

### **Backend (Django)**
- **Framework**: Django 4.2 LTS (compatible con MariaDB 10.4.32)
- **API**: Django REST Framework
- **Base de datos**: MariaDB 10.4.32 con PyMySQL
- **ML**: scikit-learn, pandas, numpy
- **Archivos**: Django File Storage
- **CORS**: django-cors-headers
- **Admin**: Django Admin Panel personalizado

### **Frontend (React)**
- **Framework**: React 18+
- **Routing**: React Router
- **Estado**: Context API / Redux (a definir)
- **HTTP**: Axios
- **UI**: Material-UI / Bootstrap (a definir)
- **Gráficos**: Chart.js / D3.js (a definir)
- **Formularios**: Formik / React Hook Form (a definir)

### **Base de Datos**
- **Motor**: MariaDB 10.4.32 (XAMPP)
- **Charset**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Conexión**: PyMySQL driver

---

## 📈 **FUNCIONALIDADES DE MACHINE LEARNING**

### **Algoritmos implementados en Django:**
1. **Priorización de Trámites**
   - Input: Tipo de trámite, fecha, ciudadano, documentos
   - Output: Prioridad (1-5), urgencia (bool)

2. **Estimación de Tiempo**
   - Input: Histórico de trámites similares
   - Output: Días estimados de resolución

3. **Detección de Errores**
   - Input: Datos del trámite, documentos adjuntos
   - Output: Probabilidad de error (0-100%)

4. **Validación de Documentos**
   - Input: Archivo subido, tipo esperado
   - Output: Confianza de validez (0-100%)

### **Métricas y monitoreo:**
- Precisión de predicciones
- Tiempo de procesamiento
- Satisfacción del ciudadano
- Eficiencia del sistema

---

## 🚀 **PRÓXIMOS PASOS**

1. **Configurar Django 4.2** para compatibilidad con MariaDB 10.4.32
2. **Crear migraciones** de base de datos
3. **Implementar APIs básicas** de trámites y usuarios
4. **Desarrollar componentes React** fundamentales
5. **Integrar algoritmos ML** básicos
6. **Configurar sistema de notificaciones**
7. **Implementar dashboard** administrativo
8. **Testing y optimización**

---

*Documento creado para proyecto DocuControl AI - Sistema de gestión municipal con Machine Learning*
*Fecha: Mayo 2025*
