#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import subprocess
import json
import os

PROPRESENTER_HOST = os.environ.get('PROPRESENTER_HOST', '192.168.3.232')
PROPRESENTER_PORT = int(os.environ.get('PROPRESENTER_PORT', '50001'))

class ProxyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            api_path = self.path.replace('/api/', '/v1/')
            url = f'http://{PROPRESENTER_HOST}:{PROPRESENTER_PORT}{api_path}'
            try:
                result = subprocess.run(['curl', '-s', '--connect-timeout', '2', url],
                                      capture_output=True, text=True, timeout=3)
                if result.returncode == 0:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(result.stdout.encode())
                else:
                    raise Exception(f'curl failed: {result.stderr}')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_GET()

if __name__ == '__main__':
    server = HTTPServer(('', 8000), ProxyHandler)
    print(f'Server running at http://localhost:8000')
    print(f'Proxying ProPresenter API from {PROPRESENTER_HOST}:{PROPRESENTER_PORT}')
    server.serve_forever()
