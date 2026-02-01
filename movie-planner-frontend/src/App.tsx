import { useMemo, useState } from 'react';
import type { Movie, Theatre, SelectedMovie } from './models/types';
import { MovieCard } from './components/MovieCard';
import { getBufferTime, getDurationMinutes } from './utils/helper';
// import { testData } from './utils/testdata';
import { Itinerary } from './components/Itinerary';
import SearchForm from './components/SearchForm';

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

    // 3. Apply the 30m Buffer
    if (bufferThreshold) {
      result = result.map(movie => ({
        ...movie,
        showtimes: movie.showtimes.filter(s => new Date(s.dateTime) >= bufferThreshold)
      })).filter(m => m.showtimes.length > 0);
    }

    return result;
  }, [movieData, moviesAtSelectedTheatre, selectedDate, bufferThreshold, firstMovie]);

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

    setBufferThreshold(getBufferTime(startTimeStr, movie.runTime));
    
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
  };


const fetchMovies = async (params: any) => {
  setLoading(true);
  setError(null);
  setSearchParams(params);

  const { zip, radius, startDate, numDays } = params;
  
  // Use the environment variable!
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
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

  // 1. Initial View: Search Form
  if (!searchParams && !movieData.length) {
    return <SearchForm onSearch={fetchMovies} />;
  }

  // 2. Loading State
  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><h3>Fetching the latest showtimes...</h3></div>;

  // 3. Error State
  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={() => setSearchParams(null)}>Try Again</button>
    </div>
  );

  console.log("Total movies fetched:", movieData.length);
  console.log("Filtered movies to display:", filteredMovies.length);

  // 4. RENDER
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Double Feature Planner</h1>
        
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
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px' }}>
            {/* Date Jump Bar */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              <button 
                onClick={() => setSelectedDate('all')}
                style={dateButtonStyle(selectedDate === 'all')}
              >
                All Dates
              </button>
              {availableDates.map(date => (
                <button 
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={dateButtonStyle(selectedDate === date)}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>
          </div>
        ) : (
          !secondMovie ?
          <div style={{ marginBottom: '20px', padding: '10px', borderBottom: '1px solid #eee', color: '#666' }}>
            Showing only <b>{new Date(firstMovie.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</b>
          </div> : <div></div>
        )}

        
      </header>

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
            <>{filteredMovies.length > 0 ? (
              filteredMovies.map(movie => (
                <MovieCard
                  key={movie.tmsId}
                  movie={movie}
                  bufferThreshold={bufferThreshold} // Pass the threshold here
                  onTimeSelect={(t: string, id: string) => !firstMovie ? handleFirstSelect(movie, t, id) : handleSecondTimeSelect(movie, t)}
                />
              ))
            ) : (
              <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
                No movies match your current selection.
              </div>
            )}</>
          )}
      </main>
    </div>
  );
}

// Simple dynamic styling helper for date buttons
const dateButtonStyle = (isActive: boolean) => ({
  padding: '10px 18px',
  borderRadius: '20px',
  border: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  backgroundColor: isActive ? '#0d6efd' : '#e9ecef',
  color: isActive ? 'white' : '#333',
  fontWeight: isActive ? 'bold' : 'normal'
});

export default App;