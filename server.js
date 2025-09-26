const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

// Global variable userIDs ()
var IDs = 0; // Current userID

const app = express(); // Function Handler  
const server = createServer(app);
const io = new Server(server, { // Create listener for incoming sockets
  connectionStateRecovery: {} // Attempt auto-recover on disconnect
}); 

app.get('/', (req, res) => { // On initialised (main)
  res.sendFile(join(__dirname, 'public/index.html')); // send public html
});
// Change root
app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('chat message', (data) => {
    console.log(`message from ${data.userId}: ${data.message}`);
    io.emit('chat message', data); // broadcast to all clients
  });
});


server.listen(3000, () => { // Listen on port 3000
  console.log('server running at http://localhost:3000');
}); 