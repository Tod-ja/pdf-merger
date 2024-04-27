from flask import Flask, request, send_file
from PyPDF2 import PdfWriter, PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import os

app = Flask(__name__)

@app.route('/merge', methods=['POST'])
def merge_files():
    files = request.files.getlist('files')
    labels = request.form.getlist('labels')
    output_pdf = merge_pdfs(files, labels)
    memory_file = BytesIO()
    output_pdf.write(memory_file)
    memory_file.seek(0)
    return send_file(memory_file, attachment_filename='Merged.pdf', as_attachment=True)

def merge_pdfs(files, labels):
    writer = PdfWriter()
    for file, label in zip(files, labels):
        reader = PdfReader(file.stream)
        label_pdf = PdfReader(create_label_pdf(label))
        label_page = label_pdf.pages[0]
        
        for page in reader.pages:
            page.merge_page(label_page)
            writer.add_page(page)
    
    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output

def create_label_pdf(label_text):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    c.setFont("Helvetica", 12)
    c.drawString(width - 100, height - 30, label_text)  # Position top-right
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

if __name__ == '__main__':
    app.run(debug=True)
