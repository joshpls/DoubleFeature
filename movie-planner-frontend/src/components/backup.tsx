import type { Movie, Showtime } from "../models/types";

interface MovieCardProps {
  movie: Movie;
  onTimeSelect: (timeStr: string) => void;
}

export const MovieCard = ({ movie, onTimeSelect }: MovieCardProps) => {
  // Group showtimes by date (YYYY-MM-DD)
  const groupedByDate = movie.showtimes.reduce((acc, showtime) => {
    const date = showtime.dateTime.split('T')[0]; // Extract "2026-01-31"
    if (!acc[date]) acc[date] = [];
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '12px'}}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h2>{movie.title} ({movie.releaseYear})</h2>
          <p><strong>Genres:</strong> {movie.genres.join(', ')}</p>
          <p>{movie.longDescription}</p>
        </div>
      </div>

      <hr />

      <div className="dates-container">
        {sortedDates.map(date => (
          <div key={date} style={{ marginBottom: '15px' }}>
            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#333' }}>
              {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {groupedByDate[date].map((s: any, i: any) => (
                <button 
                  key={i} 
                  onClick={() => onTimeSelect(s.dateTime)}
                  style={{ 
                    padding: '8px 12px', 
                    cursor: 'pointer', 
                    border: '1px solid #007bff', 
                    background: 'white', 
                    color: '#007bff', 
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                >
                  {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
