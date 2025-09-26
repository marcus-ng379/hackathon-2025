const socket = new WebSocket("ws://localhost:3000");

let myRoomId = null;

socket.onopen = () => {
  console.log("Connected to WebSocket server");

  // Create a room on connect
  socket.send(JSON.stringify({ type: "create_room" }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  if (data.type === "room_created") {
    myRoomId = data.roomId;
    console.log("Room created with ID:", myRoomId);
  }

  if (data.type === "room_joined") {
    console.log("Joined room:", data.roomId);
  }

  if (data.type === "message") {
    console.log("Chat message:", data.text);
  }

  if (data.type === "scraped_update") {
    console.log("New scraped data available:", data.data);
  }
};

// Helper to send a chat message
function sendMessage(text) {
  socket.send(JSON.stringify({ type: "message", text }));
}

// Helper to join an existing room
function joinRoom(roomId) {
  socket.send(JSON.stringify({ type: "join_room", roomId }));
}
