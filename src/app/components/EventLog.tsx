// src/app/components/EventLog.tsx
import { GameEvent } from '../types/game';

interface EventLogProps {
  events: GameEvent[];
}

export default function EventLog({ events }: EventLogProps) {
  // Show only last 10 events, most recent first
  const recentEvents = [...events].reverse().slice(0, 10);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg h-56 overflow-y-auto">
      <h3 className="text-xl font-bold mb-2">Event Log</h3>
      
      {recentEvents.length === 0 ? (
        <p className="text-gray-400 text-center">No events yet...</p>
      ) : (
        <ul className="space-y-2">
          {recentEvents.map((event, index) => (
            <li key={index} className="border-b border-gray-700 pb-2">
              <p className="text-sm">{event.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}