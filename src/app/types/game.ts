// src/app/types/game.ts
export enum AttackType {
  NORMAL = "NORMAL",
  SUPER = "SUPER",
  HEAL = "HEAL",
  FAILED = "FAILED"
}

export enum GameStatus {
  WAITING_FOR_PLAYERS = "WAITING_FOR_PLAYERS",
  IN_PROGRESS = "IN_PROGRESS",
  PLAYERS_WON = "PLAYERS_WON",
  ENEMY_WON = "ENEMY_WON"
}

export enum LootType {
  POTION = "POTION",
  MANA_POTION = "MANA_POTION"
}

export interface Character {
  type: string;
  name: string;
  pv: number;
}

export interface Player extends Character {
  experience: number;
}

export interface Knight extends Player {
  normalAttacksPerformed: number;
  superAttacksAvailable: number;
}

export interface Wizard extends Player {
  mp: number;
}

export interface Enemy extends Character {
  loot: LootType;
  hits: number;
  superAttackThreshold: number;
  isTwoPlayerGame: boolean;
}

export interface GameEvent {
  description: string;
  timestamp: string;
}

export interface GameSession {
  id: string;
  players: Player[];
  enemy: Enemy | null;
  status: GameStatus;
  currentPlayerIndex: number;
  enemyTurn: boolean;
  eventLog: GameEvent[];
}

export interface PlayerSelection {
  name: string;
  type: "knight" | "wizard";
}