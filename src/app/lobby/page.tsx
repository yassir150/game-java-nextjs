// src/app/lobby/page.tsx
'use client';
import '../styles/lobby.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameApi } from '../api/gameApi';
import { PlayerSelection } from '../types/game';

export default function LobbyPage() {
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState<'knight' | 'wizard'>('knight');
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
      
      // Navigate to the game page
      router.push(`/game/${selectedSession}`);
    } catch (error) {
      console.error('Failed to join game:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Game Lobby</h1>
        
        <div className="mb-6">
          <label className="block mb-2">Your Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Choose Character:</label>
          <div className="flex gap-4">
            <button
              className={`flex-1 p-3 rounded flex flex-col items-center ${
                playerType === 'knight' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setPlayerType('knight')}
              disabled={loading}
            >
              <div className="font-bold">Knight</div>
              <div className="text-xs mt-1">Strong attacks, no magic</div>
            </button>
            <button
              className={`flex-1 p-3 rounded flex flex-col items-center ${
                playerType === 'wizard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setPlayerType('wizard')}
              disabled={loading}
            >
              <div className="font-bold">Wizard</div>
              <div className="text-xs mt-1">Magic powers, can heal</div>
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <button
            onClick={createNewGame}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-500 p-2 rounded font-bold mb-4"
          >
            {loading ? 'Creating...' : 'Create New Game'}
          </button>
          
          <div className="text-center font-bold my-2">OR</div>
          
          <div className="mb-4">
            <label className="block mb-2">Join Existing Game:</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
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
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-500 p-2 rounded font-bold"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  );
}