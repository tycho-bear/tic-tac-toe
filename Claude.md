# Tic-Tac-Toe Multiplayer Game - Project Context

## Project Overview
A real-time multiplayer tic-tac-toe game where two players can connect via browser, play against each other, and review their game history.

## Project Goals & Scope

### Core Features (MVP)
- Real-time multiplayer gameplay (moves appear instantly on both screens)
- Lobby system where players can see waiting players and challenge them
- Simple name-based identification (no authentication)
- Support for multiple board sizes (3x3 up to 10x10)
- Player-selectable win conditions for 4x4+ boards (e.g., 4-in-a-row, 5-in-a-row, full-line)
- One game per player at a time
- Post-game options: offer rematch OR return to lobby

### Future Features (Deferred)
- Game history and replay functionality (post-MVP: stored indefinitely in database)
- AI opponent
- Chat between players
- Visual flair (animations, sound effects, themes)
- Multiple simultaneous games per player
- Tournament/bracket modes
- Spectator mode
- Leaderboards and statistics

## Requirements & Decisions

### Technical Requirements
1. **Real-time communication**: WebSocket-based for instant move updates
2. **Backend required**: Cannot use static hosting alone (GitHub Pages ruled out)
3. **Name uniqueness**: Names must be unique per session - if "Bob" is logged in, another user cannot use "Bob"
4. **Board sizes**: 3x3 through 10x10
5. **Hosting target**: Railway or Render (free tier, WebSocket support)

### Win Conditions
- 3x3: always 3-in-a-row (full line)
- 4x4+: player who creates the challenge chooses the win condition (e.g. 4-in-a-row, 5-in-a-row, or full line)

### User Flow
1. User enters name → system checks uniqueness → prompts for different name if taken
2. User enters lobby → sees list of waiting players
3. User challenges another player (selects board size and win condition for 4x4+) OR waits to be challenged
4. Game starts with real-time synchronization
5. After game ends → options: "Offer Rematch" OR "Return to Lobby"
6. If rematch offered and accepted → new game with same settings
7. (Future) Users can view their game history and replay past games

## Architecture Decisions

### High-Level Architecture
```
┌─────────────┐         WebSocket          ┌─────────────┐
│   Browser   │ ←─────────────────────────→ │   Server    │
│  (Client)   │                             │  (Backend)  │
└─────────────┘                             └─────────────┘
     ↑ ↓                                          ↓
  HTTP/HTML                              ┌──────────────┐
                                         │   In-Memory  │
                                         │   Storage    │
                                         └──────────────┘
```

**Components:**
- **Client (Browser)**: React application with HTML/CSS/JavaScript
- **Server**: Node.js + Express + Socket.io for WebSocket connections
- **Storage**: In-memory for MVP (players, active games, lobby state)

### State Management
The server tracks:
- **Active users**: `{ username: string, socketId: string, status: 'lobby' | 'in-game' }`
- **Active games**: `{ gameId: string, player1: string, player2: string, board: array, currentTurn: string, boardSize: number, winCondition: number }`
- **Lobby state**: List of users waiting for challenges
- **Challenge invitations**: Pending challenges between players

All stored in memory for MVP (server restart = data lost). Post-MVP: database persistence.

### Client-Server Communication (Socket.io Events)

**Client → Server:**
- `join` - User joins with username
- `challenge` - User challenges another player (includes board size, win condition)
- `accept_challenge` / `decline_challenge`
- `make_move` - Player makes a move
- `offer_rematch` / `accept_rematch` / `decline_rematch`
- `return_to_lobby`

**Server → Client:**
- `user_list` - Updated list of lobby users (broadcast whenever anyone joins/leaves/enters or exits a game)
- `challenge_received` - Someone challenged you
- `game_start` - Game is starting
- `game_update` - Board state changed
- `game_over` - Game ended (winner/draw)
- `rematch_offered` - Opponent wants rematch
- `error` - Something went wrong (name taken, invalid move, etc.)

### Project Structure
```
tic-tac-toe/
├── client/
│   ├── src/
│   │   ├── App.js              # Main React app, manages which screen is shown
│   │   ├── components/
│   │   │   ├── Login.js        # Name entry screen
│   │   │   ├── Lobby.js        # Player list + challenge UI
│   │   │   ├── Game.js         # Game screen (wraps Board, handles game events)
│   │   │   └── Board.js        # Renders the grid, handles click events
│   │   ├── App.css
│   │   └── index.js            # React entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
├── server/
│   ├── index.js                # Server entry point, Socket.io event handlers
│   ├── gameLogic.js            # Win detection, move validation, board utilities
│   └── gameState.js            # In-memory state: users, games, challenges
├── .gitignore
├── Dockerfile                  # For future Docker deployment
├── Claude.md                   # This file
└── README.md
```

## Technology Stack

### Frontend
- **Framework**: React (via Create React App)
- **Styling**: Plain CSS
- **WebSocket Client**: Socket.io-client
- **Key concept**: Single-page app - one HTML file, React swaps components based on state

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express (serves static files + HTTP foundation)
- **WebSocket**: Socket.io (handles real-time events)
- **Language**: JavaScript

### Database
- **MVP**: In-memory (no persistence between server restarts)
- **Post-MVP**: PostgreSQL or MongoDB for game history

### Deployment
- **Development**: Local (Node.js + browser, no Docker needed)
- **Production**: Railway or Render (free tier, good WebSocket support)
- **Docker**: Will be added later for consistent deployments

## Coding Conventions
*(To be established once we start building)*

## Environment Notes
- **Current dev machine**: Ubuntu (Linux)
  - Node.js v20 NodeSource repository configured, pending installation
  - Run `sudo apt-get install -y nodejs` when on stable wifi
  - Then `cd server && npm install` and `cd client && npm install`
- **Future dev machine**: Windows (project path will differ)
- **IDE**: PyCharm

## Current Status
**Phase**: Build Mode - Subtask 1 partially complete (blocked on wifi)
**Last Updated**: Project structure and config files created; dependencies not yet installed

## Next Steps
1. ✅ Planning Mode complete
2. ✅ Architecture Mode complete
3. **Build Mode** - In progress:
   - ✅ Subtask 1a: Project structure created (server/, client/src/components/, etc.)
   - ✅ Subtask 1b: package.json files created for server and client
   - ✅ Subtask 1c: README.md and .gitignore created
   - ⏳ Subtask 1d: Install dependencies (needs stable internet)
     - `sudo apt-get install -y nodejs` (NodeSource repo already configured)
     - `cd server && npm install`
     - `cd client && npm install`
   - ⬜ Subtask 2: Build basic server (index.js, gameState.js skeleton)
   - ⬜ Subtask 3: Build game logic (gameLogic.js - win detection, move validation)
   - ⬜ Subtask 4: React client skeleton (App.js, index.js, index.html)
   - ⬜ Subtask 5: Login component + join event
   - ⬜ Subtask 6: Lobby component + user list + challenge flow
   - ⬜ Subtask 7: Game + Board components + move/win logic
   - ⬜ Subtask 8: Rematch functionality
   - ⬜ Subtask 9: Polish and end-to-end testing
   - ⬜ (Later) Docker configuration

## Known Issues / TODOs
- Clarify leaderboard/statistics requirements (deferred to post-MVP)
- Decide if we need persistent user identity across sessions (deferred to post-MVP)
- Docker setup (deferred until user has Docker available)
- Dependencies not yet installed (waiting for stable wifi)

## Questions / Open Items
*(None currently)*
