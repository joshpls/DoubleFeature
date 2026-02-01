import type { SelectedMovie } from "../models/types";
import { getTimeDifference } from "../utils/helper";
import './Itinerary.css'; // Import the external CSS file

interface ItineraryProps {
  first: SelectedMovie;
  second: SelectedMovie;
  theatreName: string;
  onReset: () => void;
}

export const Itinerary = ({ first, second, theatreName, onReset }: ItineraryProps) => {
  // Calculate Gap
  const gapMs = getTimeDifference(first.endTime, second.time);
  const gapMinutes = Math.round(gapMs / 60000);

  // Calculate Total Day (Start of M1 to End of M2)
  const totalMs = getTimeDifference(first.time, second.endTime);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMins = Math.round((totalMs % 3600000) / 60000);

  const movieDate = <b>{new Date(first.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</b>

  return (
    <div className="ticket-container">
      <div className="venue-header">
        <h2 style={{ margin: 0, textTransform: 'uppercase' }}>{theatreName}</h2>
        <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '2px' }}>DOUBLE FEATURE PASS</p>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>{movieDate}</h3>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '0.7rem', color: '#888' }}>FIRST FEATURE</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>{first.title}</span>
          <span>{first.time}</span>
        </div>
      </div>

      <div className="ticket-divider">
        <div className="intermission-badge">{gapMinutes}M INTERMISSION</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '0.7rem', color: '#888' }}>SECOND FEATURE</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>{second.title}</span>
          <span>{second.time}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Leaving Time:</span>
          <span>{second.endTime}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total Day Duration:</span>
          <span>{totalHours}h {totalMins}m</span>
        </div>
      </div>

      <button 
        onClick={onReset}
        style={{ 
          marginTop: '30px', width: '100%', padding: '12px', 
          background: '#333', color: '#fff', border: 'none', 
          borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
        }}
      >
        BOOK ANOTHER DAY
      </button>
    </div>
  );
};
