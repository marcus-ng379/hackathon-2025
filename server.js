const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomID) => {
    socket.join(roomID);
    console.log(`${socket.id} joined room ${roomID}`);
  });

  socket.on('message', ({ roomId, message }) => {
    io.to(roomId).emit('message', { sender: socket.id, message });
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
