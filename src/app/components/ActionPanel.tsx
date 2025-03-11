/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/components/ActionPanel.tsx
import { useState, useEffect } from 'react';
import { GameSession, Player, Wizard } from '../types/game';
import { gameApi } from '../api/gameApi';
import '../styles/actionPanel.css';

interface ActionPanelProps {
  sessionId: string;
  gameSession: GameSession;
  isCurrentPlayer: boolean;
  onActionTaken: (actionType?: 'normal' | 'super' | 'heal') => void;
}

export default function ActionPanel({ 
  sessionId, 
  gameSession, 
  isCurrentPlayer, 
  onActionTaken
}: ActionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [selectedHealTarget, setSelectedHealTarget] = useState<string>('');
  const [processingEnemyTurn, setProcessingEnemyTurn] = useState(false);
  const [enemyTurnCountdown, setEnemyTurnCountdown] = useState(0);
  
  // Check if game is over
  const isGameOver = gameSession.status === 'PLAYERS_WON' || gameSession.status === 'ENEMY_WON';
  
  // Process enemy turn automatically after player's action
  useEffect(() => {
    if (gameSession.enemyTurn && !processingEnemyTurn && enemyTurnCountdown === 0 && !isGameOver) {
      // Start 3-second countdown for enemy turn
      setProcessingEnemyTurn(true);
      setEnemyTurnCountdown(3);
    }
  }, [gameSession.enemyTurn, processingEnemyTurn, enemyTurnCountdown, isGameOver]);
  
  // Countdown timer for enemy turn
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (enemyTurnCountdown > 0 && !isGameOver) {
      timer = setTimeout(() => {
        setEnemyTurnCountdown(prev => prev - 1);
      }, 1000);
    } else if (enemyTurnCountdown === 0 && processingEnemyTurn && !isGameOver) {
      // Process enemy turn after countdown reaches 0
      handleEnemyTurn();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enemyTurnCountdown, processingEnemyTurn, isGameOver]);
  
  // Handle enemy turn processing
  const handleEnemyTurn = async () => {
    if (isGameOver) return;
    
    try {
      await gameApi.enemyTurn(sessionId);
      onActionTaken();
    } catch (error) {
      console.error('Failed to process enemy turn:', error);
    } finally {
      setProcessingEnemyTurn(false);
    }
  };
  
  // Handle normal attack
  const handleNormalAttack = async () => {
    if (isGameOver) return;
    
    setLoading(true);
    try {
      await gameApi.normalAttack(sessionId);
      onActionTaken('normal'); // Pass the action type
    } catch (error) {
      console.error('Failed to perform normal attack:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle super attack
  const handleSuperAttack = async () => {
    if (isGameOver) return;
    
    setLoading(true);
    try {
      await gameApi.superAttack(sessionId);
      onActionTaken('super'); // Pass the action type
    } catch (error) {
      console.error('Failed to perform super attack:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle heal (for Wizard)
  const handleHeal = async () => {
    if (!selectedHealTarget || isGameOver) return;
    
    setLoading(true);
    try {
      await gameApi.heal(sessionId, selectedHealTarget);
      onActionTaken('heal'); // Pass the action type
    } catch (error) {
      console.error('Failed to perform heal:', error);
    } finally {
      setLoading(false);
      setSelectedHealTarget('');
    }
  };

  // If game is over, show result message
  if (isGameOver) {
    return (
      <div className="action-panel">
        <h3 className={gameSession.status === 'PLAYERS_WON' ? "victory-title" : "defeat-title"}>
          {gameSession.status === 'PLAYERS_WON' ? 'Victory!' : 'Game Over!'}
        </h3>
        <p className="game-over-message">
          {gameSession.status === 'PLAYERS_WON' 
            ? 'You have defeated the boss!' 
            : 'The boss has defeated all players!'}
        </p>
        <div className="action-button return-button">
          <a href="/lobby" className="button-link">Return to Lobby</a>
        </div>
      </div>
    );
  }
  
  // If it's not the current player's turn
  if (!isCurrentPlayer && !gameSession.enemyTurn) {
    return (
      <div className="action-panel">
        <p className="waiting-message">Waiting for other player to act...</p>
      </div>
    );
  }
  
  // If it's the enemy's turn
  if (gameSession.enemyTurn) {
    return (
      <div className="action-panel">
        <h3 className="enemy-turn-title">Enemy Turn</h3>
        {processingEnemyTurn ? (
          <div className="centered-content">
            <p className="enemy-preparing">Enemy is preparing to attack...</p>
            <div className="countdown-display">
              <span className="countdown-number">{enemyTurnCountdown}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(enemyTurnCountdown / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <button
            disabled={true}
            className="action-button disabled-button"
          >
            Waiting for enemy attack...
          </button>
        )}
      </div>
    );
  }
  
  // Current player's turn - display action options
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  const isWizard = 'mp' in currentPlayer;
  const isKnight = 'superAttacksAvailable' in currentPlayer;
  const wizard = isWizard ? currentPlayer as Wizard : null;
  
  return (
    <div className="action-panel">
      <h3 className="action-title">Your Actions</h3>
      
      <div className="actions-container">
        <button
          onClick={handleNormalAttack}
          disabled={loading || isGameOver}
          className="action-button normal-attack"
        >
          Normal Attack
        </button>
        
        {isKnight && (
          <button
            onClick={handleSuperAttack}
            disabled={loading || (currentPlayer as any).superAttacksAvailable <= 0 || isGameOver}
            className={
              (currentPlayer as any).superAttacksAvailable > 0 && !isGameOver
                ? "action-button super-attack-knight" 
                : "action-button disabled-special"
            }
          >
            Super Attack {(currentPlayer as any).superAttacksAvailable > 0 ? 
              `(${(currentPlayer as any).superAttacksAvailable} available)` : 
              '(Not Available)'}
          </button>
        )}
        
        {isWizard && (
          <>
            <button
              onClick={handleSuperAttack}
              disabled={loading || wizard!.mp < 40 || isGameOver}
              className={
                wizard!.mp >= 40 && !isGameOver
                  ? "action-button super-attack-wizard"
                  : "action-button disabled-special"
              }
            >
              Super Attack (40 MP) {wizard!.mp < 40 ? '- Not enough MP' : ''}
            </button>
            
            <div className="heal-section">
              <select
                value={selectedHealTarget}
                onChange={(e) => setSelectedHealTarget(e.target.value)}
                className="heal-select"
                disabled={loading || wizard!.mp < 30 || isGameOver}
              >
                <option value="">Select heal target</option>
                {gameSession.players.map(player => (
                  <option key={player.name} value={player.name}>
                    {player.name} ({player.pv} HP)
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleHeal}
                disabled={loading || !selectedHealTarget || wizard!.mp < 30 || isGameOver}
                className={
                  wizard!.mp >= 30 && selectedHealTarget && !isGameOver
                    ? "action-button heal-button"
                    : "action-button disabled-special"
                }
              >
                Heal (30 MP) {wizard!.mp < 30 ? '- Not enough MP' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}