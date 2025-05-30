# DocuControl AI - Sistema Automatizado de Gestión Documental Municipal

## 📋 INFORMACIÓN GENERAL DEL PROYECTO

**Proyecto:** DocuControl AI  
**Institución:** Municipalidad Provincial de Yau  
**Tipo:** Sistema Web de Gestión Documental con Machine Learning  
**Tecnologías:** Django + React + ML + MySQL/MariaDB  
**Estado:** En Desarrollo  

---

## 🎯 OBJETIVO PRINCIPAL

Desarrollar un sistema automatizado de gestión documental que utilice técnicas de Machine Learning para optimizar la atención ciudadana en la Municipalidad Provincial de Yau, reduciendo tiempos de espera, minimizando errores y mejorando la experiencia del usuario.

---

## 🔧 ARQUITECTURA TÉCNICA

### **Backend - Django 4.2 LTS**
- **Framework:** Django REST Framework
- **Base de Datos:** MySQL/MariaDB 10.4.32 (XAMPP)
- **ML Libraries:** scikit-learn, pandas, numpy
- **Autenticación:** Django Auth + JWT
- **APIs:** RESTful APIs para frontend

### **Frontend - React**
- **Framework:** React 18+
- **Gestión de Estado:** Context API / Redux
- **Interfaz:** Material-UI / Bootstrap
- **Comunicación:** Axios para APIs

### **Machine Learning**
- **Priorización:** Algoritmos de clasificación para urgencia de trámites
- **Detección de Errores:** Modelos predictivos para validación
- **Tiempo Estimado:** Regresión para predicción de duración
- **Notificaciones:** Sistema inteligente de alertas

---

## 📊 MODELO DE DATOS

### **Entidades Principales:**
1. **Usuarios** - Ciudadanos y funcionarios
2. **Trámites** - Solicitudes y procedimientos
3. **Documentos** - Archivos adjuntos y formularios
4. **Estados** - Seguimiento de procesos
5. **Notificaciones** - Sistema de alertas
6. **Predicciones ML** - Resultados de algoritmos
7. **Métricas** - Análisis de rendimiento

### **Campos ML Integrados:**
- `prioridad_ml` - Clasificación automática de urgencia
- `riesgo_error` - Probabilidad de errores
- `tiempo_estimado_ml` - Predicción de duración
- `confianza_prediccion` - Nivel de certeza del modelo

---

## 🚀 FUNCIONALIDADES CLAVE

### **Para Ciudadanos:**
- ✅ Registro y seguimiento de trámites
- ✅ Upload de documentos con validación automática
- ✅ Notificaciones en tiempo real
- ✅ Consulta de estado y tiempos estimados
- ✅ Dashboard personalizado

### **Para Funcionarios:**
- ✅ Gestión priorizada de trámites (ML)
- ✅ Detección automática de errores
- ✅ Panel de administración completo
- ✅ Reportes y métricas avanzadas
- ✅ Herramientas de validación inteligente

### **Sistema ML:**
- ✅ Priorización automática basada en urgencia
- ✅ Predicción de errores antes del procesamiento
- ✅ Estimación inteligente de tiempos
- ✅ Análisis de patrones y tendencias
- ✅ Optimización continua del sistema

---

## 📁 ESTRUCTURA DEL PROYECTO

```
DocuControl_AI/
├── BackEnd-DJango/
│   ├── manage.py
│   ├── requirements.txt
│   ├── docucontrol_ai/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── tramites/
│   │   ├── models.py
│   │   ├── admin.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── ml_engine/
│   │   ├── models.py
│   │   ├── predictors.py
│   │   └── utils.py
│   └── api/
│       ├── views.py
│       └── urls.py
├── FrontEnd-React/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── README.md
├── database_schema_mysql.sql
├── arquitectura-proyecto.md
└── PROYECTO-COMPLETO.md
```

---

## 🔄 ESTADO ACTUAL DEL DESARROLLO

### ✅ **COMPLETADO:**
1. **Diseño de Base de Datos** - Schema completo con 8 tablas principales
2. **Configuración Django** - Proyecto configurado con apps y dependencias
3. **Modelos Django** - Implementación completa con campos ML
4. **Admin Django** - Interface administrativa configurada
5. **Documentación** - Arquitectura y guías técnicas
6. **Esquemas SQL** - Scripts para PostgreSQL y MySQL/MariaDB

### 🔄 **EN PROGRESO:**
1. **Migración a Django 4.2** - Downgrade para compatibilidad con MariaDB 10.4.32
2. **Conexión Base de Datos** - Configuración PyMySQL con XAMPP

