from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from psycopg2 import IntegrityError
from pdf_merger.db_utils import get_db_connection

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registers a new user."""
    username = request.json.get('username')
    password = request.json.get('password')

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                (username, hashed_password),
            )
        conn.commit()
    except IntegrityError:
        return jsonify({"error": "User already exists"}), 400
    finally:
        conn.close()

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Logs in a user and returns a JWT token."""
    username = request.json.get('username')
    password = request.json.get('password')

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
            user = cur.fetchone()

        if user is None or not check_password_hash(user[0], password):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    finally:
        conn.close()

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
