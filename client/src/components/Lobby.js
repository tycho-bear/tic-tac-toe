import React, { useState } from 'react';

function Lobby({ username, users, onChallenge, pendingChallenge, onChallengeResponse }) {
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [boardSize, setBoardSize] = useState(3);
  const [winCondition, setWinCondition] = useState(3);

  // Filter out current user from the list
  const availableUsers = users.filter(user => user !== username);

  const handleChallengeClick = (user) => {
    setSelectedUser(user);
    setShowChallengeModal(true);
  };

  const handleChallengeSubmit = () => {
    onChallenge(selectedUser, boardSize, winCondition);
    setShowChallengeModal(false);
    setSelectedUser('');
  };

  const handleChallengeCancel = () => {
    setShowChallengeModal(false);
    setSelectedUser('');
  };

  // Update win condition when board size changes
  const handleBoardSizeChange = (newSize) => {
    setBoardSize(newSize);
    // For 3x3, win condition is always 3
    if (newSize === 3) {
      setWinCondition(3);
    } else if (winCondition === 3) {
      // If win condition is still 3, update it to a reasonable default
      setWinCondition(Math.min(4, newSize));
    }
  };

  return (
    <div className="lobby-container">
      <h2>Welcome, {username}!</h2>
      <div className="lobby-info">
        <p>Players in lobby: {availableUsers.length}</p>
        {availableUsers.length === 0 && (
          <p className="waiting-message">Waiting for other players to join...</p>
        )}
      </div>

      <div className="user-list">
        {availableUsers.map(user => (
          <div key={user} className="user-item">
            <span className="user-name">{user}</span>
            <button onClick={() => handleChallengeClick(user)}>
              Challenge
            </button>
          </div>
        ))}
      </div>

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Challenge {selectedUser}</h3>
            
            <div className="form-group">
              <label>Board Size:</label>
              <select 
                value={boardSize} 
                onChange={(e) => handleBoardSizeChange(Number(e.target.value))}
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                  <option key={size} value={size}>{size}x{size}</option>
                ))}
              </select>
            </div>

            {boardSize > 3 && (
              <div className="form-group">
                <label>Win Condition (in a row):</label>
                <select 
                  value={winCondition} 
                  onChange={(e) => setWinCondition(Number(e.target.value))}
                >
                  {Array.from({ length: boardSize }, (_, i) => i + 1)
                    .filter(n => n >= 3)
                    .map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                </select>
              </div>
            )}

            <div className="modal-buttons">
              <button onClick={handleChallengeSubmit}>Send Challenge</button>
              <button onClick={handleChallengeCancel} className="secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Challenge */}
      {pendingChallenge && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Challenge Received!</h3>
            <p>{pendingChallenge.challenger} wants to play:</p>
            <p>Board: {pendingChallenge.boardSize}x{pendingChallenge.boardSize}</p>
            <p>Win Condition: {pendingChallenge.winCondition} in a row</p>
            
            <div className="modal-buttons">
              <button onClick={() => onChallengeResponse(true, pendingChallenge.challenger)}>
                Accept
              </button>
              <button 
                onClick={() => onChallengeResponse(false, pendingChallenge.challenger)}
                className="secondary"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lobby;
