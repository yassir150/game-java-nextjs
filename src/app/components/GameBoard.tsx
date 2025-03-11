// src/app/components/GameBoard.tsx
import { useState, useEffect } from 'react';
import { GameSession } from '../types/game';
import PlayerCard from './PlayerCard';
import EnemyCard from './EnemyCard';
import ActionPanel from './ActionPanel';
import EventLog from './EventLog';
import '../styles/gameBoard.css';

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
  // Animation states
  const [playerAnimations, setPlayerAnimations] = useState<{[key: string]: string}>({});
  const [enemyAnimation, setEnemyAnimation] = useState<string>('idle');
  const [lastActionPlayer, setLastActionPlayer] = useState<string | null>(null);
  
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
  
  // Reset animations when current player changes
  useEffect(() => {
    if (!gameSession.enemyTurn && gameSession.currentPlayerIndex >= 0) {
      const currentPlayerName = gameSession.players[gameSession.currentPlayerIndex]?.name;
      
      // Only reset animations if the player has changed
      if (lastActionPlayer !== null && lastActionPlayer !== currentPlayerName) {
        setPlayerAnimations({});
        setEnemyAnimation('idle');
      }
      
      // Update the last action player
      setLastActionPlayer(currentPlayerName);
    }
  }, [gameSession.currentPlayerIndex, gameSession.enemyTurn, gameSession.players, lastActionPlayer]);
  
  // Function to handle animations for attacks
  const handleActionAnimation = (actionType: 'normal' | 'super' | 'heal', playerIndex: number) => {
    const player = gameSession.players[playerIndex];
    const playerName = player.name;
    const isWizard = 'mp' in player;
    
    // Set animation ONLY for the active player
    // Reset all player animations to idle first
    const newAnimations: {[key: string]: string} = {};
    gameSession.players.forEach(p => {
      newAnimations[p.name] = 'idle';
    });
    
    // Set animation based on player type and action for the active player only
    const animationType = isWizard ? 
      (actionType === 'heal' ? 'heal' : actionType === 'super' ? 'holy-attack' : 'attack') :
      (actionType === 'super' ? 'holy-attack' : 'attack');
    
    // Update animation ONLY for the player taking the action
    newAnimations[playerName] = animationType;
    setPlayerAnimations(newAnimations);
    
    // Set enemy to "attacked" animation if it's an attack
    if (actionType !== 'heal') {
      setEnemyAnimation('attacked');
    }
    
    // Reset animations after a delay
    setTimeout(() => {
      const resetAnimations: {[key: string]: string} = {};
      gameSession.players.forEach(p => {
        resetAnimations[p.name] = 'idle';
      });
      setPlayerAnimations(resetAnimations);
      setEnemyAnimation('idle');
    }, 1500); // Animation duration
  };
  
  // Function to handle enemy attack animations
  const handleEnemyAttackAnimation = () => {
    // Set enemy to "attack" animation
    setEnemyAnimation('attack');
    
    // Set all players to "attacked" animation
    const attackedPlayers: {[key: string]: string} = {};
    gameSession.players.forEach(p => {
      attackedPlayers[p.name] = 'attacked';
    });
    
    setPlayerAnimations(attackedPlayers);
    
    // Reset animations after a delay
    setTimeout(() => {
      setEnemyAnimation('idle');
      
      const idlePlayers: {[key: string]: string} = {};
      gameSession.players.forEach(p => {
        idlePlayers[p.name] = 'idle';
      });
      
      setPlayerAnimations(idlePlayers);
    }, 1500); // Animation duration
  };
  
  // Enhanced onActionTaken function to handle animations
  const handleActionTaken = (actionType?: 'normal' | 'super' | 'heal') => {
    if (actionType && !gameSession.enemyTurn && gameSession.currentPlayerIndex >= 0) {
      // If it's a player action, animate accordingly
      handleActionAnimation(actionType, gameSession.currentPlayerIndex);
    } else if (gameSession.enemyTurn) {
      // If it's the enemy's turn
      handleEnemyAttackAnimation();
    }
    
    // Call the original onActionTaken after animation delay
    setTimeout(() => {
      onActionTaken();
    }, 1500);
  };

  // Function to get animation state for a player
  const getPlayerAnimationState = (playerName: string) => {
    return playerAnimations[playerName] || 'idle';
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">Combat Arena</h1>
        <div className="board-status-bar">
          <p className="board-status">{statusMessage}</p>
        </div>
      </div>
      
      {/* New layout with side panels */}
      <div className="game-layout">
        {/* Left side - Action Panel */}
        <div className="game-sidebar left-sidebar">
          <ActionPanel 
            sessionId={sessionId}
            gameSession={gameSession}
            isCurrentPlayer={isCurrentPlayer}
            onActionTaken={handleActionTaken}
          />
        </div>
        
        {/* Center - Characters */}
        <div className="game-center">
          {/* Characters in a single row */}
          <div className="characters-row">
            {/* First Player (if exists) */}
            {gameSession.players.length > 0 && (
              <div className="character-card-container">
                <PlayerCard 
                  player={gameSession.players[0]} 
                  isCurrentPlayer={!gameSession.enemyTurn && gameSession.currentPlayerIndex === 0}
                  animationState={getPlayerAnimationState(gameSession.players[0].name)}
                  playerName={playerName}
                />
              </div>
            )}
            
            {/* Second Player (if exists) */}
            {gameSession.players.length > 1 && (
              <div className="character-card-container">
                <PlayerCard 
                  player={gameSession.players[1]} 
                  isCurrentPlayer={!gameSession.enemyTurn && gameSession.currentPlayerIndex === 1}
                  animationState={getPlayerAnimationState(gameSession.players[1].name)}
                  playerName={playerName}
                />
              </div>
            )}

            {/* Enemy in the middle */}
            {gameSession.enemy && (
              <div className="character-card-container enemy-container">
                <EnemyCard 
                  enemy={gameSession.enemy}
                  isEnemyTurn={gameSession.enemyTurn}
                  animationState={enemyAnimation}
                  playerCount={gameSession.players.length}
                />
              </div>
            )}
          </div>
          
          {/* Session info */}
          <div className="session-info">
            Session ID: {sessionId}
          </div>
        </div>
        
        {/* Right side - Event Log */}
        <div className="game-sidebar right-sidebar">
          <EventLog events={gameSession.eventLog} />
        </div>
      </div>
    </div>
  );
}