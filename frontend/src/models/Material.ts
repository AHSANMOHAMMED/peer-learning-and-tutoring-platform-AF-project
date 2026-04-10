import { User } from './User';

export type FileType = 'pdf' | 'docx' | 'ppt' | 'txt';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Material {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: FileType;
  uploaderId: string | User;
  subject: string;
  grade: string;
  price: number;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  moderationStatus: ModerationStatus;
  tags: string[];
  downloads: number;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}
