import React from 'react';
import Board from './Board';

function Game({ gameState, username, onMove, onRematch, onRematchResponse, onReturnToLobby }) {
  const { 
    board, 
    boardSize, 
    winCondition, 
    currentTurn, 
    player1, 
    player2,
    winner,
    isDraw,
    gameOver,
    rematchOffered,
    rematchChallenger,
    rematchSent
  } = gameState;

  const opponent = username === player1 ? player2 : player1;
  const mySymbol = username === player1 ? 'X' : 'O';
  const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="player-info">
          <div className="player">
            <span className="symbol">{mySymbol}</span>
            <span className="name">{username} (You)</span>
          </div>
          <div className="vs">vs</div>
          <div className="player">
            <span className="symbol">{opponentSymbol}</span>
            <span className="name">{opponent}</span>
          </div>
        </div>

        <div className="game-details">
          <p>Board: {boardSize}x{boardSize} | Win: {winCondition} in a row</p>
        </div>

        {!gameOver && (
          <div className="turn-indicator">
            {currentTurn === username ? (
              <p className="your-turn">Your turn! ({mySymbol})</p>
            ) : (
              <p className="opponent-turn">Waiting for {opponent}... ({opponentSymbol})</p>
            )}
          </div>
        )}

        {gameOver && (
          <div className="game-result">
            {isDraw ? (
              <h2 className="draw">It's a Draw!</h2>
            ) : winner === mySymbol ? (
              <h2 className="winner">You Won! 🎉</h2>
            ) : (
              <h2 className="loser">{opponent} Won</h2>
            )}
          </div>
        )}
      </div>

      <Board
        board={board}
        boardSize={boardSize}
        onCellClick={onMove}
        currentTurn={currentTurn}
        username={username}
        gameOver={gameOver}
      />

      {gameOver && (
        <div className="game-actions">
          {!rematchSent && !rematchOffered && (
            <button onClick={onRematch}>Offer Rematch</button>
          )}
          
          {rematchSent && !rematchOffered && (
            <p className="waiting-rematch">Waiting for {opponent} to accept rematch...</p>
          )}

          {rematchOffered && (
            <div className="rematch-offer">
              <p>{rematchChallenger} wants a rematch!</p>
              <div className="modal-buttons">
                <button onClick={() => onRematchResponse(true, rematchChallenger)}>
                  Accept
                </button>
                <button onClick={() => onRematchResponse(false, rematchChallenger)} className="secondary">
                  Decline
                </button>
              </div>
            </div>
          )}

          <button onClick={onReturnToLobby} className="secondary">
            Return to Lobby
          </button>
        </div>
      )}
    </div>
  );
}

export default Game;
