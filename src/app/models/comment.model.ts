export interface BookingCommentUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BookingComment {
  _id: string; 
  bookingId: string;
  comment: string;
  status: 'pending' | 'confirmed';
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: BookingCommentUser;
  __v?: number; 
}

export interface CreateBookingCommentDto {
  comment: string;
  rating: number;
}
