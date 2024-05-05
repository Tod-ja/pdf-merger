from flask import Flask, request, send_file
from flask_cors import CORS 
from PyPDF2 import PdfWriter, PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

app = Flask(__name__)
CORS(app, resources={r"/merge": {"origins": "http://localhost:3000"}})


@app.route('/merge', methods=['POST'])
def merge_files():
    files = request.files.getlist('files')
    labels = request.form.getlist('labels')
    output_pdf = merge_pdfs(files, labels)
    return send_file(
        output_pdf,
        as_attachment=True,
        download_name='Merged.pdf' 
    )

def create_label_pdf(label_text):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Define label size
    label_size = 20
    # Margins
    right_margin = 25
    top_margin = 0

    # X and Y coordinates for the square's bottom-left corner
    label_x = width - label_size - right_margin
    label_y = height - label_size - top_margin

    # Draw a square in the top right corner
    c.rect(label_x, label_y, label_size, label_size, stroke=1, fill=0)

    # Set font size small enough to fit within the label
    c.setFont("Helvetica", 8)

    # Center the text in the square (vertically and horizontally)
    text_width = c.stringWidth(label_text, "Helvetica", 8)
    text_x = label_x + (label_size - text_width) / 2
    text_y = label_y + (label_size - 8) / 2  # Adjusting for roughly the height of the text

    # Draw the label text
    c.drawString(text_x, text_y, label_text)

    # Finish the page and save to the BytesIO buffer
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer



def merge_pdfs(files, labels):
    writer = PdfWriter()
    for file, label in zip(files, labels):
        file_stream = file.stream
        label_pdf_stream = create_label_pdf(label)

        if label_pdf_stream.getbuffer().nbytes == 0:
            raise ValueError("Label PDF is empty")

        reader = PdfReader(file_stream)
        label_pdf = PdfReader(label_pdf_stream)
        label_page = label_pdf.pages[0]

        for page in reader.pages:
            page.merge_page(label_page)
            writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output

if __name__ == '__main__':
    app.run(debug=True)
