export interface Theatre {
  id: string;
  name: string;
}

export interface Showtime {
  dateTime: string;
  theatre: Theatre;
  ticketURI?: string;
}

export interface Movie {
  shortDescription: string;
  tmsId: string;
  title: string;
  releaseYear: number;
  genres: string[];
  longDescription: string;
  runTime: string;
  preferredImage: {
    uri: string;
  };
  showtimes: Showtime[];
}

// Custom type for our planning state
export interface SelectedMovie {
  id: string; 
  title: string; 
  date: string, 
  time: string, 
  endTime: string
}
