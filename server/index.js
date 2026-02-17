const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const gameState = require('./gameState');
const gameLogic = require('./gameLogic');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files in production (after building React app)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining with a username
  socket.on('join', (username) => {
    console.log('Join request:', username);

    // Validate username
    if (!username || username.trim().length === 0) {
      socket.emit('error', { message: 'Username cannot be empty' });
      return;
    }

    // Check if username is already taken
    if (gameState.isUsernameTaken(username)) {
      socket.emit('error', { message: 'Username is already taken. Please choose another.' });
      return;
    }

    // Add user to state
    gameState.addUser(socket.id, username);

    // Send success confirmation to the user
    socket.emit('join_success', { username });

    // Broadcast updated user list to all users in lobby
    io.emit('user_list', { users: gameState.getLobbyUsers() });

    console.log(`User ${username} joined. Lobby users:`, gameState.getLobbyUsers());
  });

  // Handle challenge request
  socket.on('challenge', ({ target, boardSize, winCondition }) => {
    const user = gameState.getUser(socket.id);
    if (!user) {
      socket.emit('error', { message: 'You must join first' });
      return;
    }

    const challenger = user.username;

    // Validate target exists and is in lobby
    const targetUser = gameState.getUserByUsername(target);
    if (!targetUser) {
      socket.emit('error', { message: 'Target user not found' });
      return;
    }
    if (targetUser.status !== 'lobby') {
      socket.emit('error', { message: 'Target user is not available' });
      return;
    }

    // Store challenge
    gameState.addChallenge(challenger, target, boardSize, winCondition);

    // Notify target user
    io.to(targetUser.socketId).emit('challenge_received', {
      challenger,
      boardSize,
      winCondition
    });

    console.log(`${challenger} challenged ${target} to ${boardSize}x${boardSize} (win: ${winCondition})`);
  });

  // Handle challenge acceptance
  socket.on('accept_challenge', ({ challenger }) => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    const target = user.username;
    const challenge = gameState.getChallenge(challenger);

    if (!challenge || challenge.target !== target) {
      socket.emit('error', { message: 'Invalid challenge' });
      return;
    }

    // Create game
    const gameId = `game_${Date.now()}`;
    const game = gameState.createGame(
      gameId,
      challenger,
      target,
      challenge.boardSize,
      challenge.winCondition
    );

    // Update user statuses
    const challengerUser = gameState.getUserByUsername(challenger);
    gameState.setUserStatus(socket.id, 'in-game');
    gameState.setUserStatus(challengerUser.socketId, 'in-game');

    // Remove challenge
    gameState.removeChallenge(challenger);

    // Notify both players
    const gameData = {
      gameId: game.gameId,
      player1: game.player1,
      player2: game.player2,
      board: game.board,
      currentTurn: game.currentTurn,
      boardSize: game.boardSize,
      winCondition: game.winCondition
    };

    io.to(socket.id).emit('game_start', gameData);
    io.to(challengerUser.socketId).emit('game_start', gameData);

    // Update lobby
    io.emit('user_list', { users: gameState.getLobbyUsers() });

    console.log(`Game ${gameId} started between ${challenger} and ${target}`);
  });

  // Handle challenge decline
  socket.on('decline_challenge', ({ challenger }) => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    const challenge = gameState.getChallenge(challenger);
    if (challenge && challenge.target === user.username) {
      gameState.removeChallenge(challenger);

      // Notify challenger
      const challengerUser = gameState.getUserByUsername(challenger);
      if (challengerUser) {
        io.to(challengerUser.socketId).emit('challenge_declined', {
          target: user.username
        });
      }

      console.log(`${user.username} declined challenge from ${challenger}`);
    }
  });

  // Handle game move
  socket.on('make_move', ({ cellIndex }) => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    const username = user.username;
    const game = gameState.getGameByPlayer(username);

    if (!game) {
      socket.emit('error', { message: 'You are not in a game' });
      return;
    }

    // Validate it's the player's turn
    if (game.currentTurn !== username) {
      socket.emit('error', { message: 'It is not your turn' });
      return;
    }

    // Validate move
    if (!gameLogic.isValidMove(game.board, cellIndex)) {
      socket.emit('error', { message: 'Invalid move' });
      return;
    }

    // Make move
    const symbol = gameLogic.getPlayerSymbol(username, game.player1);
    game.board[cellIndex] = symbol;

    // Switch turn
    const nextTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
    game.currentTurn = nextTurn;

    // Check for winner
    const winner = gameLogic.checkWinner(game.board, game.boardSize, game.winCondition);
    const isDraw = !winner && gameLogic.isBoardFull(game.board);

    // Get both players' socket IDs
    const player1User = gameState.getUserByUsername(game.player1);
    const player2User = gameState.getUserByUsername(game.player2);

    if (winner || isDraw) {
      // Game over
      game.winner = winner;

      io.to(player1User.socketId).emit('game_over', {
        winner: winner,
        isDraw: isDraw,
        board: game.board
      });
      io.to(player2User.socketId).emit('game_over', {
        winner: winner,
        isDraw: isDraw,
        board: game.board
      });

      console.log(`Game ${game.gameId} ended. Winner: ${winner || 'Draw'}`);
    } else {
      // Game continues - send update to both players
      io.to(player1User.socketId).emit('game_update', {
        board: game.board,
        currentTurn: game.currentTurn
      });
      io.to(player2User.socketId).emit('game_update', {
        board: game.board,
        currentTurn: game.currentTurn
      });
    }
  });

  // Handle rematch offer
  socket.on('offer_rematch', () => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    const game = gameState.getGameByPlayer(user.username);
    if (!game) return;

    const opponent = gameState.getOpponent(game.gameId, user.username);
    const opponentUser = gameState.getUserByUsername(opponent);

    if (opponentUser) {
      io.to(opponentUser.socketId).emit('rematch_offered', {
        challenger: user.username
      });
      console.log(`${user.username} offered rematch to ${opponent}`);
    }
  });

  // Handle rematch acceptance
  socket.on('accept_rematch', ({ challenger }) => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    const oldGame = gameState.getGameByPlayer(user.username);
    if (!oldGame) return;

    // Create new game with same settings
    const gameId = `game_${Date.now()}`;
    const game = gameState.createGame(
      gameId,
      oldGame.player1,
      oldGame.player2,
      oldGame.boardSize,
      oldGame.winCondition
    );

    // Remove old game
    gameState.removeGame(oldGame.gameId);

    // Notify both players
    const player1User = gameState.getUserByUsername(game.player1);
    const player2User = gameState.getUserByUsername(game.player2);

    const gameData = {
      gameId: game.gameId,
      player1: game.player1,
      player2: game.player2,
      board: game.board,
      currentTurn: game.currentTurn,
      boardSize: game.boardSize,
      winCondition: game.winCondition
    };

    io.to(player1User.socketId).emit('game_start', gameData);
    io.to(player2User.socketId).emit('game_start', gameData);

    console.log(`Rematch started: ${gameId}`);
  });

  // Handle return to lobby
  socket.on('return_to_lobby', () => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    const game = gameState.getGameByPlayer(user.username);
    if (game) {
      // Notify opponent
      const opponent = gameState.getOpponent(game.gameId, user.username);
      const opponentUser = gameState.getUserByUsername(opponent);
      
      if (opponentUser) {
        io.to(opponentUser.socketId).emit('opponent_left');
        gameState.setUserStatus(opponentUser.socketId, 'lobby');
      }

      // Remove game
      gameState.removeGame(game.gameId);
    }

    // Set user back to lobby
    gameState.setUserStatus(socket.id, 'lobby');

    // Update lobby
    io.emit('user_list', { users: gameState.getLobbyUsers() });

    console.log(`${user.username} returned to lobby`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = gameState.getUser(socket.id);
    if (!user) return;

    console.log('Client disconnected:', user.username);

    // If in game, notify opponent
    const game = gameState.getGameByPlayer(user.username);
    if (game) {
      const opponent = gameState.getOpponent(game.gameId, user.username);
      const opponentUser = gameState.getUserByUsername(opponent);
      
      if (opponentUser) {
        io.to(opponentUser.socketId).emit('opponent_disconnected');
        gameState.setUserStatus(opponentUser.socketId, 'lobby');
      }

      gameState.removeGame(game.gameId);
    }

    // Remove any pending challenges
    gameState.removeChallenge(user.username);

    // Remove user
    gameState.removeUser(socket.id);

    // Update lobby
    io.emit('user_list', { users: gameState.getLobbyUsers() });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
