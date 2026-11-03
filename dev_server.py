from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


server = ThreadingHTTPServer(("localhost", 8080), NoCacheHandler)

print("Development server running at http://localhost:8080")
server.serve_forever()