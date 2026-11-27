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

export type TicketStatus = "pending" | "confirmed" | "cancelled" | "expired";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded"
  | "requires_review";
export type PaymentProvider = "vnpay" | "mock" | (string & {});

export interface Ticket {
  id: string;
  movieId: string;
  showtimeId: string;
  cinemaId: string;
  roomId: string;
  seats: string[];
  status: TicketStatus;
  total: number;
  bookedAt: string;
  expiresAt: string;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
}

export interface Catalog {
  movies: Movie[];
  cinemas: Cinema[];
  rooms: Room[];
  showtimes: Showtime[];
}

export type SeatStatus = "available" | "occupied" | "blocked";

export interface SeatAvailability {
  label: string;
  status: SeatStatus;
}

export interface Availability {
  showtimeId: string;
  seats: SeatAvailability[];
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

export interface BookingInput {
  showtimeId: string;
  seats: string[];
  idempotencyKey: string;
}

export interface MovieInput {
  title: string;
  poster: string;
  status: MovieStatus;
  genres: string[];
  duration: number;
  rating: AgeRating;
  synopsis: string;
  trailerUrl: string;
}

export interface CinemaInput {
  name: string;
  address: string;
}

export interface RoomInput {
  cinemaId: string;
  name: string;
  rows: number;
  seatsPerRow: number;
}
