const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');

const app = express(); // Function Handler  
const server = createServer(app);

app.get('/', (req, res) => { // On initialised (main)
  res.sendFile(join(__dirname, 'public/index.html')); // send public html
});

server.listen(3000, () => { // Listen on port 3000
  console.log('server running at http://localhost:3000');
});