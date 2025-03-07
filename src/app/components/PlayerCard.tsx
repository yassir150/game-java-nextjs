// src/app/components/PlayerCard.tsx
import { Wizard, Knight, Player } from '../types/game';
import Image from 'next/image';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export default function PlayerCard({ player, isCurrentPlayer }: PlayerCardProps) {
  // Check player type
  const isWizard = 'mp' in player;
  const isKnight = 'superAttacksAvailable' in player;
  
  // Cast to specific type if needed
  const wizard = isWizard ? player as Wizard : null;
  const knight = isKnight ? player as Knight : null;
  
  // Calculate health percentage
  const healthPercentage = Math.max(0, Math.min(100, (player.pv / 100) * 100));
  
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-center mb-2 gap-3">
        <div className="relative w-16 h-16 overflow-hidden rounded-full">
          <Image 
            src={isWizard ? "/wizard.png" : "/knight.png"}
            alt={player.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-bold">{player.name}</h3>
          <div className="text-sm text-gray-300">{isWizard ? 'Wizard' : 'Knight'}</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>HP: {player.pv}/100</span>
          <span>EXP: {player.experience}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${healthPercentage > 50 ? 'bg-green-600' : healthPercentage > 25 ? 'bg-yellow-400' : 'bg-red-500'}`} 
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {wizard && (
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>MP: {wizard.mp}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-blue-500" 
              style={{ width: `${wizard.mp}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {knight && knight.superAttacksAvailable > 0 && (
        <div className="text-sm text-yellow-400 mt-2">
          Super Attacks Available: {knight.superAttacksAvailable}
        </div>
      )}
      
      {isCurrentPlayer && (
        <div className="bg-yellow-700 text-center text-sm py-1 rounded mt-2">
          Your Turn
        </div>
      )}
    </div>
  );
}