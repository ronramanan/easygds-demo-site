const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 3000;
const targetHost = 'demo.apps.easygds.com';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 1. Handle API Proxy requests
    if (req.url.startsWith('/api')) {
        // Remove trailing slash if present (e.g. /api/places/ -> /api/places)
        // to avoid 404s from upstream API which is sensitive to slashes
        const parsedUrl = url.parse(req.url);
        // Note: 'url' module is already imported at the top
        let path = parsedUrl.pathname;
        if (path.endsWith('/') && path.length > 1) {
            path = path.slice(0, -1);
        }

        const options = {
            hostname: targetHost,
            port: 443,
            path: path + (parsedUrl.search || ''),
            method: req.method,
            headers: {
                ...req.headers,
                host: targetHost,
                // Spoof origin/referer to avoid 403/CORS issues upstream
                origin: `https://${targetHost}`,
                referer: `https://${targetHost}/`
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            // Forward status code and headers from upstream
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            console.error(`Proxy error: ${e.message}`);
            res.writeHead(500);
            res.end('Proxy Error');
        });

        // Pipe request body if any (for POST/PUT)
        req.pipe(proxyReq);
        return;
    }

    // 2. Serve Static Files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Remove query params for file lookup
    const qIndex = filePath.indexOf('?');
    if (qIndex !== -1) {
        filePath = filePath.substring(0, qIndex);
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Return 404
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/ (Proxying /api to ${targetHost})`);
});
