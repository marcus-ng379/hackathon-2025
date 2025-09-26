const WebSocket = require('ws');

// Replace with Computer B's IP and port
const serverIP = "172.17.208.1";
const serverPort = 8080;

const socket = new WebSocket(`ws://${serverIP}:${serverPort}/`);

socket.on('open', () => {
    console.log("✅ Connected to Computer B!");
    socket.send("Hello from Computer A!");
});

socket.on('message', (data) => {
    console.log("📩 Message from server:", data.toString());
});

socket.on('error', (err) => {
    console.error("❌ WebSocket error:", err);
});

socket.on('close', () => {
    console.log("🔌 Connection closed");
});