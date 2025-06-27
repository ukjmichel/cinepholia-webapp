// src/app/models/movie-stats.model.ts

/**
 * Represents a daily booking count for a movie.
 */
export interface BookingNumber {
  date: string; // ISO date string, e.g. "2024-06-27"
  number: number; // Number of bookings for that date
}

/**
 * Represents booking statistics for a movie.
 */
export interface MovieStats {
  movieId: string;
  bookingNumbers: BookingNumber[];
}
