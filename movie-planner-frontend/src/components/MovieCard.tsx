import type { Movie, Showtime } from "../models/types";
import { formatDuration, getGapColor } from "../utils/helper";

interface MovieCardProps {
  movie: Movie;
  onTimeSelect: (timeStr: string, theaterId: string) => void;
  bufferThreshold: Date | null; // Add this prop
}

export const MovieCard = ({ movie, onTimeSelect, bufferThreshold }: MovieCardProps) => {
  // Grouping logic: Date -> Theater -> Times
  const groupedData = movie.showtimes.reduce((acc: any, showtime: any) => {
    const date = showtime.dateTime.split('T')[0];
    const theaterName = showtime.theatre.name;

    if (!acc[date]) acc[date] = {};
    if (!acc[date][theaterName]) acc[date][theaterName] = [];
    
    acc[date][theaterName].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  const sortedDates = Object.keys(groupedData).sort();

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '12px' }}>
      <h2>{movie.title}</h2>
      <h4>{movie.longDescription}</h4>
      <h4>Runtime: {formatDuration(movie.runTime)}</h4>
      {sortedDates.map(date => (
        <div key={date} style={{ marginBottom: '10px' }}>
          <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px 0' }}>
              {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(groupedData[date]).map(([theaterName, times]: any) => (
            <div key={theaterName} style={{ margin: '10px 0 10px 15px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {theaterName}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {times.map((s: any, i: any) => {
                  const calcGap = getGapColor(s.dateTime, bufferThreshold);
                  const buttonColor = calcGap.color
                  const gapMinutes = bufferThreshold ? `${calcGap.mins} mins gap` : '';
                  return (
                    <button
                      key={i}
                      onClick={() => onTimeSelect(s.dateTime, s.theatre.id)}
                      title={gapMinutes}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        opacity: 1,
                        border: `2px solid ${buttonColor}`,
                        background: bufferThreshold ? buttonColor : 'white',
                        color: bufferThreshold ? 'white' : buttonColor,
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '100px',
                        transition: 'transform 0.1s ease, background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        </div>
      ))}
    </div>
  );
};
