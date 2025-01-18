import os
from dotenv import load_dotenv
from flask import Flask
from flask_jwt_extended import JWTManager
from pdf_merger.routes import merge_bp
from pdf_merger.auth import auth_bp
from datetime import timedelta

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) 

    # Initialize JWT
    JWTManager(app)    

    # Register blueprints
    app.register_blueprint(merge_bp)
    app.register_blueprint(auth_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
