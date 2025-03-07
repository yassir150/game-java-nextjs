// src/app/components/GameBoard.tsx
import { GameSession } from '../types/game';
import PlayerCard from './PlayerCard';
import EnemyCard from './EnemyCard';
import ActionPanel from './ActionPanel';
import EventLog from './EventLog';
import Image from 'next/image';

interface GameBoardProps {
  sessionId: string;
  gameSession: GameSession;
  onActionTaken: () => void;
  playerName: string;
}

export default function GameBoard({ 
  sessionId, 
  gameSession, 
  onActionTaken,
  playerName
}: GameBoardProps) {
  // Check if it's the current player's turn
  const isCurrentPlayer = 
    !gameSession.enemyTurn && 
    gameSession.players[gameSession.currentPlayerIndex]?.name === playerName;
  
  // Determine game status message
  let statusMessage = '';
  switch (gameSession.status) {
    case 'WAITING_FOR_PLAYERS':
      statusMessage = 'Waiting for players to join...';
      break;
    case 'IN_PROGRESS':
      statusMessage = 'Game in progress';
      break;
    case 'PLAYERS_WON':
      statusMessage = 'Victory! Players defeated the boss!';
      break;
    case 'ENEMY_WON':
      statusMessage = 'Game Over! Boss has defeated all players.';
      break;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center">Combat Arena</h1>
          <div className="bg-gray-800 rounded-lg p-2 text-center mt-2">
            <p className="text-lg">{statusMessage}</p>
          </div>
        </div>
        
        {/* Game area with background */}
        <div className="relative w-full rounded-lg overflow-hidden mb-6" style={{height: '500px'}}>
          {/* Battle background image */}
          <div className="absolute inset-0">
            <Image 
              src="/battleground.jpg" 
              alt="Battle Arena"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          {/* Game content overlay */}
          <div className="relative z-10 h-full flex flex-col justify-between p-4">
            {/* Enemy area (top) */}
            <div className="flex justify-center mb-10">
              {gameSession.enemy && (
                <div className="w-full max-w-sm">
                  <EnemyCard 
                    enemy={gameSession.enemy}
                    isEnemyTurn={gameSession.enemyTurn}
                  />
                </div>
              )}
            </div>
            
            {/* Players area (bottom) */}
            <div className="flex justify-around">
              {gameSession.players.map((player, index) => (
                <div key={player.name} className="w-full max-w-xs mx-2">
                  <PlayerCard 
                    player={player} 
                    isCurrentPlayer={!gameSession.enemyTurn && gameSession.currentPlayerIndex === index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Control and info area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action panel */}
          <div className="md:col-span-1">
            <ActionPanel 
              sessionId={sessionId}
              gameSession={gameSession}
              isCurrentPlayer={isCurrentPlayer}
              onActionTaken={onActionTaken}
            />
          </div>
          
          {/* Game log */}
          <div className="md:col-span-2">
            <EventLog events={gameSession.eventLog} />
          </div>
        </div>
        
        {/* Session info */}
        <div className="mt-4 text-sm text-gray-400 text-center">
          Session ID: {sessionId}
        </div>
      </div>
    </div>
  );
}