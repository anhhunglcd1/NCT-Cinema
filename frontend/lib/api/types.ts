export type Role = "ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type MovieStatus = "nowPlaying" | "comingSoon";
export type AgeRating = "P" | "K" | "T13" | "T16" | "T18";

export interface Movie {
  id: string;
  title: string;
  poster: string;
  status: MovieStatus;
  genres: string[];
  duration: number;
  rating: AgeRating;
  synopsis: string;
  trailerUrl: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
}

export interface Room {
  id: string;
  cinemaId: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  blockedSeats: string[];
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  /** Ngày chiếu theo giờ Việt Nam, dạng YYYY-MM-DD */
  date: string;
  /** Giờ chiếu theo giờ Việt Nam, dạng HH:mm */
  time: string;
  price: number;
}

export interface Catalog {
  movies: Movie[];
  cinemas: Cinema[];
  rooms: Room[];
  showtimes: Showtime[];
}

export interface CsrfToken {
  token: string;
  headerName: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
