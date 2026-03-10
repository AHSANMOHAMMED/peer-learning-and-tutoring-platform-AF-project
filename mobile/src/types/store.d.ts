// Type exports for the store modules
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'parent' | 'admin';
  profile?: {
    avatar?: string;
    grade?: string;
    subjects?: string[];
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export interface NotificationState {
  pushToken: string | null;
  notifications: any[];
  registerForPushNotifications: () => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}
