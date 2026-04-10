export interface Report {
  _id: string;
  reporterId: any; // User reference
  targetId: string;
  targetType: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  suspicionScore: number;
  moderatorId?: any; // User reference
  moderatorAction?: string;
  createdAt: string;
  updatedAt: string;
}
