import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from datetime import datetime, timedelta
import json

class SolicitudMLProcessor:
    """Procesador de Machine Learning para solicitudes"""
    
    def __init__(self):
        self.priority_model = None
        self.label_encoders = {}
        self.is_trained = False
    
    def prepare_features(self, solicitudes_data):
        """Preparar características para el modelo ML"""
        features = []
        
        for solicitud in solicitudes_data:
            # Características básicas
            dias_desde_solicitud = (datetime.now() - solicitud['fecha_solicitud']).days
            dias_hasta_limite = (solicitud['fecha_limite'] - datetime.now()).days if solicitud['fecha_limite'] else 30
            
            # Características del trámite
            categoria_tramite = solicitud['tramite']['categoria']
            costo_tramite = float(solicitud['tramite']['costo'])
            tiempo_estimado = solicitud['tramite']['tiempo_estimado_dias']
            
            # Características del usuario
            rol_usuario = solicitud['usuario']['rol']
            
            # Conteo de documentos
            num_documentos = len(solicitud.get('documentos', []))
            
            features.append({
                'dias_desde_solicitud': dias_desde_solicitud,
                'dias_hasta_limite': dias_hasta_limite,
                'categoria_tramite': categoria_tramite,
                'costo_tramite': costo_tramite,
                'tiempo_estimado': tiempo_estimado,
                'rol_usuario': rol_usuario,
                'num_documentos': num_documentos,
                'urgencia_score': max(0, 10 - dias_hasta_limite) if dias_hasta_limite > 0 else 10
            })
        
        return pd.DataFrame(features)
    
    def encode_categorical_features(self, df):
        """Codificar características categóricas"""
        categorical_columns = ['categoria_tramite', 'rol_usuario']
        
        for column in categorical_columns:
            if column not in self.label_encoders:
                self.label_encoders[column] = LabelEncoder()
                df[column + '_encoded'] = self.label_encoders[column].fit_transform(df[column])
            else:
                # Para nuevas categorías no vistas, asignar valor por defecto
                unique_values = df[column].unique()
                known_values = self.label_encoders[column].classes_
                
                # Manejar valores nuevos
                for value in unique_values:
                    if value not in known_values:
                        # Asignar a la categoría más común
                        df.loc[df[column] == value, column] = known_values[0]
                
                df[column + '_encoded'] = self.label_encoders[column].transform(df[column])
        
        return df
    
    def calculate_priority_score(self, features_df):
        """Calcular puntuación de prioridad basada en reglas de negocio"""
        scores = []
        
        for _, row in features_df.iterrows():
            score = 0
            
            # Peso por urgencia temporal
            if row['dias_hasta_limite'] <= 3:
                score += 40  # Muy urgente
            elif row['dias_hasta_limite'] <= 7:
                score += 30  # Urgente
            elif row['dias_hasta_limite'] <= 15:
                score += 20  # Normal
            else:
                score += 10  # Baja prioridad
            
            # Peso por categoría de trámite
            if row['categoria_tramite'] == 'licencias':
                score += 25
            elif row['categoria_tramite'] == 'permisos':
                score += 20
            elif row['categoria_tramite'] == 'certificados':
                score += 15
            else:
                score += 10
            
            # Peso por costo (trámites más costosos tienen mayor prioridad)
            if row['costo_tramite'] > 500:
                score += 15
            elif row['costo_tramite'] > 100:
                score += 10
            else:
                score += 5
            
            # Peso por documentación completa
            if row['num_documentos'] >= 3:
                score += 10
            elif row['num_documentos'] >= 1:
                score += 5
            
            # Normalizar score entre 0-100
            score = min(100, max(0, score))
            scores.append(score)
        
        return scores
    
    def assign_priority_level(self, score):
        """Asignar nivel de prioridad basado en la puntuación"""
        if score >= 80:
            return 'critica'
        elif score >= 60:
            return 'alta'
        elif score >= 40:
            return 'media'
        else:
            return 'baja'
    
    def process_solicitudes(self, solicitudes_data):
        """Procesar solicitudes con ML y reglas de negocio"""
        if not solicitudes_data:
            return []
        
        # Preparar características
        features_df = self.prepare_features(solicitudes_data)
        
        # Codificar características categóricas
        features_df = self.encode_categorical_features(features_df)
        
        # Calcular puntuaciones de prioridad
        priority_scores = self.calculate_priority_score(features_df)
        
        # Asignar niveles de prioridad
        results = []
        for i, (solicitud, score) in enumerate(zip(solicitudes_data, priority_scores)):
            priority_level = self.assign_priority_level(score)
            
            results.append({
                'solicitud_id': solicitud['id'],
                'puntuacion_ml': round(score, 2),
                'prioridad_ml': priority_level,
                'factores': {
                    'urgencia_temporal': features_df.iloc[i]['urgencia_score'],
                    'categoria_tramite': features_df.iloc[i]['categoria_tramite'],
                    'costo_tramite': features_df.iloc[i]['costo_tramite'],
                    'documentos_completos': features_df.iloc[i]['num_documentos']
                }
            })
        
        return results

