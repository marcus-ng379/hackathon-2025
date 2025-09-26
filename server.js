const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const WebSocket = require("ws");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Global storage for scraped data
let scrapedData = {};

// [/scraped] POST route to store web-scraped data
app.post("/scraped", (req, res) => {
  scrapedData = req.body;
  console.log("Received scraped data:", scrapedData);

  // Broadcast to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: "scraped_update", data: scrapedData })
      );
    }
  });

  res.json({ message: "Data received successfully!" });
});

// [/scraped] GET route to retrieve latest scraped data
app.get("/scraped", (req, res) => {
  res.json(scrapedData);
});


// Global storage for filters
let filters = {
  "A": 2,
  "B": 2,
  "Easy": 0,
  "Medium": 0,
  "Hard": 0
};

// [/filters] POST route to store sent filters
app.post("/filters", (req, res) => {
  filters = req.body;
  // console.log("Received filters settings:", filters);

  // Broadcast to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: "filters_update", data: filters })
      );
    }
  });

  res.json({ message: "Data received successfully!" });
});

// [/filters] GET route to retrieve latest scraped data
app.get("/filters", (req, res) => {
  res.json(filters);
});

///////////////////////////////////////////////
console.log("Received filters settings:", filters);


// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ---- WEBSOCKET SERVER ----
const wss = new WebSocket.Server({ server });

// Store rooms in memory
const rooms = {}; // { roomId: { users: [socket1, socket2, ...] } }

wss.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("message", (rawData) => {
    let msg;
    try {
      msg = JSON.parse(rawData);
    } catch {
      return socket.send(
        JSON.stringify({ type: "error", message: "Invalid JSON" })
      );
    }

    if (msg.type === "create_room") {
      const roomId = uuidv4();
      rooms[roomId] = { users: [socket] };
      socket.roomId = roomId;
      socket.send(JSON.stringify({ type: "room_created", roomId }));
    }

    if (msg.type === "join_room") {
      const roomId = msg.roomId;
      if (rooms[roomId]) {
        rooms[roomId].users.push(socket);
        socket.roomId = roomId;
        socket.send(JSON.stringify({ type: "room_joined", roomId }));

        // Notify others
        rooms[roomId].users.forEach((user) => {
          if (user !== socket) {
            user.send(
              JSON.stringify({ type: "user_joined", msg: "A new user joined!" })
            );
          }
        });
      } else {
        socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
      }
    }

    if (msg.type === "message") {
      const roomId = socket.roomId;
      if (roomId && rooms[roomId]) {
        rooms[roomId].users.forEach((user) => {
          if (user !== socket) {
            user.send(JSON.stringify({ type: "message", text: msg.text }));
          }
        });
      }
    }
  });

  socket.on("close", () => {
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].users = rooms[roomId].users.filter((u) => u !== socket);
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId]; // clean up
      }
    }
    console.log("WebSocket client disconnected");
  });
});
