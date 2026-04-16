"""
auth_routes.py
──────────────
Handles user registration, login, password hashing, and JWT generation.
"""
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from db import users_collection

# Create the blueprint and initialize bcrypt
auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Safely extract data
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # 1. Validation
    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields (name, email, password)"}), 400

    # 2. Check if user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 409

    # 3. Hash the password securely using bcrypt
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # 4. Create User Document
    user_document = {
        "name": name,
        "email": email,
        "password": hashed_password
    }

    # 5. Insert into MongoDB Atlas
    try:
        result = users_collection.insert_one(user_document)
        return jsonify({
            "message": "User created successfully", 
            "user_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # 1. Validation
    if not all([email, password]):
        return jsonify({"error": "Missing email or password"}), 400

    # 2. Fetch user from database
    user = users_collection.find_one({"email": email})

    # 3. Validate user existence and password match
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    # 4. Generate JWT token (using MongoDB _id as the unique identity payload)
    access_token = create_access_token(identity=str(user['_id']))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user_name": user.get("name", "User")
    }), 200