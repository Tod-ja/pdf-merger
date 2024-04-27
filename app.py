from flask import Flask, request, send_file
from PyPDF2 import PdfWriter, PdfReader
from werkzeug.utils import secure_filename
from io import BytesIO
import os

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_files():
    files = request.files.getlist('file[]')
    output_pdf = merge_pdfs(files)
    memory_file = BytesIO()
    output_pdf.write(memory_file)
    memory_file.seek(0)
    return send_file(memory_file, attachment_filename='Merged.pdf', as_attachment=True)

def merge_pdfs(files):
    writer = PdfWriter()
    for file in files:
        filename = secure_filename(file.filename)
        file.save(os.path.join('/tmp', filename))  # save temporarily
        reader = PdfReader(open(os.path.join('/tmp', filename), 'rb'))
        for page in reader.pages:
            writer.add_page(page)
    return writer

if __name__ == '__main__':
    app.run(debug=True, port=5000)
