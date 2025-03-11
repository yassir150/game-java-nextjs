// src/app/api/gameApi.ts
import { GameSession, PlayerSelection, GameEvent } from '../types/game';

const API_URL = '//34.34.49.188:8080/api/game'; // Adjust to your backend URL

export const gameApi = {
  // Get available sessions
  async getAvailableSessions(): Promise<string[]> {
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Failed to get available sessions: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in getAvailableSessions: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Create a new game session
  async createSession(): Promise<GameSession> {
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in createSession: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Get a specific session
  async getSession(sessionId: string): Promise<GameSession> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Session not found: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in getSession: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Join a session with a player
  async joinSession(sessionId: string, player: PlayerSelection): Promise<GameSession> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
      });
      if (!response.ok) {
        throw new Error(`Failed to join session: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in joinSession: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Start the game
  async startGame(sessionId: string): Promise<GameSession> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/start`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to start game: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in startGame: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Perform normal attack
  async normalAttack(sessionId: string): Promise<GameEvent> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/attack`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to perform normal attack: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in normalAttack: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Perform super attack
  async superAttack(sessionId: string): Promise<GameEvent> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/super-attack`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to perform super attack: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in superAttack: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Perform heal (for wizard)
  async heal(sessionId: string, targetId: string): Promise<GameEvent> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/heal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetId }),
      });
      if (!response.ok) {
        throw new Error(`Failed to perform heal: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in heal: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Process enemy turn
  async enemyTurn(sessionId: string): Promise<GameEvent> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/enemy-turn`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to process enemy turn: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error in enemyTurn: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },
};