import type { Movie, Showtime } from "../models/types";
import { formatDuration, getGapColor, getFormat } from "../utils/helper";
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  onTimeSelect: (timeStr: string, theaterId: string, format: string) => void;
  bufferThreshold: Date | null;
}

export const MovieCard = ({ movie, onTimeSelect, bufferThreshold }: MovieCardProps) => {
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
    <div className={`movie-card`}>
      <div className="movie-card-header">
        <div className="header-left">
          <h2 className="movie-title">{movie.title}</h2>
          <span className="runtime-badge">{formatDuration(movie.runTime)}</span>
        </div>
      </div>

      <div className="movie-card-body fade-in">
        <p className="movie-desc">{movie.longDescription}</p>

        {sortedDates.map(date => (
          <div key={date} className="date-section">
            <h4 className="date-heading">
              {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long', month: 'short', day: 'numeric'
              })}
            </h4>

            <div className="theater-grid">
              {Object.entries(groupedData[date]).map(([theaterName, times]: any) => (
                <div key={theaterName} className="theater-group">
                  <div className="theater-name">{theaterName}</div>
                  <div className="showtime-list">
                    {times.map((s: any, i: any) => {
                      const calcGap = getGapColor(s.dateTime, bufferThreshold);
                      const buttonColor = calcGap.color;
                      const format = getFormat(s.quals);

                      return (
                        <button
                          key={i}
                          className={`time-button format-${format.toLowerCase()}`}
                          title={bufferThreshold ? `${calcGap.mins} MIN GAP` : ''}
                          onClick={() => onTimeSelect(s.dateTime, s.theatre.id, format)}
                          style={{
                            border: `2px solid ${buttonColor}`,
                            background: bufferThreshold ? buttonColor : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            position: 'relative'
                          }}
                        >
                          {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {format !== 'Regular' && <span className="format-tag">{format}</span>}
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
    </div>
  );
};
