// src/app/components/PlayerCard.tsx
import { Wizard, Knight, Player } from '../types/game';
import Image from 'next/image';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  animationState: 'idle' | 'attack' | 'holy-attack' | 'attacked' | 'heal' | 'death';
  playerName?: string; // Add the current user's name as a prop
}

export default function PlayerCard({ 
  player, 
  isCurrentPlayer, 
  animationState = 'idle',
  playerName = '' // Default to empty string
}: PlayerCardProps) {
  // Check player type
  const isWizard = 'mp' in player;
  const isKnight = 'superAttacksAvailable' in player;
  
  // Cast to specific type if needed
  const wizard = isWizard ? player as Wizard : null;
  const knight = isKnight ? player as Knight : null;
  
  // Calculate health percentage
  const healthPercentage = Math.max(0, Math.min(100, (player.pv / 100) * 100));
  
  // Get the appropriate image based on character type and animation state
  const getCharacterImage = () => {
    if (isWizard) {
      // Wizard animations
      switch (animationState) {
        case 'attack':
          return "/assets/wizard/wizard-attack.gif";
        case 'holy-attack':
          return "/assets/wizard/wizard-super-attack.gif";
        case 'attacked':
          return "/assets/wizard/wizard-attacked.gif";
        case 'heal':
          return "/assets/wizard/wizard-super-attack.gif";
        case 'death':
          return "/assets/wizard/wizard-death.gif";
        case 'idle':
        default:
          return "/assets/wizard/wizard-idle.gif";
      }
    } else {
      // Knight animations
      switch (animationState) {
        case 'attack':
          return "/assets/king/king-attack.gif";
        case 'holy-attack':
          return "/assets/king/king-holy-attack.gif";
        case 'attacked':
          return "/assets/king/king-attacked.gif";
        case 'death':
          return "/assets/king/king-death.gif";
        case 'idle':
        default:
          return "/assets/king/king-idle.gif";
      }
    }
  };
  
  return (
    <div className={`player-card ${isCurrentPlayer ? 'current-player' : ''}`}>
      <div className="player-image">
        <Image 
          src={getCharacterImage()}
          alt={player.name}
          width={250}
          height={250}
          priority
        />
      </div>
      
      <div className="player-header">
        <div className="player-info">
          <h3 className="player-name">{player.name}</h3>
          <div className="player-class">{isWizard ? 'Wizard' : 'Knight'}</div>
        </div>
      </div>
      
      <div className="stat-container">
        <div className="stat-row">
          <span>HP: {player.pv}/100</span>
          <span>EXP: {player.experience}</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar ${healthPercentage > 50 ? 'health-high' : healthPercentage > 25 ? 'health-medium' : 'health-low'}`} 
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {wizard && (
        <div className="stat-container">
          <div className="stat-row">
            <span>MP: {wizard.mp}/100</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar mana-bar" 
              style={{ width: `${wizard.mp}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {knight && knight.superAttacksAvailable > 0 && (
        <div className="super-attack-counter">
          Super Attacks Available: {knight.superAttacksAvailable}
        </div>
      )}
      
      {isCurrentPlayer && (
        <div className="turn-indicator">
          {player.name === playerName ? "Your Turn" : `${player.name}'s Turn`}
        </div>
      )}
    </div>
  );
}