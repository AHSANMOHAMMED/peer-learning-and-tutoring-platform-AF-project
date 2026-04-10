import { User } from './User';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Education {
  institution: string;
  degree: string;
  year: number;
}

export interface Availability {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

export interface Tutor {
  _id: string;
  userId: string | User;
  subjects: string[];
  bio: string;
  education: Education[];
  alStream: string;
  experience: number;
  rating: number;
  reviewCount: number;
  availability: Availability;
  hourlyRate: number;
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
