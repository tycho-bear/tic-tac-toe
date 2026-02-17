import React from 'react';

function Board({ board, boardSize, onCellClick, currentTurn, username, gameOver }) {
  const isMyTurn = currentTurn === username && !gameOver;

  return (
    <div 
      className="board"
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`
      }}
    >
      {board.map((cell, index) => (
        <button
          key={index}
          className={`cell ${cell ? 'filled' : ''} ${isMyTurn && !cell ? 'clickable' : ''}`}
          onClick={() => isMyTurn && !cell && onCellClick(index)}
          disabled={!isMyTurn || cell !== null || gameOver}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}

export default Board;
