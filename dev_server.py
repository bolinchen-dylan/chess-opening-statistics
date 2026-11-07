import os
import urllib.request
from dotenv import load_dotenv
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, urlencode

load_dotenv()

LICHESS_MASTERGAME_URL = "https://explorer.lichess.ovh/masters?"
LICHESS_PLAYERGAME_URL = "https://explorer.lichess.ovh/player?"
LICHESS_ONLINEGAME_URL = "https://explorer.lichess.ovh/lichess?"

WIKIBOOK_URL = "https://en.wikibooks.org/w/api.php?"


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/opening":
            params = parse_qs(parsed.query)
            openingMoves = params.get("play", [""])[0]
            print("opening requested in the server!")

            token = os.environ.get("LICHESS_TOKEN")

            query = urlencode({"play": openingMoves})
            url = LICHESS_MASTERGAME_URL + query

            request = urllib.request.Request(
                url,
                headers={"Authorization": f"Bearer {token}"}
            )

            with urllib.request.urlopen(request, timeout=10) as response:
                lichess_data = response.read()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(lichess_data)
        elif parsed.path == "/api/description":
            title = parse_qs(parsed.query).get("title", [""])[0]
            params = {
                "action": "parse",
                "page": title,
                "format": "json",
                "formatversion": "2"
            }
            query = urlencode(params)

            url = WIKIBOOK_URL + query

            request = urllib.request.Request(
                url,
                headers={"User-Agent": "ChessOpeningStatistics https://github.com/bolinchen-dylan/chess-opening-statistics"}
            )

            with urllib.request.urlopen(request, timeout=10) as response:
                data = response.read()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()  
            self.wfile.write(data)
        else:
            super().do_GET()


server = ThreadingHTTPServer(("127.0.0.1", 8080), MyHandler)


print("Development server running at http://127.0.0.1:8080")
server.serve_forever()