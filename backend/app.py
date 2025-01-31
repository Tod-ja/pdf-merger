import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Blueprint
from flask_jwt_extended import JWTManager, jwt_required
from pdf_merger.routes import merge_bp
from pdf_merger.auth import auth_bp
from datetime import timedelta
from flask_cors import CORS
import tempfile
import google.generativeai as genai
from pdf_merger.utils.text_extraction import extract_text_from_pdf, extract_text_from_doc

load_dotenv()

# Create a new blueprint for document interaction
doc_bp = Blueprint('doc_bp', __name__)

@doc_bp.route('/document-interaction', methods=['POST'])
@jwt_required()
def document_interaction():
    if not model:
        return jsonify({'error': 'Gemini API not properly configured'}), 500

    try:
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files provided'}), 400

        # Extract text from all files
        all_text = []
        for file in files:
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                file.save(temp_file.name)
                temp_path = temp_file.name

            try:
                if file.filename.lower().endswith('.pdf'):
                    text = extract_text_from_pdf(temp_path)
                elif file.filename.lower().endswith('.doc') or file.filename.lower().endswith('.docx'):
                    text = extract_text_from_doc(temp_path)
                else:
                    os.unlink(temp_path)
                    return jsonify({'error': 'Unsupported file type'}), 400
                
                all_text.append(text)
            finally:
                # Always try to clean up the temp file
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass  # Ignore errors during cleanup

        # Join all text with newlines
        combined_text = '\n'.join(all_text)

        # Get the user's question
        question = request.form.get('question')
        if not question:
            return jsonify({'error': 'No question provided'}), 400

        # Create the prompt
        prompt = f"Document content:\n{combined_text}\n\nQuestion: {question}\n\nAnswer:"

        # Get response from Gemini
        response = model.generate_content(prompt)
        
        return jsonify({'response': response.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_app():
    app = Flask(__name__)
    
    # In production with nginx, CORS is not needed since everything is on the same domain
    # Only enable CORS for local development
    if os.getenv('FLASK_ENV') == 'development':
        CORS(app, resources={
            r"/api/*": {
                "origins": ["http://localhost:3000"],
                "supports_credentials": True,
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
            }
        })
    
    # Configure JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) 
    JWTManager(app)    

    # Configure Gemini API
    try:
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        global model
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"Error configuring Gemini API: {str(e)}")
        model = None

    # Register blueprints with /api prefix
    app.register_blueprint(merge_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(doc_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
