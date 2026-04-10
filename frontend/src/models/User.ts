export type UserRole = 'student' | 'tutor' | 'admin' | 'superadmin' | 'moderator' | 'parent' | 'schoolAdmin';

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  phoneNumber?: string;
  school?: string;
  grade?: number | string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  rating?: number;
}

export interface Gamification {
  points: number;
  experience?: number;
  streak: number;
  lastActive: string;
  badges: string[];
  level: number;
}


export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  gamification: Gamification;
  district?: string;
  stream?: string;
  grade?: string;
  isVerified: boolean;
  verificationStatus?: string;
  isActive: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}
