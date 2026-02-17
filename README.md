# Multiplayer Tic-Tac-Toe

A real-time multiplayer tic-tac-toe game built with React and Node.js.

## Features
- Real-time multiplayer gameplay
- Lobby system with player challenges
- Multiple board sizes (3x3 to 10x10)
- Customizable win conditions
- Rematch functionality

## Tech Stack
- **Frontend**: React, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Deployment**: Railway/Render (planned)

## Getting Started

### Prerequisites
- Node.js v18+ and npm

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```
Server will run on http://localhost:3001

2. In a new terminal, start the client:
```bash
cd client
npm start
```
Client will run on http://localhost:3000

3. Open your browser to http://localhost:3000

## Project Structure
```
tic-tac-toe/
├── client/          # React frontend
├── server/          # Node.js backend
├── Claude.md        # Project context for AI assistance
└── README.md
```

## Development Status
Currently in active development. See Claude.md for detailed project context and progress.
