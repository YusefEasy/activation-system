import os
import json
import uuid
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.getenv("SECRET_KEY")

class ActivationSystem:
    def __init__(self, db_path="activation_db"):
        self.db_path = db_path
        os.makedirs(db_path, exist_ok=True)
        self.activation_file = os.path.join(db_path, "activations.json")
        self.admin_keys_file = os.path.join(db_path, "admin_keys.json")
        self._init_files()

    def _init_files(self):
        """Initialize empty JSON files if they don't exist"""
        if not os.path.exists(self.activation_file):
            with open(self.activation_file, 'w') as f:
                json.dump({}, f)
        if not os.path.exists(self.admin_keys_file):
            with open(self.admin_keys_file, 'w') as f:
                json.dump({"admin_keys": [], "disabled_keys": []}, f)

    # ... (Include all other methods from previous implementation) ...

# Initialize system
activation_system = ActivationSystem()

@app.route('/')
def home():
    return render_template('admin.html')

@app.route('/api/generate', methods=['POST'])
def generate_key():
    """API endpoint for key generation"""
    data = request.json
    if not data or 'admin_key' not in data:
        return jsonify({"success": False, "message": "Missing admin_key"}), 400
    
    if not activation_system._validate_admin_key(data['admin_key']):
        return jsonify({"success": False, "message": "Invalid admin key"}), 403
    
    new_key = activation_system.generate_key(data.get('user_info', {}))
    return jsonify({"success": True, "key": new_key})

# ... (Include all other API endpoints) ...

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)