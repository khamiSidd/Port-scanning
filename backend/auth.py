# backend/auth.py

from flask import Blueprint, request, jsonify
import jwt
import datetime
import models
from utils.auth_utils import send_otp_email
from config import SECRET_KEY

# Create a 'Blueprint' for auth routes
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    otp = models.add_user(email, password)
    
    if not otp:
        return jsonify({'message': 'Email already registered'}), 409

    if send_otp_email(email, otp):
        return jsonify({'success': True, 'message': 'Registration successful. OTP sent.'}), 201
    else:
        return jsonify({'message': 'User registered, but failed to send OTP email.'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400

    if models.verify_user_otp(email, otp):
        return jsonify({'success': True, 'message': 'Email verified successfully.'}), 200
    else:
        return jsonify({'message': 'Invalid or expired OTP'}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # --- MODIFIED ---
    auth_data = models.check_user_credentials(email, password)
    
    if auth_data['status']:
        # Credentials are valid
        
        # 1. Get the previous login time
        previous_login = auth_data['last_login']
        
        # 2. Update the last_login time in DB to *now* (fire and forget)
        models.update_last_login(email)
        
        # 3. Create the JWT
        token = jwt.encode(
            {
                'email': email,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            },
            SECRET_KEY,
            algorithm="HS256"
        )
        
        # 4. Return the token AND the previous_login time
        return jsonify({'token': token, 'lastLogin': previous_login}), 200
    else:
        return jsonify({'message': 'Invalid credentials or account not verified'}), 401