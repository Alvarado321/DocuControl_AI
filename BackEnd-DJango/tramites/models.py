from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from datetime import datetime

class UserProfile(models.Model):
    """Extensión del modelo User de Django para información específica del ciudadano"""
    TIPO_USUARIO_CHOICES = [
        ('ciudadano', 'Ciudadano'),
        ('funcionario', 'Funcionario'),
        ('administrador', 'Administrador'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    dni = models.CharField(max_length=8, unique=True, help_text="Documento Nacional de Identidad")
    telefono = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    tipo_usuario = models.CharField(max_length=20, choices=TIPO_USUARIO_CHOICES, default='ciudadano')
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuario"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_tipo_usuario_display()}"

class TipoTramite(models.Model):
    """Tipos de trámites disponibles en la municipalidad"""
    nombre = models.CharField(max_length=100, help_text="Nombre del tipo de trámite")
    descripcion = models.TextField(blank=True, null=True)
    departamento = models.CharField(max_length=50, help_text="Departamento responsable")
    tiempo_estimado_dias = models.PositiveIntegerField(default=7, help_text="Tiempo estimado en días")
    documentos_requeridos = models.JSONField(default=list, help_text="Lista de documentos requeridos")
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Tipo de Trámite"
        verbose_name_plural = "Tipos de Trámites"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class EstadoTramite(models.Model):
    """Estados posibles de un trámite"""
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    es_final = models.BooleanField(default=False, help_text="Indica si es un estado final")
    orden_proceso = models.PositiveIntegerField(help_text="Orden en el proceso")
    
    class Meta:
        verbose_name = "Estado de Trámite"
        verbose_name_plural = "Estados de Trámites"
        ordering = ['orden_proceso']
    
    def __str__(self):
        return self.nombre

class Tramite(models.Model):
    """Trámite principal con campos ML integrados"""
    numero_expediente = models.CharField(max_length=20, unique=True, editable=False)
    ciudadano = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tramites')
    tipo_tramite = models.ForeignKey(TipoTramite, on_delete=models.PROTECT)
    estado = models.ForeignKey(EstadoTramite, on_delete=models.PROTECT)
    descripcion = models.TextField(blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    
    # Campos de fechas
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_estimada = models.DateField(blank=True, null=True)
    fecha_completado = models.DateTimeField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    # Campos ML
    prioridad_ml = models.PositiveIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Prioridad calculada por ML (1=muy alta, 5=muy baja)"
    )
    riesgo_error = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje de riesgo de error detectado por ML"
    )
    tiempo_estimado_ml = models.PositiveIntegerField(
        blank=True, 
        null=True,
        help_text="Tiempo estimado en días calculado por ML"
    )
    requiere_atencion_urgente = models.BooleanField(default=False)
    
    # Funcionario asignado
    funcionario_asignado = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='tramites_asignados'
    )
    
    class Meta:
        verbose_name = "Trámite"
        verbose_name_plural = "Trámites"
        ordering = ['-fecha_solicitud']
    
    def save(self, *args, **kwargs):
        if not self.numero_expediente:
            year = datetime.now().year
            # Generar número único
            ultimo_numero = Tramite.objects.filter(
                numero_expediente__startswith=f'EXP-{year}-'
            ).count()
            self.numero_expediente = f'EXP-{year}-{str(ultimo_numero + 1).zfill(6)}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.numero_expediente} - {self.tipo_tramite.nombre}"

class Documento(models.Model):
    """Documentos adjuntos con validación ML"""
    tramite = models.ForeignKey(Tramite, on_delete=models.CASCADE, related_name='documentos')
    nombre_archivo = models.CharField(max_length=255)
    nombre_original = models.CharField(max_length=255)
    ruta_archivo = models.FileField(upload_to='documentos/%Y/%m/%d/')
    tamaño_kb = models.PositiveIntegerField(blank=True, null=True)
    tipo_documento = models.CharField(max_length=100, blank=True, null=True)
    
    # Validación ML
    validado_ml = models.BooleanField(default=False)
    confianza_validacion = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    requiere_revision_humana = models.BooleanField(default=True)
    
    fecha_subida = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"
        ordering = ['-fecha_subida']
    
    def __str__(self):
        return f"{self.nombre_original} - {self.tramite.numero_expediente}"

class Notificacion(models.Model):
    """Sistema de notificaciones automatizadas"""
    TIPO_CHOICES = [
        ('estado_cambio', 'Cambio de Estado'),
        ('documento_requerido', 'Documento Requerido'),
        ('alerta_sistema', 'Alerta del Sistema'),
    ]
    
    CANAL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('sistema', 'Sistema'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificaciones')
    tramite = models.ForeignKey(Tramite, on_delete=models.CASCADE, blank=True, null=True)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    
    # Control de envío
    enviado = models.BooleanField(default=False)
    fecha_envio = models.DateTimeField(blank=True, null=True)
    canal = models.CharField(max_length=20, choices=CANAL_CHOICES, default='sistema')
    leido = models.BooleanField(default=False)
    fecha_lectura = models.DateTimeField(blank=True, null=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"

class PrediccionML(models.Model):
    """Logs de predicciones ML para análisis"""
    ALGORITMO_CHOICES = [
        ('prioridad', 'Priorización'),
        ('tiempo_estimado', 'Tiempo Estimado'),
        ('deteccion_errores', 'Detección de Errores'),
        ('validacion_documentos', 'Validación de Documentos'),
    ]
    
    tramite = models.ForeignKey(Tramite, on_delete=models.CASCADE, related_name='predicciones')
    algoritmo = models.CharField(max_length=50, choices=ALGORITMO_CHOICES)
    entrada_datos = models.JSONField(help_text="Datos de entrada del algoritmo")
    prediccion = models.JSONField(help_text="Resultado de la predicción")
    confianza = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    tiempo_procesamiento_ms = models.PositiveIntegerField(blank=True, null=True)
    fecha_prediccion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Predicción ML"
        verbose_name_plural = "Predicciones ML"
        ordering = ['-fecha_prediccion']
    
    def __str__(self):
        return f"{self.get_algoritmo_display()} - {self.tramite.numero_expediente}"

class MetricaSistema(models.Model):
    """Métricas del sistema para análisis de rendimiento"""
    fecha = models.DateField(unique=True)
    tramites_creados = models.PositiveIntegerField(default=0)
    tramites_completados = models.PositiveIntegerField(default=0)
    tiempo_promedio_resolucion = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        help_text="Tiempo promedio en días"
    )
    precision_ml_prioridad = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True
    )
    precision_ml_tiempo = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True
    )
    satisfaccion_ciudadano = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Escala 1-5"
    )
    
    class Meta:
        verbose_name = "Métrica del Sistema"
        verbose_name_plural = "Métricas del Sistema"
        ordering = ['-fecha']
    
    def __str__(self):
        return f"Métricas {self.fecha}"
