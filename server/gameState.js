// In-memory storage for all game state
// This will be lost on server restart (acceptable for MVP)

const users = new Map();      // socketId -> { username, status }
const games = new Map();      // gameId -> { player1, player2, board, ... }
const challenges = new Map(); // challenger -> { target, boardSize, winCondition }

// User management
function addUser(socketId, username) {
  users.set(socketId, { username, status: 'lobby' });
}

function removeUser(socketId) {
  users.delete(socketId);
}

function getUser(socketId) {
  return users.get(socketId);
}

function getUserByUsername(username) {
  for (const [socketId, user] of users.entries()) {
    if (user.username === username) {
      return { socketId, ...user };
    }
  }
  return null;
}

function isUsernameTaken(username) {
  return Array.from(users.values()).some(user => user.username.toLowerCase() === username.toLowerCase());
}

function setUserStatus(socketId, status) {
  const user = users.get(socketId);
  if (user) {
    user.status = status;
  }
}

function getLobbyUsers() {
  const lobbyUsers = [];
  for (const [socketId, user] of users.entries()) {
    if (user.status === 'lobby') {
      lobbyUsers.push(user.username);
    }
  }
  return lobbyUsers;
}

// Challenge management
function addChallenge(challenger, target, boardSize, winCondition) {
  challenges.set(challenger, { target, boardSize, winCondition });
}

function getChallenge(challenger) {
  return challenges.get(challenger);
}

function removeChallenge(challenger) {
  challenges.delete(challenger);
}

// Game management
function createGame(gameId, player1, player2, boardSize, winCondition) {
  const boardLength = boardSize * boardSize;
  const board = new Array(boardLength).fill(null);
  
  games.set(gameId, {
    gameId,
    player1,
    player2,
    board,
    currentTurn: player1,  // Player 1 always goes first
    boardSize,
    winCondition,
    winner: null
  });
  
  return games.get(gameId);
}

function getGame(gameId) {
  return games.get(gameId);
}

function getGameByPlayer(username) {
  for (const game of games.values()) {
    if (game.player1 === username || game.player2 === username) {
      return game;
    }
  }
  return null;
}

function updateGame(gameId, updates) {
  const game = games.get(gameId);
  if (game) {
    Object.assign(game, updates);
  }
  return game;
}

function removeGame(gameId) {
  games.delete(gameId);
}

// Helper to get opponent's username
function getOpponent(gameId, username) {
  const game = games.get(gameId);
  if (!game) return null;
  return game.player1 === username ? game.player2 : game.player1;
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserByUsername,
  isUsernameTaken,
  setUserStatus,
  getLobbyUsers,
  addChallenge,
  getChallenge,
  removeChallenge,
  createGame,
  getGame,
  getGameByPlayer,
  updateGame,
  removeGame,
  getOpponent
};
