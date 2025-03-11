// src/app/components/EventLog.tsx
import { GameEvent } from '../types/game';
import '../styles/eventLog.css';

interface EventLogProps {
  events: GameEvent[];
}

export default function EventLog({ events }: EventLogProps) {
  // Function to determine event type class
  const getEventTypeClass = (description: string): string => {
    if (description.includes('enemy') || description.includes('boss')) {
      return 'enemy-event';
    } else if (description.includes('player') || description.includes('attacked')) {
      return 'player-event';
    }
    return 'system-event';
  };

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="event-log">
      <h3 className="event-log-title">Battle Log</h3>
      <div className="event-log-entries">
        {events.length === 0 ? (
          <p className="no-events">No events yet.</p>
        ) : (
          events.map((event, index) => (
            <div 
              key={index} 
              className={`event-entry ${getEventTypeClass(event.description)}`}
            >
              <div className="event-timestamp">{formatTime(Number(event.timestamp))}</div>
              <div className="event-description">{event.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}