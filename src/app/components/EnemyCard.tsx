// src/app/components/EnemyCard.tsx
import { Enemy } from '../types/game';
import Image from 'next/image';

interface EnemyCardProps {
  enemy: Enemy;
  isEnemyTurn: boolean;
}

export default function EnemyCard({ enemy, isEnemyTurn }: EnemyCardProps) {
  // Calculate max HP based on game type
  const maxHp = enemy.isTwoPlayerGame ? 180 : 120;
  
  // Calculate health percentage
  const healthPercentage = Math.max(0, Math.min(100, (enemy.pv / maxHp) * 100));
  
  // Calculate super attack progress
  const superAttackProgress = (enemy.hits / enemy.superAttackThreshold) * 100;
  
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${isEnemyTurn ? 'ring-2 ring-red-500' : ''}`}>
      <div className="flex items-center mb-2 gap-3">
        <div className="relative w-20 h-20 overflow-hidden rounded-full">
          <Image 
            src="/boss.png"
            alt={enemy.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-400">{enemy.name}</h3>
          <div className="text-sm text-gray-300">Boss</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>HP: {enemy.pv}/{maxHp}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full bg-red-600`} 
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Super Attack: {enemy.hits}/{enemy.superAttackThreshold} hits</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-orange-500" 
            style={{ width: `${superAttackProgress}%` }}
          ></div>
        </div>
      </div>
      
      {isEnemyTurn && (
        <div className="bg-red-700 text-center text-sm py-1 rounded mt-2">
          Enemy Turn
        </div>
      )}
    </div>
  );
}