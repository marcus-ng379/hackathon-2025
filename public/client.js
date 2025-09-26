const socket = new WebSocket("ws://localhost:3000");

socket.onmessage = (event) => {
  console.log("Received:", JSON.parse(event.data));
};

// Create a room
socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'create_room' }));
};

// Later, join a room
// socket.send(JSON.stringify({ type: 'join_room', roomId: 'xyz' }));
