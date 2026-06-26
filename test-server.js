const http = require('http');
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  const safePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const fp = path.join(dist, safePath);
  console.log(req.url, '->', fp);

  if (!fp.startsWith(dist)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + fp);
      return;
    }
    const ext = path.extname(fp);
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.woff2': 'font/woff2',
    };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(5174, '127.0.0.1', () => {
  console.log('Server on http://127.0.0.1:5174');
  http.get('http://127.0.0.1:5174/', (res) => {
    console.log('Test status:', res.statusCode);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('Body starts:', d.substring(0, 100)));
  });
});
