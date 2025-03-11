/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/websocket.ts
import { Client } from '@stomp/stompjs';
import { GameSession, GameEvent } from '../types/game';

type GameUpdateCallback = (session: GameSession) => void;
type GameEventCallback = (event: GameEvent) => void;
type ConnectionStateCallback = (connected: boolean) => void;

class GameWebSocketService {
  private client: Client | null = null;
  private sessionId: string | null = null;
  private onGameUpdateCallback: GameUpdateCallback | null = null;
  private onGameEventCallback: GameEventCallback | null = null;
  private onConnectionStateChangeCallback: ConnectionStateCallback | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  connect(
    sessionId: string, 
    onGameUpdate: GameUpdateCallback, 
    onGameEvent: GameEventCallback,
    onConnectionStateChange?: ConnectionStateCallback
  ) {
    this.sessionId = sessionId;
    this.onGameUpdateCallback = onGameUpdate;
    this.onGameEventCallback = onGameEvent;
    
    if (onConnectionStateChange) {
      this.onConnectionStateChangeCallback = onConnectionStateChange;
    }

    // Close any existing connection
    if (this.client && this.client.active) {
      this.client.deactivate();
    }

    this.client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss://' : 'ws://'}`,
      connectHeaders: {
        session: sessionId,
      },
      debug: function(str) {
        // Uncomment for debugging
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
      this.reconnectAttempts = 0;
      
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(true);
      }
      
      // Subscribe to game updates
      this.client?.subscribe(`/topic/game/${sessionId}`, message => {
        if (this.onGameUpdateCallback && message.body) {
          try {
            const gameSession = JSON.parse(message.body) as GameSession;
            this.onGameUpdateCallback(gameSession);
          } catch (error) {
            console.error('Error parsing game update message:', error);
          }
        }
      });
      
      // Subscribe to game events
      this.client?.subscribe(`/topic/game/${sessionId}/events`, message => {
        if (this.onGameEventCallback && message.body) {
          try {
            const gameEvent = JSON.parse(message.body) as GameEvent;
            this.onGameEventCallback(gameEvent);
          } catch (error) {
            console.error('Error parsing game event message:', error);
          }
        }
      });

      // Subscribe to player actions to notify other players of changes
      this.client?.subscribe(`/topic/game/${sessionId}/actions`, message => {
        if (this.onGameUpdateCallback && message.body) {
          // Request the latest game state when an action occurs
          this.refreshGameState();
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error', frame);
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(false);
      }
      
      this.handleReconnect();
    };
    
    this.client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(false);
      }
      
      this.handleReconnect();
    };

    this.client.activate();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      if (this.reconnectInterval) {
        clearTimeout(this.reconnectInterval);
      }
      
      this.reconnectInterval = setTimeout(() => {
        if (this.sessionId) {
          this.client?.activate();
        }
      }, 3000);
    } else {
      console.error('Maximum reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.sessionId = null;
      this.onGameUpdateCallback = null;
      this.onGameEventCallback = null;
    }
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  // Method to manually request a game state refresh
  refreshGameState() {
    if (!this.client || !this.client.active || !this.sessionId) {
      return;
    }
    
    this.client.publish({
      destination: `/app/game/${this.sessionId}/refresh`,
      body: JSON.stringify({ timestamp: new Date().getTime() }),
    });
  }

  // Method to send a ping to keep connection alive
  sendPing() {
    if (!this.client || !this.client.active || !this.sessionId) {
      return;
    }

    this.client.publish({
      destination: `/app/game/${this.sessionId}/pong`,
      body: JSON.stringify({ timestamp: new Date().getTime() }),
    });
  }
}

// Create a singleton instance
const gameWebSocketService = new GameWebSocketService();
export default gameWebSocketService;