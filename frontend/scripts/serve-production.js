#!/usr/bin/env node

const handler = require('serve-handler');
const http = require('http');
const path = require('path');

const port = process.env.PORT || 5000;
const buildPath = path.join(__dirname, '..', 'build');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: buildPath,
    cleanUrls: true,
    rewrites: [
      { source: '**', destination: '/index.html' }
    ]
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});