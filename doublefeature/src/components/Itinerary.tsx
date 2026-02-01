import { getTimeDifference } from "../utils/helper";

export const Itinerary = ({ first, second, onReset }: any) => {
  // Calculate Gap
  const gapMs = getTimeDifference(first.endTime, second.time);
  const gapMinutes = Math.round(gapMs / 60000);

  // Calculate Total Day (Start of M1 to End of M2)
  const totalMs = getTimeDifference(first.time, second.endTime);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMins = Math.round((totalMs % 3600000) / 60000);

  return (
    <div className="ticket-container">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>ADMIT TWO</h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>DOUBLE FEATURE ITINERARY</p>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '0.7rem', color: '#888' }}>FIRST FEATURE</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>{first.title}</span>
          <span>{first.time}</span>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '0.7rem', color: '#888' }}>INTERMISSION</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>{gapMinutes} Minutes</span>
        </div>
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
