import type { Movie } from "../models/types";

/**
 * Converts ISO 8601 duration (e.g., "PT1H47M") to "1h 47m"
 */
export const formatDuration = (duration: string | undefined): string => {
  if (!duration) return 'N/A';

  // Matches the numbers before H (hours) and M (minutes)
  const hours = duration.match(/(\d+)H/);
  const minutes = duration.match(/(\d+)M/);

  const h = hours ? `${hours[1]}h` : '';
  const m = minutes ? `${minutes[1]}m` : '';

  return `${h} ${m}`.trim();
};

// Helper: Converts "PT1H47M" to total minutes (e.g., 107)
export const getDurationMinutes = (duration: string | undefined): number => {
  if (!duration) return 0;
  const hours = duration.match(/(\d+)H/);
  const minutes = duration.match(/(\d+)M/);
  return (parseInt(hours?.[1] || '0') * 60) + parseInt(minutes?.[1] || '0');
};

// Helper: Adds minutes to a date string and returns a Date object
export const getBufferTime = (startTimeStr: string, durationStr: string, buffer: number): Date => {
  const start = new Date(startTimeStr);
  const hours = durationStr.match(/(\d+)H/);
  const minutes = durationStr.match(/(\d+)M/);
  
  const totalDurationMinutes = (parseInt(hours?.[1] || '0') * 60) + parseInt(minutes?.[1] || '0');
  
  // Return Start Time + Length of Movie + buffer cleaning/snack break
  return new Date(start.getTime() + (totalDurationMinutes + buffer) * 60000);
};

export const getGapColor = (showtimeStr: string, threshold: Date | null): any => {
  if (!threshold) return {color: '#007bff', mins: ''}; // Default blue if no movie is selected

  const showtimeDate = new Date(showtimeStr);
  // Calculate difference in minutes
  const diffMs = showtimeDate.getTime() - threshold.getTime();
  const diffMins = diffMs / 60000;

  if (diffMins <= 15) return {color: '#28a745', mins: diffMins}; // Green: 0-15 mins after buffer
  if (diffMins <= 30) return {color: '#fd7e14', mins: diffMins}; // Orange: 15-30 mins after buffer
  return {color: '#dc3545', mins: diffMins}; // Red: 30+ mins after buffer
};

export const getTimeDifference: any = (time1: string, time2: string): any => {
    const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const date1 = parseTime(time1);
    const date2 = parseTime(time2);

    // Get difference in milliseconds, ensure positive value
    let diffInMs = Math.abs(date2.getTime() - date1.getTime());
    return diffInMs;
}

/**
 * Finds all double feature pairs within a 30-minute gap.
 * @param {Array} movies - The array of Movie objects (similar to testData)
 * @param {string} theaterName - The name of the theater to filter by
 * @param {string} dateString - The date in YYYY-MM-DD format
 */
export const getDoubleFeatures = (movies: Movie[], theaterName: string, dateString: string) => {
  console.log("movies: ", movies);
  console.log("theater: ", movies);
  console.log("date: ", movies);

  const potentialShowings: any[] = [];

  // 1. Flatten the movie data into individual showings for that theater/day
  movies.forEach(movie => {
    const durationMins = getDurationMinutes(movie.runTime);
    
    movie.showtimes.forEach(show => {
      // Filter by theater name and specific date
      if (show.theatre.name === theaterName && show.dateTime.startsWith(dateString)) {
        const start = new Date(show.dateTime);
        const end = new Date(start.getTime() + durationMins * 60000);

        potentialShowings.push({
          title: movie.title,
          start,
          end,
          originalShow: show
        });
      }
    });
  });

  const doubleFeatures = [];

  // 2. Pair every showing with every other showing
  for (let i = 0; i < potentialShowings.length; i++) {
    for (let j = 0; j < potentialShowings.length; j++) {
      if (i === j) continue; // Don't pair a movie with itself

      const movieA = potentialShowings[i];
      const movieB = potentialShowings[j];

      // Prevent recommending the same movie twice
      if (movieA.title === movieB.title) continue;

      // Calculate gap in minutes
      const gapMs = movieB.start - movieA.end;
      const gapMinutes = gapMs / 60000;

      // 3. Logic: Movie B must start after Movie A ends, with max 30 min gap
      if (gapMinutes >= 0 && gapMinutes <= 30) {
        doubleFeatures.push({
          first: movieA,
          second: movieB,
          gap: Math.floor(gapMinutes)
        });
      }
    }
  }

  console.log("Result: ", doubleFeatures);
  return doubleFeatures;
};