from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required
from pdf_merger.services.file_processing import merge_pdfs, label_pdfs
from pdf_merger.auth import conditional_jwt_required

merge_bp = Blueprint('merge_bp', __name__)

@merge_bp.route('/merge', methods=['POST'])
@conditional_jwt_required()
def merge_files():
    try:
        files = request.files.getlist('files')
        labels = request.form.getlist('labels')
        start_numbers = request.form.getlist('start_numbers')

        if not files or not labels or not start_numbers:
            return jsonify({"error": "Files, labels, or start numbers are missing"}), 400

        start_numbers = [None if num.lower() == 'none' else int(num) for num in start_numbers]
        output_pdf = merge_pdfs(files, labels, start_numbers)
        return send_file(
            output_pdf,
            as_attachment=True,
            download_name='Merged.pdf'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@merge_bp.route('/label', methods=['POST'])
@conditional_jwt_required()
def label_files():
    try:
        files = request.files.getlist('files')
        labels = request.form.getlist('labels')
        start_numbers = request.form.getlist('start_numbers')

        if not files or not labels or not start_numbers:
            return jsonify({"error": "Files, labels, or start numbers are missing"}), 400

        start_numbers = [None if num.lower() == 'none' else int(num) for num in start_numbers]
        zip_buffer = label_pdfs(files, labels, start_numbers)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='LabeledFiles.zip'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
