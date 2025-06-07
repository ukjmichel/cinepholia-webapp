export interface Booking {
  userId: string;
  screeningId: string;
  seatsNumber: number;
  seatIds: string[];
  totalPrice: number;
}
