export interface MovieComment {
  _id: string;
  bookingId: string;
  comment: string;
  rating: number;
  status: 'pending' | 'confirmed';
  createdAt: string; // ISO date string
  updatedAt: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
