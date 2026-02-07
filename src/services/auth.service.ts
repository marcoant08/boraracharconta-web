import api from './api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationCodeRequest,
  ResendVerificationCodeResponse,
} from '@/types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
    return response.data;
  },

  async resendVerificationCode(
    data: ResendVerificationCodeRequest
  ): Promise<ResendVerificationCodeResponse> {
    const response = await api.post<ResendVerificationCodeResponse>(
      '/auth/resend-verification-code',
      data
    );
    return response.data;
  },
};
