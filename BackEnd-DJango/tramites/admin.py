from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    UserProfile, TipoTramite, EstadoTramite, Tramite, 
    Documento, Notificacion, PrediccionML, MetricaSistema
)

# Inline para UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil'

# Extender UserAdmin
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_tipo_usuario', 'is_staff')
    list_filter = BaseUserAdmin.list_filter + ('profile__tipo_usuario',)
    
    def get_tipo_usuario(self, obj):
        return obj.profile.get_tipo_usuario_display() if hasattr(obj, 'profile') else 'Sin perfil'
    get_tipo_usuario.short_description = 'Tipo Usuario'

# Re-registrar UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(TipoTramite)
class TipoTramiteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'departamento', 'tiempo_estimado_dias', 'activo')
    list_filter = ('departamento', 'activo')
    search_fields = ('nombre', 'descripcion')
    ordering = ('nombre',)

@admin.register(EstadoTramite)
class EstadoTramiteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'orden_proceso', 'es_final')
    list_filter = ('es_final',)
    ordering = ('orden_proceso',)

@admin.register(Tramite)
class TramiteAdmin(admin.ModelAdmin):
    list_display = (
        'numero_expediente', 'ciudadano', 'tipo_tramite', 'estado', 
        'prioridad_ml', 'fecha_solicitud', 'requiere_atencion_urgente'
    )
    list_filter = (
        'estado', 'tipo_tramite', 'prioridad_ml', 
        'requiere_atencion_urgente', 'fecha_solicitud'
    )
    search_fields = ('numero_expediente', 'ciudadano__username', 'ciudadano__email')
    readonly_fields = ('numero_expediente', 'fecha_solicitud', 'fecha_actualizacion')
    ordering = ('-fecha_solicitud',)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero_expediente', 'ciudadano', 'tipo_tramite', 'estado', 'funcionario_asignado')
        }),
        ('Detalles', {
            'fields': ('descripcion', 'observaciones')
        }),
        ('Fechas', {
            'fields': ('fecha_solicitud', 'fecha_estimada', 'fecha_completado', 'fecha_actualizacion')
        }),
        ('Machine Learning', {
            'fields': ('prioridad_ml', 'riesgo_error', 'tiempo_estimado_ml', 'requiere_atencion_urgente'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = (
        'nombre_original', 'tramite', 'tipo_documento', 
        'validado_ml', 'confianza_validacion', 'fecha_subida'
    )
    list_filter = ('validado_ml', 'requiere_revision_humana', 'tipo_documento')
    search_fields = ('nombre_original', 'tramite__numero_expediente')
    readonly_fields = ('fecha_subida', 'tamaño_kb')
    ordering = ('-fecha_subida',)

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'usuario', 'tipo', 'canal', 'enviado', 'leido', 'fecha_creacion')
    list_filter = ('tipo', 'canal', 'enviado', 'leido')
    search_fields = ('titulo', 'usuario__username', 'mensaje')
    readonly_fields = ('fecha_creacion',)
    ordering = ('-fecha_creacion',)

@admin.register(PrediccionML)
class PrediccionMLAdmin(admin.ModelAdmin):
    list_display = ('tramite', 'algoritmo', 'confianza', 'tiempo_procesamiento_ms', 'fecha_prediccion')
    list_filter = ('algoritmo', 'fecha_prediccion')
    search_fields = ('tramite__numero_expediente',)
    readonly_fields = ('fecha_prediccion',)
    ordering = ('-fecha_prediccion',)

@admin.register(MetricaSistema)
class MetricaSistemaAdmin(admin.ModelAdmin):
    list_display = (
        'fecha', 'tramites_creados', 'tramites_completados', 
        'tiempo_promedio_resolucion', 'satisfaccion_ciudadano'
    )
    ordering = ('-fecha',)
    readonly_fields = ('fecha',)

# Personalizar el admin site
admin.site.site_header = "DocuControl AI - Administración"
admin.site.site_title = "DocuControl AI"
admin.site.index_title = "Sistema de Gestión Municipal"
