from flask import Flask, request, send_file, jsonify
from flask_cors import CORS 
from PyPDF2 import PdfWriter, PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from io import BytesIO

app = Flask(__name__)
CORS(app, resources={r"/merge": {"origins": "http://localhost:3000"}})


@app.route('/merge', methods=['POST'])
def merge_files():
    try:
        files = request.files.getlist('files')
        labels = request.form.getlist('labels')
        print('Received files:', files) # Debugging: Log received files
        print('Received labels:', labels) # Debugging: Log received labels

        if not files or not labels:
            return jsonify({"error": "No files or labels provided"}), 400
        output_pdf = merge_pdfs(files, labels)
        return send_file(
            output_pdf,
            as_attachment=True,
            download_name='Merged.pdf'
        )
    except Exception as e:
        print('Error:', str(e)) # Debugging: Log any exceptions
        return jsonify({"error": str(e)}), 500


def merge_pdfs(files, labels):
    writer = PdfWriter()
    
    for file, label in zip(files, labels):
        file_stream = file.stream
        reader = PdfReader(file_stream)
        
        for page_num, page in enumerate(reader.pages):
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            
            # Create a canvas for drawing the label
            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=(width, height))
            
            # Define label size 
            label_size = 60
            
            # Margins
            right_margin = 25
            top_margin = 20
            
            # X and Y coordinates for the circle's center
            label_x = width - label_size // 2 - right_margin
            label_y = height - label_size // 2 - top_margin
            
            # Set fill color to transparent
            c.setFillColor(colors.transparent)
            
            # Set stroke color to black
            c.setStrokeColor(colors.black)
            
            # Set line width for the circle
            c.setLineWidth(2)
            
            # Draw a circle in the top right corner
            c.circle(label_x, label_y, label_size // 2, stroke=1, fill=0)
            
            # Set font size proportional to the label size
            font_size = label_size // 2
            
            # Set font to bold and black
            c.setFont("Helvetica-Bold", font_size)
            c.setFillColor(colors.black)
            
            # Center the text in the circle (vertically and horizontally)
            text_width = c.stringWidth(label, "Helvetica-Bold", font_size)
            text_x = label_x - text_width // 2
            text_y = label_y - font_size // 3
            
            # Draw the label text
            c.drawString(text_x, text_y, label)
            
            # Finish the page and save to the BytesIO buffer
            c.showPage()
            c.save()
            
            # Move to the beginning of the buffer
            buffer.seek(0)
            
            # Create a new PDF page from the canvas buffer
            label_page = PdfReader(buffer).pages[0]
            
            # Overlay the label page on top of the original page
            page.merge_page(label_page)
            
            # Add the modified page to the writer
            writer.add_page(page)
    
    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output

if __name__ == '__main__':
    app.run(debug=True)
