// src/interfaces/index.ts

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  user: string | Partial<User>;
  createdAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  project: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
