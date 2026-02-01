export interface Theatre {
  id: string;
  name: string;
}

export interface Showtime {
  theatre: Theatre;
  dateTime: string;
  barg?: boolean;
  ticketURI?: string;
  quals?: string;
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
