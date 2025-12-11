export interface User {
  uid: string;
  username: string;
  email?: string; // Optional as per user request for testing flexibility
  photoURL?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}
