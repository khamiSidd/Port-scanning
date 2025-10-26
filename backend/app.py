# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS

# --- NEW IMPORTS ---
import models
from config import SECRET_KEY
from auth import auth_bp
from utils.auth_utils import token_required
# --- END NEW IMPORTS ---

# Import scan configurations
from utils.configure_scan.config_manager import configure_scan

app = Flask(__name__)

# --- NEW CONFIG ---
# Apply secret key from config file
app.config['SECRET_KEY'] = SECRET_KEY

# Enable CORS for your React app (on port 5173) and allow auth headers
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Register the authentication blueprint
# All routes in auth.py will be prefixed with /api
# e.g., /api/register, /api/login
app.register_blueprint(auth_bp, url_prefix='/api')
# --- END NEW CONFIG ---


# --- MODIFIED SCAN ROUTE ---
# Note the new URL prefix and the @token_required decorator
@app.route('/api/scan', methods=['POST'])
@token_required
def scan():
    """
    Handle POST requests for initiating a scan.
    Requires a valid JWT Bearer token.
    Expects a JSON body with scan configuration parameters.
    """
    try:
        scan_config = configure_scan(request.json)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except PermissionError:
        print("\n[ERROR] Permission denied. Did you forget to run as root/Administrator?\n")
        return jsonify({'error': 'Permission denied. Backend must run as root/Administrator.'}), 500
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}\n")
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500
        
    results = []
    
    target_ip = scan_config['target_ip']
    ports_to_scan = scan_config['ports_to_scan']
    selected_scanner = scan_config['selected_scanner']
    
    for port in ports_to_scan:
        if scan_config['scan_type'] == "Idle":
            zombie_ip = scan_config['zombie_ip']
            result = selected_scanner(target_ip, port, zombie_ip)
        else:
            result = selected_scanner(target_ip, port)
        results.append(result)

    return jsonify(results)


if __name__ == '__main__':
    # --- NEW: Initialize DB ---
    models.init_db()
    
    print("Starting Flask server on http://127.0.0.1:5000")
    print("IMPORTANT: This server must be run with 'sudo' for scans requiring raw sockets.")
    
    # Host '127.0.0.1' is safer, only allows connections from your machine
    app.run(host='127.0.0.1', port=5000)