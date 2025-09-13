export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
}
