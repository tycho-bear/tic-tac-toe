import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import Lobby from './components/Lobby';
import Game from './components/Game';

// In production, connect to the same server serving the app
// In development, connect to localhost:3001
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login', 'lobby', 'game'
  const [username, setUsername] = useState('');
  const [lobbyUsers, setLobbyUsers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [error, setError] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Join success
    socket.on('join_success', ({ username }) => {
      setUsername(username);
      setScreen('lobby');
      setError('');
    });

    // Error handling
    socket.on('error', ({ message }) => {
      setError(message);
    });

    // Lobby user list updates
    socket.on('user_list', ({ users }) => {
      setLobbyUsers(users);
    });

    // Challenge received
    socket.on('challenge_received', ({ challenger, boardSize, winCondition }) => {
      setPendingChallenge({ challenger, boardSize, winCondition });
    });

    // Challenge declined
    socket.on('challenge_declined', ({ target }) => {
      setError(`${target} declined your challenge`);
      setTimeout(() => setError(''), 3000);
    });

    // Game start
    socket.on('game_start', (game) => {
      setGameState(game);
      setScreen('game');
      setPendingChallenge(null);
    });

    // Game update
    socket.on('game_update', ({ board, currentTurn }) => {
      setGameState(prev => ({
        ...prev,
        board,
        currentTurn
      }));
    });

    // Game over
    socket.on('game_over', ({ winner, isDraw, board }) => {
      setGameState(prev => ({
        ...prev,
        board,
        winner,
        isDraw,
        gameOver: true
      }));
    });

    // Rematch offered
    socket.on('rematch_offered', ({ challenger }) => {
      setGameState(prev => ({
        ...prev,
        rematchOffered: true,
        rematchChallenger: challenger
      }));
    });

    // Opponent left
    socket.on('opponent_left', () => {
      setError('Your opponent returned to the lobby');
      setScreen('lobby');
      setGameState(null);
    });

    // Opponent disconnected
    socket.on('opponent_disconnected', () => {
      setError('Your opponent disconnected');
      setScreen('lobby');
      setGameState(null);
    });

    // Cleanup listeners
    return () => {
      socket.off('join_success');
      socket.off('error');
      socket.off('user_list');
      socket.off('challenge_received');
      socket.off('challenge_declined');
      socket.off('game_start');
      socket.off('game_update');
      socket.off('game_over');
      socket.off('rematch_offered');
      socket.off('opponent_left');
      socket.off('opponent_disconnected');
    };
  }, [socket]);

  // Handle join
  const handleJoin = (username) => {
    if (socket) {
      socket.emit('join', username);
    }
  };

  // Handle challenge
  const handleChallenge = (target, boardSize, winCondition) => {
    if (socket) {
      socket.emit('challenge', { target, boardSize, winCondition });
    }
  };

  // Handle challenge response
  const handleChallengeResponse = (accept, challenger) => {
    if (socket) {
      if (accept) {
        socket.emit('accept_challenge', { challenger });
      } else {
        socket.emit('decline_challenge', { challenger });
      }
      setPendingChallenge(null);
    }
  };

  // Handle move
  const handleMove = (cellIndex) => {
    if (socket && gameState && !gameState.gameOver) {
      socket.emit('make_move', { cellIndex });
    }
  };

  // Handle rematch
  const handleRematch = () => {
    if (socket) {
      socket.emit('offer_rematch');
      setGameState(prev => ({
        ...prev,
        rematchSent: true
      }));
    }
  };

  // Handle rematch response
  const handleRematchResponse = (accept, challenger) => {
    if (socket) {
      if (accept) {
        socket.emit('accept_rematch', { challenger });
      }
      setGameState(prev => ({
        ...prev,
        rematchOffered: false,
        rematchChallenger: null
      }));
    }
  };

  // Handle return to lobby
  const handleReturnToLobby = () => {
    if (socket) {
      socket.emit('return_to_lobby');
      setScreen('lobby');
      setGameState(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multiplayer Tic-Tac-Toe</h1>
      </header>

      <main className="App-main">
        {error && <div className="error-message">{error}</div>}

        {screen === 'login' && (
          <Login onJoin={handleJoin} />
        )}

        {screen === 'lobby' && (
          <Lobby
            username={username}
            users={lobbyUsers}
            onChallenge={handleChallenge}
            pendingChallenge={pendingChallenge}
            onChallengeResponse={handleChallengeResponse}
          />
        )}

        {screen === 'game' && gameState && (
          <Game
            gameState={gameState}
            username={username}
            onMove={handleMove}
            onRematch={handleRematch}
            onRematchResponse={handleRematchResponse}
            onReturnToLobby={handleReturnToLobby}
          />
        )}
      </main>
    </div>
  );
}

export default App;
