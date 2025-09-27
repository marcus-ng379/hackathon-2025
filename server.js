const express = require("express");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { WebSocketServer, WebSocket } = require("ws");
const cron = require("node-cron");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// CORS middleware to allow external API calls
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
// Parse JSON bodies for API requests
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Store rooms: Map<roomId, Set<socketId>>
const rooms = new Map(); // {Room ID : Set<socketId>}
const usersIn = new Map(); // {Room ID : map{name : Freq}}}
const roomResources = new Map(); // {Room ID : <vector>}
const roomIntervals = new Map(); // roomId -> interval ID

// Server message
function sendGlobalMessageToRoom(roomId, message) {
  if (!rooms.has(roomId)) {
    console.warn(`[GlobalMessage] Room "${roomId}" does not exist.`);
    return;
  }
  const roomClients = rooms.get(roomId);

  for (const client of roomClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "system", message }));
    }
  }
}

wss.on("connection", (ws) => {
  let joinedRoom = null;

  ws.on("message", (msg) => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error("Invalid message:", msg);
      return;
    }

    if (data.type === "join") {
      const roomId = data.roomId;

      joinedRoom = roomId;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId).add(ws);

      // Send system message
    }

    if (data.type === "message" && joinedRoom) {
      const roomClients = rooms.get(joinedRoom);

      for (const client of roomClients) {
        if (client.readyState === ws.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              text: data.text,
            }),
          );
        }
      }
    }
  });

  ws.on("close", () => {
    if (joinedRoom && rooms.has(joinedRoom)) {
      const clients = rooms.get(joinedRoom);
      clients.delete(ws);

      if (clients.size === 0) {
        rooms.delete(joinedRoom);
        usersIn.delete(joinedRoom);
        roomResources.delete(joinedRoom);

        if (roomIntervals.has(joinedRoom)) {
          clearInterval(roomIntervals.get(joinedRoom));
          roomIntervals.delete(joinedRoom);
          console.log(`Stopped periodic updates for room ${joinedRoom}`);
        }
      }
    }
  });
});

// ================================================== HELPERS =====================================
function getTotalPeopleInRoom(roomId) {
  if (!usersIn.has(roomId)) {
    console.log(`Room ${roomId} does not exist.`);
    return;
  }

  const roomUsers = usersIn.get(roomId); // Get the inner map for the room

  // The total number of people in the room is the sum of all frequencies (values) in the map
  let totalPeople = 0;

  roomUsers.forEach((freq) => {
    totalPeople += freq; // Add each user's frequency to the total
  });

  return totalPeople;
}

// Creating a new room ID
function generateRoomID() {
  let roomID = "";
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 7; i++) {
    roomID += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomID;
}

function createRoom() {
  let newRoomId = generateRoomID();
  while (rooms.has(newRoomId)) {
    newRoomId = generateRoomID();
  }
  rooms.set(newRoomId, new Set());
  usersIn.set(newRoomId, new Map());
  return newRoomId;
}

// call for jamie's room id or something idk what he wants
app.post("/RoomIDGen", (req, res) => {
  const { payload } = req.body; // Directly destructure 'name' from the body
  if (!payload.filters || !payload.nameValue) {
    return res
      .status(400)
      .json({ error: "Missing 'payload' in request create RoomId" });
  }
  const filters = payload.filters;
  const name = payload.nameValue;

  const roomId = createRoom();

  // Assuming 'usersIn' is a map where you want to store user counts for each roomId
  if (!usersIn.get(roomId)) {
    usersIn.set(roomId, new Map()); // Initialize if the room doesn't exist yet
  }

  if (!usersIn.get(roomId).has(name)) {
    usersIn.get(roomId).set(name, 0); // Initialize user count if not set
  }

  usersIn.get(roomId).set(name, usersIn.get(roomId).get(name) + 1); // Increment the user count for this room

  // Validate input first before any Python calls
  const filtered = getFilteredQuestions(filters);
  roomResources.set(roomId, filtered);
  res.json({ roomId: roomId, filter: filtered });
});

