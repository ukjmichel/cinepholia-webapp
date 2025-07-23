/**
 * Interface representing a user attached to a booking comment.
 */
export interface BookingCommentUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Interface representing a booking comment (base structure).
 */
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

/**
 * DTO for creating a new booking comment.
 */
export interface CreateBookingCommentDto {
  comment: string;
  rating: number;
}

/**
 * Extended interface that includes movie information along with the base BookingComment.
 */
export interface BookingCommentWithMovieAndUser extends BookingComment {
  movieId: string;
  movieTitle: string;
}
