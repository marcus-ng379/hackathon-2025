const socket = io();

// Join a room
socket.emit('joinRoom', 'room123');

// Send a message
socket.emit('message', { roomId: 'room123', message: 'Hello!' });

// Receive messages
socket.on('message', (data) => {
  console.log(`${data.sender}: ${data.message}`);
});
