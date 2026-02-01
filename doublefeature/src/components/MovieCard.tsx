import type { Movie, Showtime } from "../models/types";
import { formatDuration, getGapColor } from "../utils/helper";

interface MovieCardProps {
  movie: Movie;
  onTimeSelect: (timeStr: string) => void;
  bufferThreshold: Date | null; // Add this prop
}

export const MovieCard = ({ movie, onTimeSelect, bufferThreshold }: MovieCardProps) => {
  const groupedByDate = movie.showtimes.reduce((acc: any, showtime: any) => {
    const date = showtime.dateTime.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '12px' }}>
      <h2>{movie.title}</h2>
      <h4>{movie.longDescription}</h4>
      <h6>Runtime: {formatDuration(movie.runTime)}</h6>
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
            {groupedByDate[date].map((s: any, i: any) => {
            const buttonColor = getGapColor(s.dateTime, bufferThreshold);
              
              return (
                <button 
                  key={i} 
                  onClick={() => onTimeSelect(s.dateTime)}
                  style={{ 
                    padding: '8px 12px', 
                    cursor: 'pointer', 
                    border: `2px solid ${buttonColor}`, 
                    background: bufferThreshold ? buttonColor : 'white', 
                    color: bufferThreshold ? 'white' : buttonColor, 
                    borderRadius: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
