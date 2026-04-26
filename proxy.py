import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import ssl

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

PORT = 8080

class ProxyHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Auth-Token, X-Merchant-ID')
        self.end_headers()

    def handle_request(self):
        parsed_path = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed_path.query)
        
        target_url = None
        if 'url' in qs:
            target_url = qs['url'][0]
        else:
            if self.path.startswith('/?'):
                target_url = urllib.parse.unquote(self.path[2:])
                
        if not target_url:
            self.send_response(400)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b"No URL provided")
            return
            
        content_len = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_len) if content_len > 0 else None

        excluded = {'host', 'origin', 'referer', 'connection', 'accept-encoding', 'content-length'}
        if self.command.upper() in ('GET', 'DELETE') and not body:
            excluded.add('content-type')
        headers = {}
        for key, value in self.headers.items():
            if key.lower() not in excluded:
                headers[key] = value

        req = urllib.request.Request(target_url, headers=headers, data=body, method=self.command)
        
        try:
            with urllib.request.urlopen(req, context=ssl_context) as response:
                self.send_response(response.status)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Auth-Token, X-Merchant-ID')
                
                resp_headers = dict(response.headers)
                for k, v in resp_headers.items():
                    if k.lower() not in ('transfer-encoding', 'connection', 'content-encoding', 'strict-transport-security'):
                        self.send_header(k, v)
                
                self.end_headers()
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            for k, v in dict(e.headers).items():
                if k.lower() not in ('transfer-encoding', 'connection', 'content-encoding', 'strict-transport-security'):
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())
            
        except Exception as e:
            import traceback
            err = traceback.format_exc()
            print("ERROR", err)
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(err.encode('utf-8'))

    def do_GET(self): self.handle_request()
    def do_POST(self): self.handle_request()
    def do_PUT(self): self.handle_request()
    def do_DELETE(self): self.handle_request()

socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    print(f"CORS Proxy server running on http://localhost:{PORT}")
    httpd.serve_forever()