// Serve room.html for dynamic /room/:id routes
app.get("/room/:id", (req, res) => {
  if (rooms.has(req.params.id)) {
    res.sendFile(path.join(__dirname, "public", "room.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "nullroom.html"));
  }
});

function getFilteredQuestions(filters) {
  const rawData1 = fs.readFileSync("public/AllAUCPL.json", "utf-8");
  const AUCPLData = JSON.parse(rawData1);

  const rawData2 = fs.readFileSync("public/AllLeetcode.json", "utf-8");
  const LeetcodeData = JSON.parse(rawData2);

  console.log(
    `There are ${Object.keys(AUCPLData.byName || {}).length} AUCPL problems total.`,
  );

  console.log(
    `There are ${Object.keys(LeetcodeData.byName || {}).length} Leetcode problems total.`,
  );

  console.log("Filters:", filters);

  const filteredQuestions = [];
  const added = new Set(); // To avoid duplicates by problem name

  // Helper to shuffle an array (Fisher-Yates)
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  for (const [diff, amount] of Object.entries(filters)) {
    if (!amount || amount <= 0) continue; // skip zero or false

    let problemsList = [];
    // Get all problems for this difficulty and shuffle
    // Changed this below part, where I check if it's from AUCPL or Leetcode
    if (["Easy", "Medium", "Hard"].includes(diff)) {
      // If it's from Leetcode:
      problemsList = shuffle([...LeetcodeData.byDifficulty[diff]]);
    } else {
      // If from AUCPL:
      problemsList = shuffle([...AUCPLData.byDifficulty[diff]]);
    }

    // Pick amount unique problems
    let count = 0;
    for (const problemName of problemsList) {
      if (count >= amount) break;
      if (added.has(problemName)) continue;

      let problemInfo = null;

      if (["Easy", "Medium", "Hard"].includes(diff)) {
        // If it's from Leetcode:
        problemInfo = LeetcodeData.byName[problemName];
      } else {
        // If from AUCPL:
        problemInfo = AUCPLData.byName[problemName];
      }

      if (!problemInfo) continue;

      filteredQuestions.push({
        Name: problemName,
        Url: problemInfo.Url,
        Origin: problemInfo.Origin,
        Difficulty: problemInfo.Difficulty,
      });

      added.add(problemName);
      count++;
    }
  }

  return filteredQuestions;
}

app.post("/joinRoom", async (req, res) => {
  const { payload } = req.body;
  if (!payload.nameValue || !payload.roomId) {
    return res
      .status(400)
      .json({ error: "Missing 'nameValue' or 'roomId' in request body" });
  }

  // Access the inner map for the room
  const roomUsers = usersIn.get(payload.roomId);

  if (!roomUsers) {
    // If the room doesn't exist, create a new map for it
    usersIn.set(payload.roomId, new Map());
  }

  // Get the frequency for the user in the room (default to 0 if not present)
  const currentFreq = roomUsers.get(payload.nameValue) || 0;

  // Increment the frequency of the user (join the room)
  roomUsers.set(payload.nameValue, currentFreq + 1);

  // Send a global message to the room
  sendGlobalMessageToRoom(
    payload.roomId,
    `${payload.nameValue} Joined the room`,
  );

  res.json({ filter: roomResources.get(payload.roomId) });
});

app.post("/exit", async (req, res) => {
  const { payload } = req.body;
  if (!payload.nameValue || !payload.roomId) {
    return res
      .status(400)
      .json({ error: "Missing 'nameValue' or 'roomId' in request body" });
  }

  const roomUsers = usersIn.get(payload.roomId);
  if (!roomUsers) {
    return res
      .status(400)
      .json({ error: "Room does not exist or no users in the room" });
  }

  const currentFreq = roomUsers.get(payload.nameValue);
  if (!currentFreq || currentFreq <= 0) {
    return res
      .status(400)
      .json({ error: `${payload.nameValue} is not in the room` });
  }

  roomUsers.set(payload.nameValue, currentFreq - 1);

  sendGlobalMessageToRoom(payload.roomId, `${payload.nameValue} Left the room`);

  res.json({ success: true });
});

app.post("/server", async (req, res) => {
  const { payload } = req.body;
  if (!payload.roomId || !payload.message) {
    return res.status(400).json({ error: "Missing server in request body" });
  }

  sendGlobalMessageToRoom(payload.roomId, `${payload.message} Sent`);

  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;

// Daily scraper job - runs every day at 2 AM

function runDailyScraper() {
  console.log(`[${new Date().toISOString()}] Starting daily scraper...`);

  const pyProcess = spawn("python3", ["daily_scraper.py"], { cwd: __dirname });

  pyProcess.stdout.on("data", (data) => {
    console.log(`[Daily Scraper] ${data.toString()}`);
  });

  pyProcess.stderr.on("data", (data) => {
    console.error(`[Daily Scraper ERROR] ${data.toString()}`);
  });

  pyProcess.on("close", (code) => {
    if (code === 0) {
      console.log(
        `[${new Date().toISOString()}] Daily scraper completed successfully`,
      );
    } else {
      console.error(
        `[${new Date().toISOString()}] Daily scraper exited with code ${code}`,
      );
    }
  });
}

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  // Schedule the job to run daily at 2:00 AM
  cron.schedule("0 2 * * *", runDailyScraper, {
    timezone: "UTC",
  });

  console.log("Daily scraper scheduled to run at 2:00 AM UTC every day");

  // Run scraper on startup if AllAUCPL.json doesn't exist or is older than 24 hours
  const scrapePath = path.join(__dirname, "public", "AllAUCPL.json");
  if (!fs.existsSync(scrapePath)) {
    console.log("AllAUCPL.json not found, running initial scrape...");
    runDailyScraper();
  } else {
    const stats = fs.statSync(scrapePath);
    const now = new Date();
    const fileAge = now - stats.mtime;
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (fileAge > oneDay) {
      console.log("AllAUCPL.json is older than 24 hours, running scrape...");
      runDailyScraper();
    } else {
      console.log("AllAUCPL.json is up to date");
    }
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;

// Make sure this is after `app.use(express.json())` and your WebSocket setup
app.post("/messages", (req, res) => {
  const { name, text } = req.body;

  if (!name || !text) {
    return res.status(400).json({ error: "Missing 'name' or 'text'" });
  }

  // Broadcast to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: "message", name, text }));
    }
  });

  res.json({ success: true, message: "Message sent to all clients" });
});
