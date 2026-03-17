const { WebSocketServer } = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Serve the client HTML file
const httpServer = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "../app/index.html");
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

      broadcast({
        type: "system",
        text: `${username} joined the chat`,
        count: clients.size,
      });
    }

    if (msg.type === "chat" && username) {
      console.log(`[${username}] ${msg.text}`);
      // Broadcast the message to all connected clients
      broadcast({ type: "chat", username, text: msg.text, ts: Date.now() });
    }
  });

  ws.on("close", () => {
    if (username) {
      clients.delete(ws);
      console.log(`- ${username} left (${clients.size} online)`);
      broadcast({
        type: "system",
        text: `${username} left the chat`,
        count: clients.size,
      });
    }
  });

  ws.on("error", (err) => console.error("WebSocket error:", err));
});

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const [client] of clients) {
    if (client.readyState === 1) {
      //1 = OPEN}
      client.send(data);
    }
  }
}

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});
