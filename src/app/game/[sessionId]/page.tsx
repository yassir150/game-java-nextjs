// src/app/game/[sessionId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GameSession } from '@/app/types/game';
import { gameApi } from '@/app/api/gameApi';
import gameWebSocketService from '@/app/api/websocket';
import GameBoard from '@/app/components/GameBoard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GamePage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerName, setPlayerName] = useState('');

  // Get session data and set up WebSocket connection
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }

    const fetchSession = async () => {
      try {
        if (!sessionId) {
          setError('Invalid session ID');
          return;
        }
        
        const data = await gameApi.getSession(sessionId as string);
        setSession(data);
        
        // Connect to WebSocket for real-time updates
        gameWebSocketService.connect(
          sessionId as string,
          (updatedSession) => {
            setSession(updatedSession);
          },
          (gameEvent) => {
            console.log('Game event:', gameEvent);
            // You might want to show notifications or sounds here
          }
        );
        
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setError('Failed to load game session.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Cleanup WebSocket connection when component unmounts
    return () => {
      gameWebSocketService.disconnect();
    };
  }, [sessionId]);

  const handleStartGame = async () => {
    try {
      if (sessionId) {
        await gameApi.startGame(sessionId as string);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleActionTaken = async () => {
    try {
      if (sessionId) {
        const updatedSession = await gameApi.getSession(sessionId as string);
        setSession(updatedSession);
      }
    } catch (error) {
      console.error('Failed to refresh game state:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Game...</h1>
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <Link href="/lobby">
            <div className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded">
              Return to Lobby
            </div>
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Session Not Found</h1>
          <Link href="/lobby">
            <div className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded">
              Return to Lobby
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // If game is waiting for players and we're the host, show start button
  if (session.status === 'WAITING_FOR_PLAYERS' && session.players.length > 0 && session.players[0].name === playerName) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center bg-gray-800 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">Waiting for Players</h1>
          <p className="mb-4">Players in lobby: {session.players.length}</p>
          <p className="mb-6">You can start the game now or wait for another player to join.</p>
          <button
            onClick={handleStartGame}
            className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // If game is waiting but we're not the host, just show waiting message
  if (session.status === 'WAITING_FOR_PLAYERS') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center bg-gray-800 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">Waiting for Host</h1>
          <p className="mb-4">Players in lobby: {session.players.length}</p>
          <p>The game host will start the game soon...</p>
          <div className="animate-pulse mt-4 bg-blue-500 h-2 rounded"></div>
        </div>
      </div>
    );
  }

  return <GameBoard sessionId={sessionId as string} gameSession={session} onActionTaken={handleActionTaken} playerName={playerName} />;
}