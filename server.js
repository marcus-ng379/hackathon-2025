const express = require("express");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { WebSocketServer } = require("ws");
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

// Store rooms: Map<roomId, Set<client>>
const rooms = new Map();

// Server message
function sendGlobalMessageToRoom(roomId, message) {
  if (!rooms.has(roomId)) {
    console.warn(`[GlobalMessage] Room "${roomId}" does not exist.`);
    return;
  }

  const roomClients = rooms.get(roomId);

  for (const client of roomClients) {
    if (client.readyState === client.OPEN) {
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

      rooms.get(roomId).add(ws);
      joinedRoom = roomId;
      sendGlobalMessageToRoom(roomId, `Somebody Joined room ${roomId}`);
    }

    if (data.type === "message" && joinedRoom) {
      const roomClients = rooms.get(joinedRoom);

      for (const client of roomClients) {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ type: "message", text: data.text }));
        }
      }
    }
  });

  ws.on("close", () => {
    if (joinedRoom && rooms.has(joinedRoom)) {
      rooms.get(joinedRoom).delete(ws);
      if (rooms.get(joinedRoom).size === 0) {
        rooms.delete(joinedRoom); // Clean up empty room
      }
    }
  });
});

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

function createRoom(initial) {
  let newRoomId = generateRoomID();
  while (rooms.has(newRoomId)) {
    newRoomId = generateRoomID();
  }
  rooms.set(newRoomId, new Set());
  return newRoomId;
}

// call for jamie's room id or something idk what he wants
app.post("/RoomIDGen", (req, res) => {
  const roomId = createRoom();
  res.json({ result: roomId });
});

// Serve room.html for dynamic /room/:id routes
app.get("/room/:id", (req, res) => {
  if (rooms.has(req.params.id)) {
    res.sendFile(path.join(__dirname, "public", "room.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "nullroom.html"));
  }
});

///////////////////////////////// JSON MANIPULATION ///////////////////////////////////

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

////

app.post("/filter", async (req, res) => {
  try {
    // Validate input first before any Python calls
    const { filters } = req.body;
    console.log("Filter recv");
    if (!filters) {
      return res
        .status(400)
        .json({ error: "Missing 'filters' in request body" });
    }
    console.log("Filtering questions...");
    const filtered = getFilteredQuestions(filters);
    console.log(`About to send ${filtered.length} problems`);
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Filtering failed" });
  }
});

app.post("/scrape", async (req, res) => {
  runDailyScraper();
});

const PORT = process.env.PORT || 5000;

// Daily AUCPL scraper job - runs every day at 2 AM

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
