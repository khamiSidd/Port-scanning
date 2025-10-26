# backend/utils/auth_utils.py

import smtplib
from email.message import EmailMessage
import jwt
from functools import wraps
from flask import request, jsonify
from config import EMAIL_ADDRESS, EMAIL_PASSWORD, SMTP_SERVER, SMTP_PORT, SECRET_KEY

def send_otp_email(to_email, otp):
    """Sends a simple text email with the OTP."""
    try:
        msg = EmailMessage()
        msg.set_content(f'Your verification OTP is: {otp}\n\nIt is valid for 10 minutes.')
        msg['Subject'] = 'Port Scanner - Verify Your Email'
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = to_email

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# --- JWT Token Decorator ---
def token_required(f):
    """A decorator to protect routes that require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token is invalid!'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # We don't need the user data right now, just to validate the token
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)
    return decorated