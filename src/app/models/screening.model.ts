import { Movie } from './movie.model';
import { Theater } from './theater.model';
import { Hall } from './hall.model';

export interface ScreeningAttributes {
  screeningId: string;
  movieId: string;
  theaterId: string;
  hallId: string;
  startTime: Date;
  price: number;
  quality: string;
}
export interface ScreeningWithDetails extends ScreeningAttributes {
  movie?: Movie;
  theater?: Theater;
  hall?: Hall;
}
