import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pdf_merger.routes import merge_bp
from pdf_merger.auth import auth_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # Initialize JWT and CORS
    JWTManager(app)
    frontend_origin = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    CORS(app, resources={r"/*": {"origins": frontend_origin}})
    
    # Initialize JWT
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(merge_bp)
    app.register_blueprint(auth_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
