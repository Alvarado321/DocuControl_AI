# DocuControl AI - Backend Flask

Sistema automatizado de gestión documental y trámites municipales con Machine Learning.

## Estructura del Proyecto

```
BackEnd-Flask/
├── app/
│   ├── __init__.py         # Factory de la aplicación Flask
│   ├── config.py           # Configuraciones del sistema
│   ├── models.py           # Modelos de base de datos (SQLAlchemy)
│   └── routes.py           # Rutas y endpoints de la API
├── uploads/                # Carpeta para archivos subidos
├── database_schema.sql     # Esquema de base de datos MySQL
├── requirements.txt        # Dependencias de Python
├── run.py                  # Script principal para ejecutar la app
├── .env.example           # Ejemplo de variables de entorno
└── README.md              # Este archivo
```

## Instalación y Configuración

### 1. Crear entorno virtual

```bash
python -m venv venv
venv\Scripts\activate  # En Windows
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar base de datos

1. Inicia XAMPP y activa MySQL
2. Abre phpMyAdmin (http://localhost/phpmyadmin)
3. Importa el archivo `database_schema.sql`

### 4. Configurar variables de entorno

1. Copia `.env.example` a `.env`
2. Ajusta las variables según tu configuración

```bash
copy .env.example .env
```

### 5. Ejecutar la aplicación

```bash
python run.py
```

La API estará disponible en: http://localhost:5000

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario

### Trámites
- `GET /api/tramites/` - Lista de trámites disponibles
- `GET /api/tramites/<id>` - Detalles de un trámite
- `GET /api/tramites/categoria/<categoria>` - Trámites por categoría

### Solicitudes
- `POST /api/solicitudes/` - Crear nueva solicitud
- `GET /api/solicitudes/mis-solicitudes` - Solicitudes del usuario
- `GET /api/solicitudes/<id>` - Detalles de una solicitud

### Documentos
- `POST /api/documentos/subir/<solicitud_id>` - Subir documento

### Machine Learning
- `POST /api/ml/procesar-solicitudes` - Procesar con ML
- `GET /api/ml/estadisticas` - Estadísticas del sistema

## Características Principales

### 🔐 Autenticación y Autorización
- JWT para autenticación
- Roles de usuario: ciudadano, administrativo, supervisor, admin
- Middleware de protección de rutas

### 📊 Gestión de Trámites
- CRUD completo de trámites municipales
- Categorización por tipo (licencias, permisos, servicios, etc.)
- Sistema de requisitos y documentos requeridos

### 📝 Solicitudes de Ciudadanos
- Creación y seguimiento de solicitudes
- Sistema de expedientes únicos
- Estados de tramitación completos
- Asignación automática de fechas límite

### 📎 Gestión de Documentos
- Subida segura de archivos
- Validación de integridad con hash
- Diferentes tipos de documentos
- Control de tamaño y formato

### 🤖 Integración Machine Learning
- Priorización automática de solicitudes
- Scoring de urgencia
- Procesamiento batch de documentos
- Estadísticas y métricas

### 📈 Auditoría y Seguimiento
- Historial completo de cambios de estado
- Trazabilidad de acciones
- Registro de actividades automáticas
- Métricas de rendimiento

## Modelos de Base de Datos

### Usuario
- Información personal y de contacto
- Sistema de roles y permisos
- Control de estado (activo/inactivo)

### Tramite
- Definición de tipos de trámites
- Requisitos y documentos necesarios
- Costos y tiempos estimados

### Solicitud
- Solicitudes específicas de ciudadanos
- Estados de procesamiento
- Integración con ML para priorización

### Documento
- Archivos adjuntos a solicitudes
- Validación y control de integridad
- Resultados de procesamiento ML

### HistorialEstado
- Registro completo de cambios
- Auditoría de acciones
- Trazabilidad temporal

## Tecnologías Utilizadas

- **Flask** - Framework web
- **SQLAlchemy** - ORM para base de datos
- **Flask-JWT-Extended** - Autenticación JWT
- **Flask-CORS** - Soporte para CORS
- **PyMySQL** - Conector MySQL
- **Werkzeug** - Utilidades web
- **Scikit-learn** - Machine Learning
- **Pandas & NumPy** - Análisis de datos

## Desarrollo

### Agregar nuevas rutas
Las rutas están organizadas en blueprints en `app/routes.py`:
- `main_bp` - Rutas principales
- `auth_bp` - Autenticación
- `tramites_bp` - Gestión de trámites
- `solicitudes_bp` - Solicitudes
- `documentos_bp` - Documentos
- `ml_bp` - Machine Learning

### Agregar nuevos modelos
Los modelos están en `app/models.py` usando SQLAlchemy ORM.

### Configuración
Todas las configuraciones están centralizadas en `app/config.py`.

## Próximas Funcionalidades

- [ ] Notificaciones automáticas
- [ ] API de reportes avanzados
- [ ] Integración con sistemas externos
- [ ] Dashboard de administración
- [ ] Sistema de plantillas de documentos
- [ ] API de métricas en tiempo real

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request
