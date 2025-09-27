# Leet Leagues - Real-time Chat System

A real-time chat application with two components:
1. **Web Chat Server** - A Node.js/Express server with WebSocket support for creating and joining chat rooms
2. **Chrome Extension** - A browser extension that provides a sidebar chat interface for LeetCode and AUCPL users

##  Features

- **Real-time messaging** using WebSockets
- **Room-based chat** - Create or join specific chat rooms
- **Chrome Extension integration** - Chat sidebar for coding platforms
- **Cross-platform support** - Works on Chrome, Edge, and Brave browsers
- **Clean and simple UI** - Focused on ease of use

### Chrome Extension
- **Manifest V3** Chrome extension
- **Side Panel API** for integrated chat experience
- **Content Scripts** for website integration
- **Background Service Worker** for tab management

##  Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Chrome, Edge, or Brave browser
- Access to LeetCode.com or AUCPL.com for extension functionality

##  Installation & Setup

### 1. Web Chat Server Setup

```bash
# Clone the repository
git clone <repository-url>
cd hackathon-2025-1

# Install dependencies
npm install

# Start the server
node server.js
```

The server will start on `http://localhost:3000`

### 2. Chrome Extension Setup

1. **Download the extension**
   - Ensure you have the `SideBar` folder from this repository

2. **Install in Chrome/Edge/Brave**
   - Open your browser
   - Navigate to `chrome://extensions/` (or equivalent for your browser)
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **"Load unpacked"**
   - Select the `SideBar` folder from this project

3. **Verify installation**
   - The "Online" extension should appear in your extensions list
   - Navigate to `leetcode.com` or `aucpl.com`
   - Click the extension icon to open the chat sidebar

##  How to Use

### Web Interface (Standalone)

1. **Access the lobby**
   - Open `http://localhost:3000` in your browser

2. **Create a new room**
   - Click "Create Room" button
   - You'll be redirected to a new room with a unique ID

3. **Join an existing room**
   - Enter the Room ID in the input field
   - Click "Join Room" button

4. **Chat in rooms**
   - Type messages in the input field
   - Click "Send" or press Enter
   - Messages appear in real-time for all room participants

### Chrome Extension

1. **Navigate to supported sites**
   - Go to `leetcode.com` or `aucpl.com`

2. **Open the sidebar**
   - Click the "Online" extension icon
   - The chat sidebar will open on the right side

3. **Set your username**
   - Enter your desired username
   - Click "Send Username" (make sure it's correct!)

4. **Start chatting**
   - Use the chat interface to communicate with other users on the same platform

#### Server Development

1. **Make changes to server code**
   ```bash
   # Edit server.js or files in public/
   # Restart the server to see changes
   node server.js
   ```

2. **Add new dependencies**
   ```bash
   npm install <package-name>
   ```

3. **Testing**
   - Test WebSocket connections manually
   - Use browser developer tools for debugging
   - Monitor server logs in terminal

##  Troubleshooting

### Common Issues

1. **Extension not loading**
   - Ensure Developer mode is enabled
   - Check for errors in chrome://extensions/
   - Verify all required files are in SideBar folder

2. **WebSocket connection fails**
   - Confirm server is running on localhost:3000
   - Check for CORS or network issues
   - Verify WebSocket URL in client code

3. **Extension not showing on websites**
   - Confirm you're on leetcode.com or aucpl.com
   - Check manifest.json host_permissions
   - Reload the extension after changes