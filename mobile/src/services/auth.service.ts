import api from './api';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user: boolean;
  user: User;
}

export const authService = {
  async sendOtp(phoneNumber: string): Promise<{ debug_code?: string }> {
    const { data } = await api.post('/auth/send-otp', { phone_number: phoneNumber });
    return data;
  },

  async verifyOtp(phoneNumber: string, code: string): Promise<AuthTokenResponse> {
    const { data } = await api.post<AuthTokenResponse>('/auth/verify-otp', {
      phone_number: phoneNumber,
      code,
    });
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    return data;
  },

  async googleLogin(idToken: string): Promise<AuthTokenResponse> {
    const { data } = await api.post<AuthTokenResponse>('/auth/google', { id_token: idToken });
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async updateProfile(
    updates: { full_name?: string; email?: string; expo_push_token?: string }
  ): Promise<User> {
    const { data } = await api.put<User>('/auth/me', updates);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
  },
};
