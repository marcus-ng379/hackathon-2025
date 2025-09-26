const express = require('express');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Store rooms: Map<roomId, Set<client>>
const rooms = new Map();

wss.on('connection', (ws) => {
  let joinedRoom = null;

  ws.on('message', (msg) => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error("Invalid message:", msg);
      return;
    }

    if (data.type === 'join') {
      const roomId = data.roomId;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId).add(ws);
      joinedRoom = roomId;

      ws.send(JSON.stringify({ type: 'system', message: `Joined room ${roomId}` }));
    }

    if (data.type === 'message' && joinedRoom) {
      const roomClients = rooms.get(joinedRoom);

      for (const client of roomClients) {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ type: 'message', text: data.text }));
        }
      }
    }
  });

  ws.on('close', () => {
    if (joinedRoom && rooms.has(joinedRoom)) {
      rooms.get(joinedRoom).delete(ws);
      if (rooms.get(joinedRoom).size === 0) {
        rooms.delete(joinedRoom); // Clean up empty room
      }
    }
  });
});

// Endpoint to generate a new room and redirect
app.get('/create-room', (req, res) => {
  const newRoomId = uuidv4();
  res.redirect(`/room/${newRoomId}`);
});

// Serve room.html for dynamic /room/:id routes
app.get('/room/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
