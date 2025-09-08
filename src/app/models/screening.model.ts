import { Movie } from './movie.model';
import { Theater } from './theater.model';
import { Hall } from './hall.model';

export type ScreeningQuality = '2D' | '3D' | 'IMAX' | '4DX';

export interface ScreeningAttributes {
  screeningId: string;
  movieId: string;
  theaterId: string;
  hallId: string;
  startTime: Date; // use string (ISO) if your API returns dates as strings
  price: number;
  quality: ScreeningQuality;
}

export interface ScreeningWithDetails extends ScreeningAttributes {
  movie?: Movie;
  theater?: Theater;
  hall?: Hall;
}
