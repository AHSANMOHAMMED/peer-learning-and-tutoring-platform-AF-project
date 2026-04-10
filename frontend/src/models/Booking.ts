import { User } from './User';
import { Tutor } from './Tutor';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  _id: string;
  tutorId: string | Tutor;
  studentId: string | User;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  subject: string;
  meetingUrl?: string;
  price: number;
  paymentStatus: PaymentStatus;
  whiteboardData?: string;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}