class DocumentMLProcessor:
    """Procesador de ML para análisis de documentos"""
    
    def __init__(self):
        self.document_types = [
            'DNI', 'RUC', 'recibo_servicios', 'plano_ubicacion',
            'certificado_compatibilidad', 'planos_arquitectonicos',
            'memoria_descriptiva', 'estudio_suelos', 'declaracion_jurada'
        ]
    
    def analyze_document(self, document_info):
        """Analizar documento y detectar tipo automáticamente"""
        filename = document_info.get('nombre_original', '').lower()
        
        # Análisis básico por nombre de archivo
        detected_type = 'general'
        confidence = 0.5
        
        # Reglas simples de detección
        if 'dni' in filename:
            detected_type = 'DNI'
            confidence = 0.9
        elif 'ruc' in filename:
            detected_type = 'RUC'
            confidence = 0.9
        elif 'recibo' in filename or 'servicio' in filename:
            detected_type = 'recibo_servicios'
            confidence = 0.8
        elif 'plano' in filename:
            if 'arquitect' in filename:
                detected_type = 'planos_arquitectonicos'
            else:
                detected_type = 'plano_ubicacion'
            confidence = 0.8
        elif 'certificado' in filename:
            detected_type = 'certificado_compatibilidad'
            confidence = 0.7
        elif 'memoria' in filename:
            detected_type = 'memoria_descriptiva'
            confidence = 0.8
        elif 'estudio' in filename and 'suelo' in filename:
            detected_type = 'estudio_suelos'
            confidence = 0.8
        elif 'declaracion' in filename:
            detected_type = 'declaracion_jurada'
            confidence = 0.8
        
        # Validación por tamaño y tipo MIME
        size_mb = document_info.get('tamano_bytes', 0) / (1024 * 1024)
        mime_type = document_info.get('tipo_mime', '')
        
        validation_score = 0.5
        issues = []
        
        # Validar tamaño
        if size_mb > 10:
            issues.append('Archivo muy grande (>10MB)')
            validation_score -= 0.2
        elif size_mb < 0.01:
            issues.append('Archivo muy pequeño (<10KB)')
            validation_score -= 0.1
        else:
            validation_score += 0.2
        
        # Validar tipo MIME
        if mime_type.startswith('image/'):
            validation_score += 0.2
        elif mime_type == 'application/pdf':
            validation_score += 0.3
        elif mime_type.startswith('application/'):
            validation_score += 0.1
        else:
            issues.append(f'Tipo de archivo no recomendado: {mime_type}')
        
        # Estado final
        if validation_score >= 0.7 and not issues:
            estado_sugerido = 'valido'
        elif validation_score >= 0.5:
            estado_sugerido = 'pendiente'
        else:
            estado_sugerido = 'observado'
        
        return {
            'tipo_detectado': detected_type,
            'confianza_deteccion': round(confidence, 2),
            'puntuacion_validacion': round(validation_score, 2),
            'estado_sugerido': estado_sugerido,
            'problemas_detectados': issues,
            'metadatos': {
                'tamaño_mb': round(size_mb, 2),
                'tipo_mime': mime_type,
                'procesado_en': datetime.now().isoformat()
            }
        }

# Instancias globales de los procesadores
solicitud_processor = SolicitudMLProcessor()
document_processor = DocumentMLProcessor()
