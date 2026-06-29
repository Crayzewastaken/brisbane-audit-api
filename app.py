import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from pathlib import Path

app = Flask(__name__)

# Configuration
API_TOKEN = os.environ.get('AUDIT_API_TOKEN', 'dev-token-change-in-production')
DATA_DIR = Path(__file__).parent / 'data'
DATA_FILE = DATA_DIR / 'audits.json'

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

# Initialize data file if it doesn't exist
if not DATA_FILE.exists():
    DATA_FILE.write_text(json.dumps([]))


def verify_token(auth_header):
    """Verify Bearer token."""
    if not auth_header:
        return False
    try:
        scheme, token = auth_header.split()
        return scheme.lower() == 'bearer' and token == API_TOKEN
    except ValueError:
        return False


@app.route('/api/audit', methods=['POST'])
def append_audit():
    """Append a new audit record."""
    # Verify token
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Load existing audits
    audits = json.loads(DATA_FILE.read_text())

    # Add timestamp if not provided
    if 'timestamp' not in data:
        data['timestamp'] = datetime.now().isoformat()

    # Append new audit
    audits.append(data)

    # Save back to file
    DATA_FILE.write_text(json.dumps(audits, indent=2))

    return jsonify({'status': 'success', 'message': 'Audit appended'}), 201


@app.route('/api/audits', methods=['GET'])
def get_audits():
    """Get all audits (with token verification)."""
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return jsonify({'error': 'Unauthorized'}), 401

    audits = json.loads(DATA_FILE.read_text())
    return jsonify(audits), 200


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
