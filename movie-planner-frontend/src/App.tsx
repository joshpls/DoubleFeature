import { useEffect, useMemo, useState, useRef } from 'react';
import type { Movie, Theatre, SelectedMovie } from './models/types';
import { MovieCard } from './components/MovieCard';
import { getBufferTime, getDoubleFeatures, getDurationMinutes } from './utils/helper';
import { Itinerary } from './components/Itinerary';
import SearchForm from './components/SearchForm';
import './App.css';
import { DateStrip } from './components/DateStrip';
import { DoubleFeatureCard } from './components/DoubleFeatureCard';

function App() {
  // 1. STATE & REFS
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
  const [bufferTime, setBufferTime] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [maxGap, setMaxGap] = useState<number | null>(45);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecommendedOpen, setIsRecommendedOpen] = useState(true);

  // 2. DATA DERIVATION
  const allTheatres = useMemo(() => {
    const theatreMap = new Map<string, Theatre>();
    (movieData as Movie[]).forEach(movie => {
      movie.showtimes.forEach(s => theatreMap.set(s.theatre.id, s.theatre));
    });
    return Array.from(theatreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [movieData]);

  const moviesAtSelectedTheatre = useMemo(() => {
    if (selectedTheatreId === 'all') return movieData as Movie[];
    return (movieData as Movie[])
      .map(movie => ({
        ...movie,
        showtimes: movie.showtimes.filter(s => s.theatre.id === selectedTheatreId)
      }))
      .filter(m => m.showtimes.length > 0);
  }, [movieData, selectedTheatreId]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    moviesAtSelectedTheatre.forEach(movie => {
      movie.showtimes.forEach(s => dates.add(s.dateTime.split('T')[0]));
    });
    return Array.from(dates).sort();
  }, [moviesAtSelectedTheatre]);

  // DERIVE RECOMMENDED PAIRS (with searchQuery filter)
  const recommendedPairs = useMemo(() => {
    if (selectedTheatreId === 'all' || selectedDate === 'all' || firstMovie) return [];
    const theatre = allTheatres.find(t => t.id === selectedTheatreId);
    if (!theatre) return [];

    let pairs = getDoubleFeatures(moviesAtSelectedTheatre, theatre.name, selectedDate);

    // Filter pairs if searchQuery exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      pairs = pairs.filter(pair =>
        pair.first.title.toLowerCase().includes(query) ||
        pair.second.title.toLowerCase().includes(query)
      );
    }

    return pairs;
  }, [moviesAtSelectedTheatre, selectedTheatreId, selectedDate, firstMovie, allTheatres, searchQuery]);

  const filteredMovies = useMemo(() => {
    let result = moviesAtSelectedTheatre;

    if (firstMovie) {
      result = result.filter(movie => movie.tmsId !== firstMovie.id);
    }

    const dateToFilter = firstMovie ? firstMovie.date : selectedDate;

    if (dateToFilter !== 'all') {
      result = result.map(movie => ({
        ...movie,
        showtimes: movie.showtimes.filter(s => s.dateTime.split('T')[0] === dateToFilter)
      })).filter(m => m.showtimes.length > 0);
    }

    if (searchQuery.trim() !== '') {
      result = result.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // UPDATED: Logic for Buffer and "Unlimited" Max Gap
    if (firstMovie && bufferThreshold) {
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

  // 3. FIXED AUTO-SCROLL EFFECT
  useEffect(() => {
    let frameId: number;

    const scrollStep = () => {
      // Logic: If section is open AND ref is attached AND not paused
      if (isRecommendedOpen && scrollRef.current && !isPaused && recommendedPairs.length > 1) {
        const el = scrollRef.current;
        el.scrollLeft += 0.5;

        // Loop back to start if at the end
        if (el.scrollLeft >= (el.scrollWidth - el.clientWidth - 1)) {
          el.scrollLeft = 0;
        }
      }
      frameId = requestAnimationFrame(scrollStep);
    };

    frameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(frameId);
  }, [isPaused, recommendedPairs, isRecommendedOpen]);

  // 4. HANDLERS
  const handleFirstSelect = (movie: Movie, startTimeStr: string, theaterId: string) => {
    const selectedDateStr = startTimeStr.split('T')[0];
    const duration = getDurationMinutes(movie.runTime);
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + duration * 60000);

    setSelectedTheatreId(theaterId);
    setFirstMovie({
      id: movie.tmsId, title: movie.title,
      time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDateStr,
      endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setBufferThreshold(getBufferTime(startTimeStr, movie.runTime, bufferTime));
    setSelectedDate(selectedDateStr);
  };

  const resetFirstStep = () => {
    setFirstMovie(null);
    setBufferThreshold(null); 
  }

  const resetAll = () => {
    setFirstMovie(null);
    setSecondMovie(null);
    setBufferThreshold(null);
    setSelectedDate('all');
    setSearchQuery('');
  };

  const fetchMovies = async (params: any) => {
    setLoading(true);
    setSearchParams(params);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/showtimes?startDate=${params.startDate}&zip=${params.zip}&radius=${params.radius}&numDays=${params.numDays}`);
      const data = await res.json();
      setMovieData(data);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
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

  if (!searchParams && !movieData.length) return <SearchForm onSearch={fetchMovies} />;
  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="container">
      <header className='top-header'>
        <h1 className="main-title">🎥 Cinema Double-Feature Planner</h1>

        {!secondMovie && (
          <div className="theater-select-row" style={{ marginBottom: '20px' }}>
            <select
              className="theatre-dropdown"
              value={selectedTheatreId}
              onChange={(e) => { setSelectedTheatreId(e.target.value); setFirstMovie(null); }}
              disabled={!!firstMovie}
            >
              <option value="all">All Theaters</option>
              {allTheatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        {!firstMovie ? (
          <DateStrip availableDates={availableDates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        ) : (
          !secondMovie && <div className="date-strip-container">
            <div className="selected-date-banner">
              <span className="banner-date">{new Date(firstMovie.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        )}
      </header>

      {!secondMovie && <div className="search-row">
        <div className="buffer-container">
          <label className="buffer-label">Extra Buffer</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              className="buffer-input"
              style={{ width: '80px', paddingRight: '15px'  }}
              disabled={!!firstMovie}
              value={bufferTime}
              onChange={(e) => setBufferTime(parseInt(e.target.value) || 0)}
              min="0"
            />
            {bufferTime !== 0 && (
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
              style={{ width: '80px', paddingRight: '15px'  }}
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
          {searchQuery && <button onClick={() => setSearchQuery('')} className="clear-search">✕</button>}
        </div>
      </div>
      }

      <main>
        {!firstMovie && recommendedPairs.length > 0 && (
          <section className="recommendations-section">
            <div
              className="section-header"
              onClick={() => setIsRecommendedOpen(!isRecommendedOpen)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <h2 className="section-title">
                {isRecommendedOpen ? '▼' : '▶'} 🍿 Recommended For You
              </h2>

              {isRecommendedOpen && (
                <div className="nav-buttons" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' })} className="nav-btn">←</button>
                  <button onClick={() => scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' })} className="nav-btn">→</button>
                </div>
              )}
            </div>

            {/* COLLAPSIBLE & AUTO-SCROLLING CONTENT */}
            {isRecommendedOpen && (
              <div className="recommendations-wrapper fade-in">
                <div
                  className="recommendation-scroll-container"
                  ref={scrollRef}
                  onMouseEnter={() => setIsPaused(true)}  // Stop scrolling on hover
                  onMouseLeave={() => setIsPaused(false)} // Resume scrolling on leave
                >
                  {recommendedPairs.map((pair, index) => (
                    <DoubleFeatureCard
                      key={index}
                      pair={pair}
                      onSelect={() => {
                        const movieA = moviesAtSelectedTheatre.find(m => m.title === pair.first.title);
                        const movieB = moviesAtSelectedTheatre.find(m => m.title === pair.second.title);
                        if (movieA && movieB) {
                          const showA = movieA.showtimes.find(s => new Date(s.dateTime).getTime() === pair.first.start.getTime());
                          const showB = movieB.showtimes.find(s => new Date(s.dateTime).getTime() === pair.second.start.getTime());
                          if (showA && showB) {
                            handleFirstSelect(movieA, showA.dateTime, selectedTheatreId);
                            const startB = new Date(showB.dateTime);
                            const endB = new Date(startB.getTime() + getDurationMinutes(movieB.runTime) * 60000);
                            setSecondMovie({
                              id: movieB.tmsId,
                              title: movieB.title,
                              time: startB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              date: showB.dateTime.split('T')[0],
                              endTime: endB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            });
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Double Feature Status Panel */}
        {firstMovie && (!secondMovie) && (
          <div style={{ backgroundColor: '#157347', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>FIRST MOVIE</p>
                <h3 style={{ margin: 0 }}>{firstMovie.title} at {firstMovie.time}</h3>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', marginBottom: '15px', justifyContent: 'center' }}>
                <span><span style={{ color: '#28a745' }}>●</span> Perfect Gap (0-15m)</span>
                <span><span style={{ color: '#fd7e14' }}>●</span> Decent Gap (15-30m)</span>
                <span><span style={{ color: '#dc3545' }}>●</span> Long Wait (30m+)</span>
              </div>
              <button onClick={() => resetFirstStep()} style={{ padding: '8px 15px', cursor: 'pointer' }}>Reset</button>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>
              💡 Now showing movies starting after <b>{bufferThreshold?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b> at <b>{allTheatres.find(t => t.id === selectedTheatreId)?.name || 'Local Cinema'}</b> Theater.
            </p>
          </div>
        )}

        {firstMovie && secondMovie ? (
          <Itinerary
            first={firstMovie}
            second={secondMovie}
            theatreName={allTheatres.find(t => t.id === selectedTheatreId)?.name || ''}
            onReset={resetAll}
          />
        ) : (
          <div className="movie-grid">
            {filteredMovies.map(movie => (
              <div key={movie.tmsId} className="fade-in-card">
                <MovieCard
                  movie={movie}
                  bufferThreshold={bufferThreshold}
                  onTimeSelect={(t, id) => !firstMovie ? handleFirstSelect(movie, t, id) : setSecondMovie({
                    id: movie.tmsId,
                    title: movie.title,
                    time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: t.split('T')[0],
                    endTime: new Date(new Date(t).getTime() + getDurationMinutes(movie.runTime) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  })}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop} title="Go to top">
          <span className="arrow">↑</span>
        </button>
      )}
    </div>
  );
}

export default App;