import type { SelectedMovie } from "../models/types";
import { getTimeDifference } from "../utils/helper";

interface ItineraryProps {
  first: SelectedMovie;
  second: SelectedMovie;
  theatreName: string;
  onReset: () => void;
}

export const Itinerary = ({ first, second, theatreName, onReset }: ItineraryProps) => {
  // Logic remains the same
  const gapMs = getTimeDifference(first.endTime, second.time);
  const gapMinutes = Math.round(gapMs / 60000);

  const totalMs = getTimeDifference(first.time, second.endTime);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMins = Math.round((totalMs % 3600000) / 60000);

  const formattedDate = new Date(first.date + 'T00:00:00').toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="ticket-container fade-in">
      <div className="ticket">
        {/* Header Section */}
        <div className="ticket-header">
          <div className="ticket-cinema">{theatreName}</div>
          <div className="ticket-admit">DOUBLE FEATURE</div>
          <div className="ticket-date-display">{formattedDate}</div>
        </div>

        {/* Perforated Divider with Intermission Badge */}
        <div className="ticket-divider">
          <div className="intermission-badge">{gapMinutes}M INTERMISSION</div>
        </div>

        {/* Main Features */}
        <div className="ticket-body">
          <div className="ticket-event">
            <span className="event-label">First Feature</span>
            <div className="event-row">
              <span className="event-title">{first.title}</span>
              <span className="event-time">{first.time}</span>
            </div>
          </div>

          <div className="ticket-event">
            <span className="event-label">Second Feature</span>
            <div className="event-row">
              <span className="event-title">{second.title}</span>
              <span className="event-time">{second.time}</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="ticket-stats">
            <div className="stat-row">
              <span>Leaving Time:</span>
              <strong>{second.endTime}</strong>
            </div>
            <div className="stat-row">
              <span>Total Duration:</span>
              <strong>{totalHours}h {totalMins}m</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ticket-footer">
          <button className="ticket-reset" onClick={onReset}>
            BOOK ANOTHER DAY
          </button>
        </div>
      </div>
    </div>
  );
};
