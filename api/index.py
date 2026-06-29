import os
import json
from datetime import datetime
from pathlib import Path
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs

DATA_DIR = Path('/tmp/data')
DATA_FILE = DATA_DIR / 'audits.json'
API_TOKEN = os.environ.get('AUDIT_API_TOKEN', 'dev-token')

# Initialize
DATA_DIR.mkdir(exist_ok=True, parents=True)
if not DATA_FILE.exists():
    DATA_FILE.write_text(json.dumps([]))


class handler(BaseHTTPRequestHandler):
    def verify_token(self):
        auth = self.headers.get('Authorization', '')
        try:
            scheme, token = auth.split()
            return scheme.lower() == 'bearer' and token == API_TOKEN
        except:
            return False

    def do_POST(self):
        if self.path == '/api/audit':
            if not self.verify_token():
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
                return

            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            audits = json.loads(DATA_FILE.read_text())
            if 'timestamp' not in data:
                data['timestamp'] = datetime.now().isoformat()
            audits.append(data)
            DATA_FILE.write_text(json.dumps(audits, indent=2))

            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/api/audits':
            if not self.verify_token():
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
                return

            audits = json.loads(DATA_FILE.read_text())
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(audits).encode())

        elif self.path == '/health' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass
