from app import create_app
import os

# Crear la aplicación Flask
app = create_app()

if __name__ == '__main__':
    # Configuración para desarrollo
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True
    )
