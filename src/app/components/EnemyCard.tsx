// src/app/components/EnemyCard.tsx
import { Enemy } from '../types/game';
import Image from 'next/image';

interface EnemyCardProps {
  enemy: Enemy;
  isEnemyTurn: boolean;
  animationState: 'idle' | 'attack' | 'attacked' | 'death';
  playerCount?: number; // Add playerCount as a prop
}

export default function EnemyCard({ 
  enemy, 
  isEnemyTurn, 
  animationState = 'idle',
  playerCount = 1 // Default to 1 player
}: EnemyCardProps) {
  // Calculate max HP based on actual player count
  const maxHp = playerCount >= 2 ? 180 : 120;
  
  // Calculate health percentage
  const healthPercentage = Math.max(0, Math.min(100, (enemy.pv / maxHp) * 100));
  
  // Calculate super attack progress
  const superAttackProgress = (enemy.hits / enemy.superAttackThreshold) * 100;
  
  // Get the appropriate image based on animation state
  const getEnemyImage = () => {
    switch (animationState) {
      case 'attack':
        // Randomly choose between attack1 and attack2 animations
        return Math.random() > 0.5 
          ? "/assets/cthulu/cthulu-attack-1.gif" 
          : "/assets/cthulu/cthulu-attack-2.gif";
      case 'attacked':
        return "/assets/cthulu/cthulu-attacked.gif";
      case 'death':
        return "/assets/cthulu/cthulu-death.gif";
      case 'idle':
      default:
        return "/assets/cthulu/cthulu-idle.gif";
    }
  };
  
  return (
    <div className={`enemy-card ${isEnemyTurn ? 'enemy-turn' : ''}`}>
      <div className="enemy-image">
        <Image 
          src={getEnemyImage()}
          alt={enemy.name}
          width={600}
          height={600}
          priority
        />
      </div>
      
      <div className="enemy-header">
        <div className="enemy-info">
          <h3 className="enemy-name">{enemy.name}</h3>
          <div className="enemy-class">Boss</div>
        </div>
      </div>
      
      <div className="stat-container">
        <div className="stat-row">
          <span>HP: {enemy.pv}/{maxHp}</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar enemy-health-bar" 
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="stat-container">
        <div className="stat-row">
          <span>Super Attack: {enemy.hits}/{enemy.superAttackThreshold} hits</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar super-attack-bar" 
            style={{ width: `${superAttackProgress}%` }}
          ></div>
        </div>
      </div>
      
      {isEnemyTurn && (
        <div className="enemy-turn-indicator">
          Enemy Turn
        </div>
      )}
    </div>
  );
}