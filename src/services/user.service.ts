import apiClient from './api.service';
import { User, UserRole } from '../../types';

export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
  password?: string;
  isActive?: boolean;
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ avatarUrl: string }>('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProfile(userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<User>('/users/me/profile', userData);
    return response.data;
  }
}

export const userService = new UserService();
