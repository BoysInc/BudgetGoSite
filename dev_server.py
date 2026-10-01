#!/usr/bin/env python3
"""Local preview with auto refresh: python3 dev_server.py [--port 4174]."""
import argparse
import errno
import hashlib
import io
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent
WATCH = {'.html', '.htm', '.css', '.js', '.mjs', '.png', '.jpg', '.jpeg',
         '.webp', '.svg', '.gif', '.ico', '.avif', '.bmp'}
ENDPOINT = '/__dev_version'


def version():
    digest = hashlib.sha256()
    for directory, folders, files in os.walk(ROOT):
        folders[:] = sorted(n for n in folders if not n.startswith('.')
                            and not (Path(directory) / n).is_symlink())
        for name in sorted(files):
            path = Path(directory) / name
            if name.startswith('.') or path.suffix.lower() not in WATCH or path.is_symlink():
                continue
            try:
                stat = path.stat()
                digest.update(f'{path.relative_to(ROOT)}:{stat.st_mtime_ns}:{stat.st_size}\n'.encode())
            except OSError:  # An editor may replace a file during the scan.
                continue
    return digest.hexdigest()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def respond(self, data, mime):
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        return io.BytesIO(data)

    def send_head(self):
        if self.headers.get('Host', '').split(':')[0].lower() not in {'127.0.0.1', 'localhost'}:
            self.send_error(403)
            return None
        request_path = unquote(urlsplit(self.path).path)
        if request_path == ENDPOINT:
            data = json.dumps({'service': 'budgetgo-dev', 'version': version()}).encode()
            return self.respond(data, 'application/json')
        path = Path(self.translate_path(self.path)).resolve()
        if path.is_dir():
            path = (path / 'index.html').resolve()
        if (any(p.startswith('.') for p in Path(request_path).parts)
                or not path.is_relative_to(ROOT)
                or any(p.startswith('.') for p in path.relative_to(ROOT).parts)):
            self.send_error(404)
            return None
        if not path.is_file():
            self.send_error(404)
            return None
        if self.guess_type(str(path)) != 'text/html':
            return super().send_head()
        script = f'''<script data-budgetgo-dev-refresh>
(() => {{if (!['localhost','127.0.0.1'].includes(location.hostname)) return;
const initial = '{version()}';
setInterval(async () => {{try {{const r = await fetch('{ENDPOINT}', {{cache:'no-store'}});
if (r.ok && (await r.json()).version !== initial) location.reload();
}} catch (_) {{}}}}, 1000);}})();</script>'''
        return self.respond(path.read_bytes() + script.encode(), 'text/html; charset=utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4174)
    port = parser.parse_args().port
    url = f'http://127.0.0.1:{port}'
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    except OSError as error:
        if error.errno != errno.EADDRINUSE:
            raise SystemExit(f'Cannot start preview: {error}')
        try:
            with urlopen(url + ENDPOINT, timeout=2) as response:
                assert json.load(response).get('service') == 'budgetgo-dev'
        except Exception:
            raise SystemExit(f'Port {port} is unavailable; existing process left running.')
        print(f'Reusing {url}')
        raise SystemExit(0)
    print(f'BudgetGo auto-refresh preview: {url}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
