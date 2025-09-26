## Installation
# Update and Install Dependecies first
```bash
sudo apt update
sudo apt upgrade # System updates
sudo apt install curl # Dependecy
```

1. Install Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash # Install nvm
source ~/.bashrc # Reload shell
nvm install node # Installs Node.js
```

2. Install Express
```bash
mkdir my-express-app
cd my-express-app # Build
npm init
npm install express # Install Express
```

3. Install **socket.io**
```bash
npm install express socket.io
```