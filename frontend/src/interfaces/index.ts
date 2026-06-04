// src/interfaces/index.ts

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type ProjectStatus = 'active' | 'completed';

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  completedAt: string | null;
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
  token: string;
  user: User;
}
