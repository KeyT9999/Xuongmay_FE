import apiClient from './api.service';
import { tokenUtils } from '../utils/token';
import { User } from '../../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RolesResponse {
  roles: Array<{
    value: string;
    label: string;
  }>;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    const { accessToken, user } = response.data;
    
    // Store token
    tokenUtils.set(accessToken);
    
    return { accessToken, user };
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  async getRoles(): Promise<RolesResponse> {
    const response = await apiClient.get<RolesResponse>('/auth/roles');
    return response.data;
  }

  logout(): void {
    tokenUtils.remove();
  }

  isAuthenticated(): boolean {
    return tokenUtils.hasToken();
  }

  getToken(): string | null {
    return tokenUtils.get();
  }

  async forgotPassword(identifier: string): Promise<{ message: string }> {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:forgotPassword',message:'forgotPassword called',data:{identifier:identifier?identifier.substring(0,3)+'***':null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { identifier });
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:forgotPassword',message:'forgotPassword response',data:{status:response.status,message:response.data?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return response.data;
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:forgotPassword',message:'forgotPassword error',data:{errorMessage:error?.message,status:error?.response?.status,responseData:error?.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  async resetPassword(identifier: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      identifier,
      otp,
      newPassword,
    });
    return response.data;
  }
}

export const authService = new AuthService();
