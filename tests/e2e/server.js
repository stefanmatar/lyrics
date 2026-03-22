const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '127.0.0.1';
const port = 4173;
const indexPath = path.resolve(__dirname, '..', '..', 'index.html');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.createReadStream(indexPath)
      .on('error', () => {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Failed to load index.html');
      })
      .pipe(res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }));
    return;
  }

  if (req.url === '/api/status/slide' || req.url === '/api/status/audience_screens') {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Use Playwright route mocking in tests.' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, host, () => {
  process.stdout.write(`Lyrics test server listening on http://${host}:${port}\n`);
});
