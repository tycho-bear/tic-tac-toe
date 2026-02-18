# Tic-Tac-Toe Multiplayer Game - Project Context

## Project Overview
A real-time multiplayer tic-tac-toe game where two players can connect via browser, play against each other, and review their game history.

## Project Goals & Scope

### Core Features (MVP) - ✅ COMPLETE
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
- Hover indicator on board: when hovering over an empty cell on your turn, show a faint version of your symbol (X or O) as a preview of the potential move
- Challenge status indicator: show "waiting on challenge..." next to a user's name when you've challenged them, until they respond or you challenge someone else

## Requirements & Decisions

### Technical Requirements
1. **Real-time communication**: WebSocket-based for instant move updates
2. **Backend required**: Cannot use static hosting alone (GitHub Pages ruled out)
3. **Name uniqueness**: Names must be unique per session - if "Bob" is logged in, another user cannot use "Bob" (case-insensitive)
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
├── .dockerignore
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # For local Docker testing
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
- **Development**: Local (npm run dev for hot-reload)
- **Testing**: Docker locally with `docker build` and `docker run`
- **Production**: Render (deployed via GitHub integration)
- **Live URL**: https://tic-tac-toe-pfh0.onrender.com/

## Coding Conventions
- Use clear, descriptive variable names
- Keep functions focused on single responsibilities
- Comment complex logic
- Use ES6+ features (arrow functions, destructuring, etc.)

## Environment Notes
- **Primary dev machine**: Windows
  - Node.js v20.10.0, npm 10.2.3
  - Project path: `C:\Users\Tycho\Documents\Projects\Tic-tac-toe`
  - Docker Desktop installed
- **Secondary dev machine**: Ubuntu (Linux)
- **IDE**: PyCharm
- **Version control**: Git with GitHub repository

## Current Status
**Phase**: MVP Deployed! 🚀
**Last Updated**: Docker configuration complete, app deployed to Render

## Completed Tasks
1. ✅ Planning Mode complete
2. ✅ Architecture Mode complete
3. ✅ Build Mode - MVP complete:
   - ✅ Subtask 1: Project structure and dependencies
   - ✅ Subtask 2: Server implementation (index.js, gameState.js, gameLogic.js)
   - ✅ Subtask 3: React client implementation (all components)
   - ✅ Subtask 4: End-to-end testing and bug fixes
4. ✅ Docker configuration:
   - ✅ Multi-stage Dockerfile for optimized builds
   - ✅ docker-compose.yml for local testing
   - ✅ .dockerignore for efficient builds
   - ✅ Production environment configuration (server and client)
5. ✅ Deployment to Render:
   - ✅ GitHub integration
   - ✅ Automatic deploys from repository
   - ✅ Live at https://tic-tac-toe-pfh0.onrender.com/

## Bugs Fixed
1. **Case-sensitive usernames**: Username uniqueness now case-insensitive (Bob and bob cannot coexist)
2. **Winner display**: Fixed logic to compare winning symbol instead of username
3. **Docker build - npm ci failure**: Fixed package-lock.json sync issue
4. **Docker build - react-scripts missing**: Changed client stage to install all dependencies (including devDependencies)

## Testing Completed
- ✅ Login and username uniqueness (case-insensitive)
- ✅ Lobby user list updates
- ✅ Challenge flow (send, accept, decline)
- ✅ Real-time game board updates
- ✅ Win detection and game over display
- ✅ Rematch functionality
- ✅ Return to lobby functionality
- ✅ Multiple board sizes with custom win conditions
- ✅ Docker local testing (localhost:3001)
- ✅ Production deployment testing on Render

## Next Steps (Optional Enhancements)
- ⬜ Implement hover indicator on board cells
- ⬜ Add challenge status indicator in lobby ("waiting on challenge..." next to challenged user)
- ⬜ Add game history and replay functionality (requires database)
- ⬜ Implement AI opponent
- ⬜ Add chat feature between players
- ⬜ Visual enhancements (animations, sound effects, improved styling)
- ⬜ Leaderboards and statistics (requires database)
- ⬜ Multiple simultaneous games per player
- ⬜ Tournament/bracket modes
- ⬜ Spectator mode

## Known Issues / TODOs
*(None currently - MVP is feature-complete and deployed)*

## Questions / Open Items
*(None currently)*
