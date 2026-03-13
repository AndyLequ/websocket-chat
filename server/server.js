const { WebSocketServer } = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Serve the client HTML file
const httpServer = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "client.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

const wss = new WebSocketServer({ server: httpServer });

const clients = new Map();

wss.on("connection", (ws) => {
  let username = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === "join") {
      // register this connection with a username
      username = msg.username.trim().slice(0, 20) || "Anonymous";

      clients.set(ws, username);
      console.log(`+ ${username} joined (${clients.size} online)`);
    }
  });
});
