from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import config
import os

# Inicializar extensiones
db = SQLAlchemy()
cors = CORS()
jwt = JWTManager()

def create_app(config_name=None):
    """Factory function para crear la aplicación Flask"""
    
    app = Flask(__name__)
    
    # Determinar configuración
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    # Cargar configuración
    app.config.from_object(config[config_name])
    
    # Inicializar extensiones con la app
    db.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    jwt.init_app(app)
    
    # Crear directorio de uploads si no existe
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Registrar blueprints/rutas
    from app.routes import main_bp, auth_bp, tramites_bp, solicitudes_bp, documentos_bp, ml_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tramites_bp, url_prefix='/api/tramites')
    app.register_blueprint(solicitudes_bp, url_prefix='/api/solicitudes')
    app.register_blueprint(documentos_bp, url_prefix='/api/documentos')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    
    # Importar modelos para que SQLAlchemy los reconozca
    from app import models
    
    # Crear tablas si no existen (solo en desarrollo)
    with app.app_context():
        if config_name == 'development':
            db.create_all()
    
    return app