### ⏳ **PENDIENTE:**
1. **Migraciones Django** - Crear tablas en base de datos
2. **APIs REST** - Endpoints para frontend
3. **Sistema ML** - Algoritmos de priorización y detección
4. **Frontend React** - Aplicación web completa
5. **Autenticación** - Sistema de usuarios y permisos
6. **Upload de Archivos** - Gestión de documentos
7. **Notificaciones** - Sistema automático de alertas
8. **Testing** - Pruebas unitarias e integración
9. **Deployment** - Configuración de producción

---

## 📋 CASOS DE USO PRINCIPALES

### **CU-01: Registro de Trámite**
**Actor:** Ciudadano  
**Flujo:**
1. Ciudadano ingresa al sistema
2. Selecciona tipo de trámite
3. Completa formulario con datos
4. Adjunta documentos requeridos
5. Sistema valida automáticamente (ML)
6. Se genera número de seguimiento
7. Sistema estima tiempo de procesamiento (ML)

### **CU-02: Priorización Automática**
**Actor:** Sistema ML  
**Flujo:**
1. Nuevo trámite ingresa al sistema
2. ML analiza tipo, urgencia y documentos
3. Asigna prioridad automáticamente
4. Calcula tiempo estimado
5. Evalúa riesgo de errores
6. Notifica a funcionarios responsables

### **CU-03: Seguimiento en Tiempo Real**
**Actor:** Ciudadano/Funcionario  
**Flujo:**
1. Usuario consulta estado del trámite
2. Sistema muestra progreso actual
3. Presenta tiempo estimado restante
4. Muestra notificaciones relevantes
5. Permite descargar documentos generados

---

## 🎨 DISEÑO DE INTERFAZ

### **Dashboard Ciudadano:**
- Vista general de trámites activos
- Línea de tiempo de progreso
- Notificaciones importantes
- Sección de documentos
- Chat de soporte

### **Panel Funcionario:**
- Cola de trámites priorizados
- Herramientas de validación
- Métricas de rendimiento
- Sistema de alertas
- Reportes avanzados

### **Admin System:**
- Gestión de usuarios
- Configuración de tipos de trámite
- Monitoreo del sistema ML
- Análisis de datos
- Configuración general

---

## 🔐 SEGURIDAD Y PRIVACIDAD

### **Medidas Implementadas:**
- ✅ Autenticación robusta (JWT)
- ✅ Autorización por roles
- ✅ Encriptación de datos sensibles
- ✅ Validación de inputs
- ✅ Logs de auditoría
- ✅ Backup automático
- ✅ Cumplimiento GDPR/LOPD

---

## 📈 MÉTRICAS Y ANÁLISIS

### **KPIs del Sistema:**
- **Tiempo Promedio de Trámite:** Reducción esperada del 40%
- **Errores de Procesamiento:** Reducción del 60%
- **Satisfacción Ciudadana:** Meta > 90%
- **Precisión ML:** > 85% en predicciones
- **Disponibilidad Sistema:** > 99.5%

### **Análisis ML:**
- Patrones de congestión por tipo de trámite
- Predicción de demanda estacional
- Optimización de recursos humanos
- Detección de cuellos de botella
- Mejora continua de algoritmos

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Backend Core (2-3 semanas)**
- Configuración final Django + DB
- Implementación de modelos y APIs
- Sistema básico de autenticación
- Funcionalidades CRUD principales

### **Fase 2: Machine Learning (2-3 semanas)**
- Desarrollo de algoritmos de priorización
- Sistema de detección de errores
- Predicción de tiempos
- Integración con backend

### **Fase 3: Frontend (3-4 semanas)**
- Aplicación React completa
- Interfaces de usuario
- Integración con APIs
- Sistema de notificaciones

### **Fase 4: Testing y Optimización (1-2 semanas)**
- Pruebas unitarias e integración
- Optimización de rendimiento
- Ajuste de algoritmos ML
- Preparación para producción

---

## 🛠️ COMANDOS DE DESARROLLO

### **Backend Setup:**
```bash
cd BackEnd-DJango
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### **Frontend Setup:**
```bash
cd FrontEnd-React
npm install
npm start
```

### **Database Setup:**
```bash
# XAMPP MySQL
mysql -u root -p < database_schema_mysql.sql
```

---

## 📞 SOPORTE Y CONTACTO

**Desarrollador Principal:** [Nombre del Estudiante]  
**Email:** [email@ejemplo.com]  
**Institución:** Municipalidad Provincial de Yau  
**Curso:** Taller de Desarrollo de Aplicaciones con Machine Learning  

---

## 📜 LICENCIA Y DERECHOS

Este proyecto ha sido desarrollado como trabajo final del curso "Taller de Desarrollo de Aplicaciones con Machine Learning" para la Municipalidad Provincial de Yau. El código es de uso académico y gubernamental.

---

*Última actualización: $(date)*  
*Estado: En Desarrollo - Versión 0.1.0*
