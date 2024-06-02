from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PyPDF2 import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from PIL import Image
import tempfile
import os

app = Flask(__name__)
CORS(app, resources={r"/merge": {"origins": "http://localhost:3000"}})

@app.route('/merge', methods=['POST'])
def merge_files():
    try:
        files = request.files.getlist('files')
        labels = request.form.getlist('labels')
        start_numbers = request.form.getlist('start_numbers')

        if not files or not labels or not start_numbers:
            return jsonify({"error": "Files, labels or start numbers are missing"}), 400

        start_numbers = [int(num) for num in start_numbers] 
        output_pdf = merge_pdfs(files, labels, start_numbers)
        return send_file(
            output_pdf,
            as_attachment=True,
            download_name='Merged.pdf'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def convert_image_to_pdf(image_stream):
    try:
        image = Image.open(image_stream)

        # Create a temporary file to hold the image
        temp_image = tempfile.NamedTemporaryFile(delete=False, suffix='.png' if image.format == 'PNG' else '.jpg')
        image.save(temp_image, format=image.format)
        temp_image.close()

        # Create a temporary file to hold the PDF data
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        c = canvas.Canvas(temp_pdf.name, pagesize=A4)

        # Get image dimensions
        img_width, img_height = image.size

        # Calculate dimensions to maintain aspect ratio
        max_width, max_height = A4
        aspect = img_width / img_height
        if img_width > img_height:
            width = min(max_width, img_width)
            height = width / aspect
        else:
            height = min(max_height, img_height)
            width = height * aspect

        # Center the image
        x_offset = (max_width - width) / 2
        y_offset = (max_height - height) / 2

        # Draw the image on the canvas
        c.drawImage(temp_image.name, x_offset, y_offset, width, height)
        c.showPage()
        c.save()

        # Close the temporary file and reopen it for reading
        temp_pdf.close()
        temp_pdf_path = temp_pdf.name

        # Read the PDF page from the temporary file
        page = PdfReader(temp_pdf_path).pages[0]

        # Clean up temporary files
        os.remove(temp_image.name)
        os.remove(temp_pdf_path)

        return page
    except Exception as e:
        raise

def merge_pdfs(files, labels, start_numbers):
    try:
        writer = PdfWriter()
        category_files_count = {label: 0 for label in labels}
        category_start_numbers = {label: start_num for label, start_num in zip(labels, start_numbers)}
        
        for file, label in zip(files, labels):
            file_stream = file.stream
            if file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                # Ensure the file stream is read correctly
                file_stream.seek(0)
                page = convert_image_to_pdf(file_stream)
                pages = [page]
            else:
                reader = PdfReader(file_stream)
                pages = reader.pages
            
            for page_num, page in enumerate(pages):
                if page_num == 0:
                    current_number = category_start_numbers[label] + category_files_count[label]
                    label_with_number = f"{label}{current_number}" if label != " " else f"{current_number}"
                    category_files_count[label] += 1
                    
                    width = float(page.mediabox.width)
                    height = float(page.mediabox.height)
                    
                    rotation = page.get('/Rotate', 0)

                    buffer = BytesIO()
                    c = canvas.Canvas(buffer, pagesize=(width, height))
                    label_size = 60
                    right_margin = 25
                    top_margin = 20

                    if rotation == 90:
                        c.translate(height, 0)
                        c.rotate(90)
                        label_x = right_margin
                        label_y = width - label_size - top_margin
                    elif rotation == 180:
                        c.translate(width, height)
                        c.rotate(180)
                        label_x = width - label_size - right_margin
                        label_y = top_margin
                    elif rotation == 270:
                        c.translate(0, width)
                        c.rotate(270)
                        label_x = right_margin
                        label_y = height - label_size - top_margin
                    else:
                        label_x = width - label_size - right_margin
                        label_y = height - label_size - top_margin

                    c.setFillColor(colors.transparent)
                    c.setStrokeColor(colors.black)
                    c.setLineWidth(2)
                    c.circle(label_x + label_size // 2, label_y + label_size // 2, label_size // 2, stroke=1, fill=0)
                    font_size = label_size // 2
                    c.setFont("Helvetica-Bold", font_size)
                    c.setFillColor(colors.black)
                    text_width = c.stringWidth(label_with_number, "Helvetica-Bold", font_size)
                    text_x = label_x + (label_size // 2) - (text_width // 2)
                    text_y = label_y + (label_size // 2) - (font_size // 3)
                    c.drawString(text_x, text_y, label_with_number)
                    c.showPage()
                    c.save()
                    buffer.seek(0)
                    label_page = PdfReader(buffer).pages[0]
                    page.merge_page(label_page)

                writer.add_page(page)

        output = BytesIO()
        writer.write(output)
        output.seek(0)
        return output
    except Exception as e:
        raise

if __name__ == '__main__':
    app.run(debug=True)
