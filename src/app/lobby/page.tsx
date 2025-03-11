// src/app/lobby/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameApi } from '../api/gameApi';
import { PlayerSelection } from '../types/game';
import '../styles/lobby.css';

export default function LobbyPage() {
  // State
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState<'knight' | 'wizard'>('knight');
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for stored player name
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }
    
    // Fetch available sessions
    const fetchSessions = async () => {
      try {
        const sessions = await gameApi.getAvailableSessions();
        setAvailableSessions(sessions);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    
    fetchSessions();
    
    // Refresh sessions every 5 seconds
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const createNewGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    setLoading(true);
    try {
      // Create new session
      const session = await gameApi.createSession();
      
      // Join the session
      const player: PlayerSelection = {
        name: playerName,
        type: playerType
      };
      
      await gameApi.joinSession(session.id, player);
      
      // Save player name in localStorage
      localStorage.setItem('playerName', playerName);
      
      // Navigate to the game page
      router.push(`/game/${session.id}`);
    } catch (error) {
      console.error('Failed to create game:', error);
      setLoading(false);
    }
  };

  const joinExistingGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!selectedSession) {
      alert('Please select a session to join');
      return;
    }
    
    setLoading(true);
    try {
      // Join the session
      const player: PlayerSelection = {
        name: playerName,
        type: playerType
      };
      
      await gameApi.joinSession(selectedSession, player);
      
      // Save player name in localStorage
      localStorage.setItem('playerName', playerName);
      
      // Navigate to the game page
      router.push(`/game/${selectedSession}`);
    } catch (error) {
      console.error('Failed to join game:', error);
      setLoading(false);
    }
  };

  return (
    <div className="lobby-container">
      {/* Background container */}
      <div className="lobby-background"></div>
      
      <div className="lobby-content">
        <div className="lobby-card">
          <h1 className="lobby-title">Game Lobby</h1>
          
          <div className="form-group">
            <label className="form-label">Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="form-input"
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Choose Character:</label>
            <div className="character-selection">
              <button
                className={`character-option ${playerType === 'knight' ? 'selected-knight' : ''}`}
                onClick={() => setPlayerType('knight')}
                disabled={loading}
              >
                <div className="character-name">Knight</div>
                <div className="character-description">Strong attacks, no magic</div>
              </button>
              <button
                className={`character-option ${playerType === 'wizard' ? 'selected-wizard' : ''}`}
                onClick={() => setPlayerType('wizard')}
                disabled={loading}
              >
                <div className="character-name">Wizard</div>
                <div className="character-description">Magic powers, can heal</div>
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <button
              onClick={createNewGame}
              disabled={loading}
              className="button button-create"
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </button>
            
            <div className="divider">OR</div>
            
            <div className="form-group">
              <label className="form-label">Join Existing Game:</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="form-input"
                disabled={loading || availableSessions.length === 0}
              >
                <option value="">Select a game</option>
                {availableSessions.map(sessionId => (
                  <option key={sessionId} value={sessionId}>
                    Session {sessionId.substring(0, 8)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={joinExistingGame}
              disabled={loading || !selectedSession}
              className="button button-join"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}