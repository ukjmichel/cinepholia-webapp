export interface Movie {
  movieId: string;
  title: string;
  description: string;
  ageRating: string;
  genre: string;
  releaseDate: Date;
  director: string;
  durationMinutes: number;
  posterUrl?: string;
  recommended?: boolean;
  rating?: number | null; // average rating can be a number or null if no comments
}
