// src/app/components/ActionPanel.tsx
import { useState } from 'react';
import { GameSession, Player, Wizard } from '../types/game';
import { gameApi } from '../api/gameApi';

interface ActionPanelProps {
  sessionId: string;
  gameSession: GameSession;
  isCurrentPlayer: boolean;
  onActionTaken: () => void;
}

export default function ActionPanel({ 
  sessionId, 
  gameSession, 
  isCurrentPlayer, 
  onActionTaken
}: ActionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [selectedHealTarget, setSelectedHealTarget] = useState<string>('');
  
  if (!isCurrentPlayer) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-gray-400 text-center">Waiting for other player or enemy to act...</p>
      </div>
    );
  }
  
  if (gameSession.enemyTurn) {
    const handleEnemyTurn = async () => {
      setLoading(true);
      try {
        await gameApi.enemyTurn(sessionId);
        onActionTaken();
      } catch (error) {
        console.error('Failed to process enemy turn:', error);
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-red-400 text-center">Enemy Turn</h3>
        <button
          onClick={handleEnemyTurn}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-bold"
        >
          {loading ? 'Processing...' : 'Process Enemy Attack'}
        </button>
      </div>
    );
  }
  
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  const isWizard = 'mp' in currentPlayer;
  const isKnight = 'superAttacksAvailable' in currentPlayer;
  const wizard = isWizard ? currentPlayer as Wizard : null;
  
  const handleNormalAttack = async () => {
    setLoading(true);
    try {
      await gameApi.normalAttack(sessionId);
      onActionTaken();
    } catch (error) {
      console.error('Failed to perform normal attack:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuperAttack = async () => {
    setLoading(true);
    try {
      await gameApi.superAttack(sessionId);
      onActionTaken();
    } catch (error) {
      console.error('Failed to perform super attack:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleHeal = async () => {
    if (!selectedHealTarget || !isWizard) return;
    
    setLoading(true);
    try {
      await gameApi.heal(sessionId, selectedHealTarget);
      onActionTaken();
    } catch (error) {
      console.error('Failed to perform heal:', error);
    } finally {
      setLoading(false);
      setSelectedHealTarget('');
    }
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Your Actions</h3>
      
      <div className="space-y-3">
        <button
          onClick={handleNormalAttack}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg"
        >
          Normal Attack
        </button>
        
        {isKnight && (
          <button
            onClick={handleSuperAttack}
            disabled={loading || (currentPlayer as any).superAttacksAvailable <= 0}
            className={`w-full py-2 px-4 rounded-lg ${
              (currentPlayer as any).superAttacksAvailable > 0 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
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
              disabled={loading || wizard!.mp < 40}
              className={`w-full py-2 px-4 rounded-lg ${
                wizard!.mp >= 40
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Super Attack (40 MP) {wizard!.mp < 40 ? '- Not enough MP' : ''}
            </button>
            
            <div className="mt-4">
              <select
                value={selectedHealTarget}
                onChange={(e) => setSelectedHealTarget(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded mb-2"
                disabled={loading || wizard!.mp < 30}
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
                disabled={loading || !selectedHealTarget || wizard!.mp < 30}
                className={`w-full py-2 px-4 rounded-lg ${
                  wizard!.mp >= 30 && selectedHealTarget
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
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