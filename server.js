const express = require('express');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws'); // Websocket for sessionID
const { spawn } = require('child_process'); // For running external files like scraper.py

const app = express();
const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Store rooms and users in memory
const rooms = {}; // { roomId: { users: [socket1, socket2, ...] } }

// Handle new connections
wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'create_room') {
      const roomId = uuidv4();
      rooms[roomId] = { users: [socket] };
      socket.roomId = roomId;
      socket.send(JSON.stringify({ type: 'room_created', roomId }));
    }

    if (msg.type === 'join_room') {
      const roomId = msg.roomId;
      if (rooms[roomId]) {
        rooms[roomId].users.push(socket);
        socket.roomId = roomId;
        socket.send(JSON.stringify({ type: 'room_joined', roomId }));
        // Notify others
        rooms[roomId].users.forEach(user => {
          if (user !== socket) {
            user.send(JSON.stringify({ type: 'user_joined', msg: 'A new user joined!' }));
          }
        });
      } else {
        socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      }
    }

    if (msg.type === 'message') {
      const roomId = socket.roomId;
      if (rooms[roomId]) {
        rooms[roomId].users.forEach(user => {
          if (user !== socket) {
            user.send(JSON.stringify({ type: 'message', text: msg.text }));
          }
        });
      }
    }
  });

  socket.on('close', () => {
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].users = rooms[roomId].users.filter(u => u !== socket);
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId]; // clean up
      }
    }
  });
});
