// src/app/api/websocket.ts
import { Client } from '@stomp/stompjs';
import { GameSession, GameEvent } from '../types/game';

type GameUpdateCallback = (session: GameSession) => void;
type GameEventCallback = (event: GameEvent) => void;

class GameWebSocketService {
  private client: Client | null = null;
  private sessionId: string | null = null;
  private onGameUpdateCallback: GameUpdateCallback | null = null;
  private onGameEventCallback: GameEventCallback | null = null;

  connect(sessionId: string, onGameUpdate: GameUpdateCallback, onGameEvent: GameEventCallback) {
    this.sessionId = sessionId;
    this.onGameUpdateCallback = onGameUpdate;
    this.onGameEventCallback = onGameEvent;

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/game-websocket', // Adjust to your backend URL
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to game updates
      this.client?.subscribe(`/topic/game/${sessionId}`, message => {
        if (this.onGameUpdateCallback && message.body) {
          const gameSession = JSON.parse(message.body) as GameSession;
          this.onGameUpdateCallback(gameSession);
        }
      });
      
      // Subscribe to game events
      this.client?.subscribe(`/topic/game/${sessionId}/events`, message => {
        if (this.onGameEventCallback && message.body) {
          const gameEvent = JSON.parse(message.body) as GameEvent;
          this.onGameEventCallback(gameEvent);
        }
      });

      // Send a ping to test connection
      this.client?.publish({
        destination: `/app/game/${sessionId}/ping`,
        body: JSON.stringify({ message: 'ping' }),
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.sessionId = null;
      this.onGameUpdateCallback = null;
      this.onGameEventCallback = null;
    }
  }
}

const gameWebSocketService = new GameWebSocketService();
export default gameWebSocketService;