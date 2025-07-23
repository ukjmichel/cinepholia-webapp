export interface Hall {
  theaterId: string;
  hallId: string;
  seatsLayout: string[][];
  quality: '2D' | '3D' | 'IMAX' | '4DX';
}
