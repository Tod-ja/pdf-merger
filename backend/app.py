import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required
from pdf_merger.routes import merge_bp
from pdf_merger.auth import auth_bp
from datetime import timedelta
from flask_cors import CORS
import tempfile
import google.generativeai as genai
from pdf_merger.utils.text_extraction import extract_text_from_pdf, extract_text_from_doc

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # In production with nginx, CORS is not needed since everything is on the same domain
    # Only enable CORS for local development
    if os.getenv('FLASK_ENV') == 'development':
        CORS(app)
    
    # Configure JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) 
    JWTManager(app)    

    # Configure Gemini API
    try:
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"Error configuring Gemini API: {str(e)}")
        model = None

    # Register blueprints
    app.register_blueprint(merge_bp)
    app.register_blueprint(auth_bp, url_prefix='/api')

    @app.route('/api/document-interaction', methods=['POST'])
    @jwt_required()
    def document_interaction():
        if not model:
            return jsonify({'error': 'Gemini API not properly configured'}), 500

        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('files')
        query = request.form.get('query')

        if not files or not query:
            return jsonify({'error': 'Both files and query are required'}), 400

        try:
            # Process each file and extract text
            all_text = []
            for file in files:
                if file.filename == '':
                    continue

                # Create a temporary file to store the uploaded file
                temp_file = tempfile.NamedTemporaryFile(delete=False)
                file.save(temp_file.name)

                try:
                    # Extract text based on file type
                    file_extension = os.path.splitext(file.filename)[1].lower()
                    
                    if file_extension == '.pdf':
                        text = extract_text_from_pdf(temp_file.name)
                    elif file_extension in ['.doc', '.docx']:
                        text = extract_text_from_doc(temp_file.name)
                    elif file_extension == '.txt':
                        with open(temp_file.name, 'r', encoding='utf-8') as f:
                            text = f.read()
                    else:
                        continue

                    if text:  # Only add if we got some text
                        all_text.append(f"Content from {file.filename}:\n{text}\n")
                except Exception as e:
                    print(f"Error processing file {file.filename}: {str(e)}")
                finally:
                    # Always clean up the temp file
                    try:
                        os.unlink(temp_file.name)
                    except:
                        pass

            if not all_text:
                return jsonify({'error': 'No valid text could be extracted from the provided files'}), 400

            # Combine all text and prepare the prompt
            combined_text = "\n\n".join(all_text)
            
            # Prepare the prompt for Gemini
            prompt = f"""Please analyze the following documents and answer the user's question.
            
Documents:
{combined_text}

User's Question: {query}

Please provide a clear, well-structured, and comprehensive response based on the content of these documents."""

            # Call Gemini API
            try:
                response = model.generate_content(prompt)
                if not response:
                    return jsonify({'error': 'No response generated from Gemini API'}), 500
                return jsonify({'response': response.text})
            except Exception as e:
                print(f"Gemini API Error: {str(e)}")
                return jsonify({'error': 'Error generating response from Gemini API'}), 500

        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({'error': 'An error occurred while processing the request'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
