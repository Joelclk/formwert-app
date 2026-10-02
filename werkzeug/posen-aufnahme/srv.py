# Liefert die App-Kopie aus und speichert POST /hochladen/<name> bzw. /upload/<name> nach posen_neu/
import base64, http.server, os, sys
class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        name=os.path.basename(self.path)
        daten=self.rfile.read(int(self.headers.get('Content-Length',0)))
        if daten.startswith(b'data:'):
            daten=base64.b64decode(daten.split(b',',1)[1])
        open(os.path.join('posen_neu',name),'wb').write(daten)
        self.send_response(200);self.end_headers();self.wfile.write(b'ok')
    def log_message(self,*a):pass
http.server.ThreadingHTTPServer(('127.0.0.1',int(sys.argv[1])),H).serve_forever()
