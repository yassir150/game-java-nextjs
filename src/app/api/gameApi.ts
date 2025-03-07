// src/app/api/gameApi.ts
import { GameSession, PlayerSelection, GameEvent } from '../types/game';

const API_URL = 'http://localhost:8080/api/game'; // Adjust to your backend URL

export const gameApi = {
  // Get available sessions
  async getAvailableSessions(): Promise<string[]> {
    const response = await fetch(`${API_URL}/sessions`);
    return response.json();
  },

  // Create a new game session
  async createSession(): Promise<GameSession> {
    const response = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
    });
    return response.json();
  },

  // Get a specific session
  async getSession(sessionId: string): Promise<GameSession> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Session not found');
    }
    return response.json();
  },

  // Join a session with a player
  async joinSession(sessionId: string, player: PlayerSelection): Promise<GameSession> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(player),
    });
    return response.json();
  },

  // Start the game
  async startGame(sessionId: string): Promise<GameSession> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/start`, {
      method: 'POST',
    });
    return response.json();
  },

  // Perform normal attack
  async normalAttack(sessionId: string): Promise<GameEvent> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/attack`, {
      method: 'POST',
    });
    return response.json();
  },

  // Perform super attack
  async superAttack(sessionId: string): Promise<GameEvent> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/super-attack`, {
      method: 'POST',
    });
    return response.json();
  },

  // Perform heal (for wizard)
  async heal(sessionId: string, targetId: string): Promise<GameEvent> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/heal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetId }),
    });
    return response.json();
  },

  // Process enemy turn
  async enemyTurn(sessionId: string): Promise<GameEvent> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/actions/enemy-turn`, {
      method: 'POST',
    });
    return response.json();
  },
};