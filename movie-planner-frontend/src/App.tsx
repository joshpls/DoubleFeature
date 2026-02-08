import { useEffect, useMemo, useState } from 'react';
import type { Movie, Theatre, SelectedMovie } from './models/types';
import { MovieCard } from './components/MovieCard';
import { getBufferTime, getDurationMinutes } from './utils/helper';
// import { testData } from './utils/testdata';
import { Itinerary } from './components/Itinerary';
import SearchForm from './components/SearchForm';
import './App.css';
import { DateStrip } from './components/DateStrip';


// --- MAIN COMPONENT ---
function App() {
  // 1. STATE
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [firstMovie, setFirstMovie] = useState<SelectedMovie | null>(null);
  const [secondMovie, setSecondMovie] = useState<SelectedMovie | null>(null);
  const [bufferThreshold, setBufferThreshold] = useState<Date | null>(null);
  const [movieData, setMovieData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bufferTime, setBufferTime] = useState(0); // Buffer in minutes
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [maxGap, setMaxGap] = useState<number | null>(45);

  // 2. DATA DERIVATION
  // Get all unique theaters for the dropdown
  const allTheatres = useMemo(() => {
    const theatreMap = new Map<string, Theatre>();
    (movieData as Movie[]).forEach(movie => {
      movie.showtimes.forEach(s => theatreMap.set(s.theatre.id, s.theatre));
    });
    return Array.from(theatreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [movieData]);

  // Filter movies ONLY by theater to determine which dates are available
  const moviesAtSelectedTheatre = useMemo(() => {
    if (selectedTheatreId === 'all') return movieData as Movie[];
    return (movieData as Movie[])
      .map(movie => ({
        ...movie,
        showtimes: movie.showtimes.filter(s => s.theatre.id === selectedTheatreId)
      }))
      .filter(m => m.showtimes.length > 0);
  }, [movieData, selectedTheatreId]);

  // Get unique dates available at the chosen theater
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    moviesAtSelectedTheatre.forEach(movie => {
      movie.showtimes.forEach(s => dates.add(s.dateTime.split('T')[0]));
    });
    return Array.from(dates).sort();
  }, [moviesAtSelectedTheatre]);

  // FINAL FILTERED LIST: Applies Date and Double-Feature Buffer
  const filteredMovies = useMemo(() => {
    let result = moviesAtSelectedTheatre;

    // 1. Exclude the movie already picked
    if (firstMovie) {
      result = result.filter(movie => movie.tmsId !== firstMovie.id);
    }

    // 2. Lock to the Date of the first movie
    // If firstMovie exists, we ignore the "selectedDate" state and force the movie's date
    const dateToFilter = firstMovie ? firstMovie.date : selectedDate;

    if (dateToFilter !== 'all') {
      result = result.map(movie => ({
        ...movie,
        showtimes: movie.showtimes.filter(s => s.dateTime.split('T')[0] === dateToFilter)
      })).filter(m => m.showtimes.length > 0);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. Apply the Buffer
    if (bufferThreshold) {
      result = result.map(movie => ({
        ...movie,
        showtimes: movie.showtimes.filter(s => {
        
          const startTime = new Date(s.dateTime);
          const gapMinutes = (startTime.getTime() - bufferThreshold.getTime()) / 60000;

          const isAfterBuffer = startTime >= bufferThreshold;

          // If maxGap is null or empty, it is unlimited. 
          // Otherwise, check if it's within the gap.
          const isWithinGap = maxGap === null ? true : gapMinutes <= maxGap;

          return isAfterBuffer && isWithinGap;
        })
      })).filter(m => m.showtimes.length > 0);
    }
    
    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [moviesAtSelectedTheatre, selectedDate, bufferThreshold, firstMovie, searchQuery, maxGap]);

  // 3. HANDLERS
  const handleTheatreChange = (id: string) => {
    setSelectedTheatreId(id);
    setSelectedDate('all');
    setFirstMovie(null);
    setBufferThreshold(null);
  };

  const handleFirstSelect = (movie: Movie, startTimeStr: string, theaterId: string) => {
    const selectedDateStr = startTimeStr.split('T')[0]; // Extract "YYYY-MM-DD"
    const duration = getDurationMinutes(movie.runTime);
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + duration * 60000);

    setSelectedTheatreId(theaterId);

    setFirstMovie({ 
      id: movie.tmsId, 
      title: movie.title, 
      time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDateStr, // Store this in state,
      endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setBufferThreshold(getBufferTime(startTimeStr, movie.runTime, bufferTime));
    
    // Automatically set the Jump-To-Date bar to this date
    setSelectedDate(selectedDateStr);
  };

  // Updated Handler for selecting the second movie
  const handleSecondTimeSelect = (movie: Movie, startTimeStr: string) => {
    const start = new Date(startTimeStr);
    const duration = getDurationMinutes(movie.runTime);
    const end = new Date(start.getTime() + duration * 60000);
    const selectedDateStr = startTimeStr.split('T')[0]; // Extract "YYYY-MM-DD"


    setSecondMovie({
      id: movie.tmsId,
      title: movie.title,
      time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDateStr, // Store this in state,
      endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const resetAll = () => {
    setFirstMovie(null);
    setSecondMovie(null);
    setBufferThreshold(null);
    setSelectedDate('all');
    setSearchQuery('');
  };


const fetchMovies = async (params: any) => {
  setLoading(true);
  setError(null);
  setSearchParams(params);

  const { zip, radius, startDate, numDays } = params;
  
  // Use the environment variable!
  const baseUrl = import.meta.env.VITE_API_URL;
  const url = `${baseUrl}/showtimes?startDate=${startDate}&zip=${zip}&radius=${radius}&numDays=${numDays}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Could not retrieve movies.');
    const data = await response.json();
    setMovieData(data);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Initial View: Search Form
  if (!searchParams && !movieData.length) {
    return <SearchForm onSearch={fetchMovies} />;
  }

  // 2. Loading State
  if (loading) return (
    <div className="no-results">
      <div className="no-results-content">
        <div className="loading-spinner"></div>
        <h3>Fetching Showtimes...</h3>
        <p>Checking local cinemas for the latest listings.</p>
      </div>
    </div>
  );

  // 3. Error State
  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={() => setSearchParams(null)}>Try Again</button>
    </div>
  );

  // 4. RENDER
  return (
    <div className="container">
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎥 Cinema Double-Feature Planner</h1>
        
        {/* Theater Select */}
        {(!secondMovie) && <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Choose Theater</label>
          <select 
            value={selectedTheatreId} 
            onChange={(e) => handleTheatreChange(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '1rem' }}
            disabled={firstMovie?.id ? true : false}
          >
            <option value="all">All Theaters</option>
            {allTheatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>}

        {/* JUMP TO DATE BAR */}
        {!firstMovie ? (
          <DateStrip
            availableDates={availableDates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        ) : (
          !secondMovie && (
            <div className="date-strip-container">
              <div className="selected-date-banner">
                <span className="banner-label">Planning for</span>
                <span className="banner-date">
                  {new Date(firstMovie.date + 'T00:00:00').toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          )
        )}
      </header>

      {/* Movie Search Bar */}
      {(!secondMovie) &&
        <div className="search-row">
          <div className="buffer-container">
            <label className="buffer-label">Extra Buffer</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="buffer-input"
                style={{ width: '80px', paddingRight: '15px' }}
                disabled={!!firstMovie}
                value={bufferTime}
                onChange={(e) => setBufferTime(parseInt(e.target.value) || 0)}
                min="0"
              />
              {bufferTime !== 0 && !firstMovie && (
                <button
                  onClick={() => setBufferTime(0)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="buffer-container">
            <label className="buffer-label">Max Gap</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="buffer-input"
                placeholder="∞"
                style={{ width: '80px', paddingRight: '15px' }}
                value={maxGap === null ? '' : maxGap}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '0') return;
                  setMaxGap(val === '' ? null : parseInt(val));
                }}
                min="1"
              />
              {maxGap !== null && (
                <button
                  onClick={() => setMaxGap(null)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      }

      {/* Double Feature Status Panel */}
      {firstMovie && (!secondMovie) && (
        <div style={{ backgroundColor: '#157347', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>FIRST MOVIE</p>
              <h3 style={{ margin: 0 }}>{firstMovie.title} at {firstMovie.time}</h3>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', marginBottom: '15px', justifyContent: 'center' }}>
              <span><span style={{color: '#28a745'}}>●</span> Perfect Gap (0-15m)</span>
              <span><span style={{color: '#fd7e14'}}>●</span> Decent Gap (15-30m)</span>
              <span><span style={{color: '#dc3545'}}>●</span> Long Wait (30m+)</span>
            </div>
            <button onClick={() => { setFirstMovie(null); setBufferThreshold(null); }} style={{ padding: '8px 15px', cursor: 'pointer' }}>Reset</button>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>
            💡 Now showing movies starting after <b>{bufferThreshold?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b> at <b>{allTheatres.find(t => t.id === selectedTheatreId)?.name || 'Local Cinema'}</b> Theater.
          </p>
        </div>
      )}

      {/* Movie Results */}
      <main>
        {(firstMovie && secondMovie) ?
          <Itinerary first={firstMovie} second={secondMovie} theatreName={allTheatres.find(t => t.id === selectedTheatreId)?.name || 'Local Cinema'} onReset={resetAll} />
          : (
            <div className="movie-grid">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie, index) => (
                  <div
                    key={movie.tmsId}
                    className="fade-in-card"
                    style={{ animationDelay: `${index * 0.05}s` }} /* Delays each card by 50ms */
                  >
                    <MovieCard
                      key={movie.tmsId}
                      movie={movie}
                      bufferThreshold={bufferThreshold} // Pass the threshold here
                      onTimeSelect={(t: string, id: string) => !firstMovie ? handleFirstSelect(movie, t, id) : handleSecondTimeSelect(movie, t)}
                    />
                  </div>
                ))
              ) : (
                /* This div now uses the 'no-results' class */
                <div className="no-results">
                  <div className="no-results-content">
                    <span>🎬</span>
                    <h3>No movies match your search</h3>
                    <p>Try adjusting your filters or buffer time.</p>
                    <button onClick={() => { setSearchQuery(''); setBufferTime(0); }}>
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}</div>
          )}
        {showBackToTop && (
          <button className="back-to-top" onClick={scrollToTop} title="Go to top">
            <span className="arrow">↑</span>
          </button>
        )}
      </main>
    </div>
  );
}

export default App;