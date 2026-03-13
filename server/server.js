const { WebSocketServer } = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Serve the client HTML file
const httpServer = http.createServer((req, res)) => {
  const filePath = path.join(__dirname, 'client.html');
  fs.readFile(filePath, (err, data) => {
    if(err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200);
    res.end(data);
  })
}