// Pure game logic functions - no networking, just rules

/**
 * Check if there's a winner on the board
 * @param {Array} board - Flat array of board state (null, 'X', or 'O')
 * @param {number} boardSize - Size of the board (3 for 3x3, etc.)
 * @param {number} winCondition - Number in a row needed to win
 * @returns {string|null} - 'X', 'O', or null if no winner
 */
function checkWinner(board, boardSize, winCondition) {
  // Helper to get value at [row, col]
  const getCell = (row, col) => {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      return null;
    }
    return board[row * boardSize + col];
  };

  // Check if N consecutive cells match and are not null
  const checkLine = (cells) => {
    if (cells.length < winCondition) return null;
    
    for (let i = 0; i <= cells.length - winCondition; i++) {
      const slice = cells.slice(i, i + winCondition);
      const first = slice[0];
      
      if (first && slice.every(cell => cell === first)) {
        return first;
      }
    }
    return null;
  };

  // Check all rows
  for (let row = 0; row < boardSize; row++) {
    const rowCells = [];
    for (let col = 0; col < boardSize; col++) {
      rowCells.push(getCell(row, col));
    }
    const winner = checkLine(rowCells);
    if (winner) return winner;
  }

  // Check all columns
  for (let col = 0; col < boardSize; col++) {
    const colCells = [];
    for (let row = 0; row < boardSize; row++) {
      colCells.push(getCell(row, col));
    }
    const winner = checkLine(colCells);
    if (winner) return winner;
  }

  // Check diagonals (top-left to bottom-right)
  // We need to check all possible diagonal starting points
  for (let startRow = 0; startRow <= boardSize - winCondition; startRow++) {
    for (let startCol = 0; startCol <= boardSize - winCondition; startCol++) {
      const diagCells = [];
      for (let i = 0; i < boardSize - Math.max(startRow, startCol); i++) {
        diagCells.push(getCell(startRow + i, startCol + i));
      }
      const winner = checkLine(diagCells);
      if (winner) return winner;
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let startRow = 0; startRow <= boardSize - winCondition; startRow++) {
    for (let startCol = winCondition - 1; startCol < boardSize; startCol++) {
      const diagCells = [];
      for (let i = 0; startRow + i < boardSize && startCol - i >= 0; i++) {
        diagCells.push(getCell(startRow + i, startCol - i));
      }
      const winner = checkLine(diagCells);
      if (winner) return winner;
    }
  }

  return null;
}

/**
 * Check if the board is completely filled
 * @param {Array} board - Flat array of board state
 * @returns {boolean}
 */
function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

/**
 * Check if a move is valid
 * @param {Array} board - Flat array of board state
 * @param {number} cellIndex - Index of the cell to check
 * @returns {boolean}
 */
function isValidMove(board, cellIndex) {
  return cellIndex >= 0 && cellIndex < board.length && board[cellIndex] === null;
}

/**
 * Get the symbol for a player (X or O)
 * @param {string} username - Player's username
 * @param {string} player1 - Username of player 1 (X)
 * @returns {string} - 'X' or 'O'
 */
function getPlayerSymbol(username, player1) {
  return username === player1 ? 'X' : 'O';
}

module.exports = {
  checkWinner,
  isBoardFull,
  isValidMove,
  getPlayerSymbol
};
