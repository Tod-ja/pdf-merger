from PyPDF2 import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from io import BytesIO
from zipfile import ZipFile
from PIL import Image
import tempfile
import os

def convert_image_to_pdf(image_stream):
    try:
        image = Image.open(image_stream)

        # Save the image to a temporary file
        temp_image = tempfile.NamedTemporaryFile(delete=False, suffix='.png' if image.format == 'PNG' else '.jpg')
        image.save(temp_image, format=image.format)
        temp_image.close()

        # Create a PDF from the image
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        c = canvas.Canvas(temp_pdf.name, pagesize=image.size)
        c.drawImage(temp_image.name, 0, 0)
        c.showPage()
        c.save()

        # Read the PDF page
        temp_pdf.close()
        page = PdfReader(temp_pdf.name).pages[0]

        # Clean up
        os.remove(temp_image.name)
        os.remove(temp_pdf.name)

        return page
    except Exception as e:
        raise e

def add_label_to_page(page, label_text):
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)
    rotation = page.get('/Rotate', 0)

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(width, height))
    label_size = 60
    margin = 25

    # Determine label position based on rotation
    if rotation == 90:
        c.translate(height, 0)
        c.rotate(90)
        label_x = margin
        label_y = width - label_size - margin
    elif rotation == 180:
        c.translate(width, height)
        c.rotate(180)
        label_x = margin
        label_y = label_size + margin
    elif rotation == 270:
        c.translate(0, width)
        c.rotate(270)
        label_x = width - label_size - margin
        label_y = width - label_size - margin
    else:
        label_x = width - label_size - margin
        label_y = height - label_size - margin

    # Draw the label
    c.setFillColor(colors.transparent)
    c.setStrokeColor(colors.black)
    c.setLineWidth(2)
    c.circle(label_x + label_size / 2, label_y + label_size / 2, label_size / 2, stroke=1, fill=0)
    font_size = label_size / 2
    c.setFont("Helvetica-Bold", font_size)
    c.setFillColor(colors.black)
    text_width = c.stringWidth(label_text, "Helvetica-Bold", font_size)
    text_x = label_x + (label_size / 2) - (text_width / 2)
    text_y = label_y + (label_size / 2) - (font_size / 3)
    c.drawString(text_x, text_y, label_text)
    c.showPage()
    c.save()
    buffer.seek(0)
    label_page = PdfReader(buffer).pages[0]
    page.merge_page(label_page)

def merge_pdfs(files, labels, start_numbers):
    try:
        writer = PdfWriter()
        category_counts = {label: 0 for label in set(labels)}
        category_start_numbers = {label: start_num for label, start_num in zip(labels, start_numbers)}

        for file, label in zip(files, labels):
            file_stream = file.stream
            if file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                file_stream.seek(0)
                page = convert_image_to_pdf(file_stream)
                pages = [page]
            else:
                reader = PdfReader(file_stream)
                pages = reader.pages

            for page_num, page in enumerate(pages):
                if page_num == 0 and category_start_numbers[label] is not None:
                    current_number = category_start_numbers[label] + category_counts[label]
                    label_text = f"{label}{current_number}" if label.strip() else f"{current_number}"
                    category_counts[label] += 1
                    add_label_to_page(page, label_text)
                writer.add_page(page)

        output = BytesIO()
        writer.write(output)
        output.seek(0)
        return output
    except Exception as e:
        raise e

def label_pdfs(files, labels, start_numbers):
    try:
        category_files = {}
        for file, label in zip(files, labels):
            category_files.setdefault(label, []).append(file)

        labeled_files = []

        for label in category_files:
            files_in_category = category_files[label]
            start_number = start_numbers[labels.index(label)]

            for file in files_in_category:
                file_stream = file.stream
                original_filename = file.filename

                if file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    file_stream.seek(0)
                    page = convert_image_to_pdf(file_stream)
                    pages = [page]
                else:
                    reader = PdfReader(file_stream)
                    pages = reader.pages

                writer = PdfWriter()
                for page_num, page in enumerate(pages):
                    if page_num == 0 and start_number is not None:
                        label_text = f"{label}{start_number}" if label.strip() else f"{start_number}"
                        start_number += 1
                        add_label_to_page(page, label_text)
                    writer.add_page(page)

                temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                writer.write(temp_pdf.name)
                temp_pdf.close()
                labeled_files.append((temp_pdf.name, original_filename))

        zip_buffer = BytesIO()
        with ZipFile(zip_buffer, 'w') as z:
            for temp_pdf_path, original_filename in labeled_files:
                z.write(temp_pdf_path, original_filename)
                os.remove(temp_pdf_path)
        zip_buffer.seek(0)
        return zip_buffer
    except Exception as e:
        raise e
