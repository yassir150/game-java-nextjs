/* eslint-disable react-hooks/exhaustive-deps */
// src/app/game/[sessionId]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { GameSession } from '@/app/types/game';
import { gameApi } from '@/app/api/gameApi';
import gameWebSocketService from '@/app/api/websocket';
import GameBoard from '@/app/components/GameBoard';
import Link from 'next/link';
import '../../styles/game.css';

export default function GamePage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Function to fetch the latest game session
  const fetchGameSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const data = await gameApi.getSession(sessionId as string);
      setSession(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setError('Failed to load game session.');
      return null;
    }
  }, [sessionId]);

  // Set up WebSocket connection and session data
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }

    const setupGameSession = async () => {
      try {
        if (!sessionId) {
          setError('Invalid session ID');
          setLoading(false);
          return;
        }
        
        const data = await fetchGameSession();
        if (!data) {
          setLoading(false);
          return;
        }
        
        // Connect to WebSocket for real-time updates
        gameWebSocketService.connect(
          sessionId as string,
          (updatedSession) => {
            console.log('Received game update via WebSocket');
            setSession(updatedSession);
          },
          (gameEvent) => {
            console.log('Game event:', gameEvent);
            // Play sound or show notification based on event type
            playGameSound(gameEvent.description);
          },
          (connected) => {
            setIsConnected(connected);
            if (!connected) {
              console.log('WebSocket disconnected, manual refresh may be needed');
            }
          }
        );
        
        setLoading(false);
      } catch (error) {
        console.error('Setup error:', error);
        setError('Failed to set up game session.');
        setLoading(false);
      }
    };

    setupGameSession();

    // Set up a ping interval to keep the connection alive
    const pingInterval = setInterval(() => {
      if (isConnected) {
        gameWebSocketService.sendPing();
      }
    }, 30000); // Send ping every 30 seconds

    // Cleanup WebSocket connection when component unmounts
    return () => {
      gameWebSocketService.disconnect();
      clearInterval(pingInterval);
    };
  }, [sessionId, fetchGameSession]);

  // Add a polling mechanism as a fallback for WebSocket
  useEffect(() => {
    // Only poll if we're in an active game and WebSocket is disconnected
    if (!isConnected && session?.status === 'IN_PROGRESS') {
      const pollingInterval = setInterval(() => {
        console.log('Polling for game updates...');
        fetchGameSession();
      }, 3000); // Poll every 3 seconds
      
      return () => clearInterval(pollingInterval);
    }
  }, [isConnected, session?.status, fetchGameSession]);

  // Simple function to play sounds based on game events
  const playGameSound = (eventDescription: string) => {
    // You can implement sounds for different events here
    if (eventDescription.includes('attacked')) {
      // Play attack sound
      const audio = new Audio('/sounds/attack.mp3');
      audio.play().catch(e => console.error('Error playing sound:', e));
    } else if (eventDescription.includes('healed')) {
      // Play heal sound
      const audio = new Audio('/sounds/heal.mp3');
      audio.play().catch(e => console.error('Error playing sound:', e));
    }
  };

  const handleStartGame = async () => {
    try {
      if (sessionId) {
        console.log("Starting game for session:", sessionId);
        setLoading(true);
        
        const updatedSession = await gameApi.startGame(sessionId as string);
        console.log("Game started, updated session:", updatedSession);
        
        setSession(updatedSession);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      if (error instanceof Error) {
        console.log("Error message:", error.message);
      }
      setLoading(false);
    }
  };

  const handleActionTaken = async () => {
    try {
      if (sessionId) {
        // Add a slight delay to allow the server to process the action
        setTimeout(async () => {
          const updatedSession = await fetchGameSession();
          if (updatedSession) {
            // After getting the updated session, trigger a refresh for other players
            gameWebSocketService.refreshGameState();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to refresh game state:', error);
    }
  };

  // Display connection status for debugging (can be removed in production)
  const connectionStatus = isConnected ? 
    <div className="connected-status">Connected</div> : 
    <div className="disconnected-status">Disconnected (Using Fallback)</div>;

  if (loading) {
    return (
      <div className="game-container">
        <div className="game-background"></div>
        <div className="game-content">
          <div className="game-card">
            <h1 className="game-title">Loading Game...</h1>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-container">
        <div className="game-background"></div>
        <div className="game-content">
          <div className="game-card">
            <h1 className="game-title">Error</h1>
            <p className="mb-6">{error}</p>
            <Link href="/lobby">
              <button className="button button-primary">
                Return to Lobby
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="game-container">
        <div className="game-background"></div>
        <div className="game-content">
          <div className="game-card">
            <h1 className="game-title">Session Not Found</h1>
            <Link href="/lobby">
              <button className="button button-primary">
                Return to Lobby
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If game is waiting for players and we're the host, show start button
  if (session.status === 'WAITING_FOR_PLAYERS' && session.players.length > 0 && session.players[0].name === playerName) {
    return (
      <div className="game-container">
        <div className="game-background"></div>
        <div className="game-content">
          <div className="game-card">
            <h1 className="game-title">Waiting for Players</h1>
            <p className="mb-4">Players in lobby: {session.players.length}</p>
            <p className="mb-6">You can start the game now or wait for another player to join.</p>
            <button
              onClick={handleStartGame}
              className="button button-success"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If game is waiting but we're not the host, just show waiting message
  if (session.status === 'WAITING_FOR_PLAYERS') {
    return (
      <div className="game-container">
        <div className="game-background"></div>
        <div className="game-content">
          <div className="game-card">
            <h1 className="game-title">Waiting for Host</h1>
            <p className="mb-4">Players in lobby: {session.players.length}</p>
            <p>The game host will start the game soon...</p>
            <div className="h-2 bg-blue-500 mt-4 rounded pulse-animation"></div>
          </div>
        </div>
      </div>
    );
  }

  // For the actual game, we need to wrap the GameBoard component
  // to maintain our background and layout consistency
  return (
    <div className="game-container">
      <div className="game-background"></div>
      <div className="game-content" style={{ padding: 0 }}>
        {connectionStatus /* Comment this out in production */}
        {/* Pass the GameBoard component the full width and height */}
        <GameBoard
          sessionId={sessionId as string}
          gameSession={session}
          onActionTaken={handleActionTaken}
          playerName={playerName}
        />
      </div>
    </div>
  );
}