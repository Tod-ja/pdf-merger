# backend/app.py

import os
from flask import Flask
from flask_cors import CORS
from pdf_merger.routes import merge_bp

def create_app():
    app = Flask(__name__)
    frontend_origin = os.environ.get('FRONTEND_URL', 'http://localhost')
    CORS(app, resources={r"/*": {"origins": frontend_origin}})
    app.register_blueprint(merge_bp)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
