import http.server
import socketserver

PORT = 3000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        # Route fallback for clean URLs like /about, /photos, /photographs
        path = self.translate_path(self.path)
        import os
        clean_path = self.path.split('?')[0].rstrip('/')
        if not os.path.exists(path) and '.' not in os.path.basename(self.path):
            try:
                with open('index.html', 'rb') as f:
                    content = f.read()
                if clean_path and clean_path != '':
                    content = content.replace(b'data-framer-hydrate-v2=', b'data-clean-route=')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                pass
        return super().do_GET()

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

with ThreadedTCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"Serving with zero-cache on http://localhost:{PORT}")
    httpd.serve_forever()
