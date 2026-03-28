import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationCodeRequest,
} from '@/types/auth.types';
import { getAxiosErrorMessage } from '@/utils/api-error';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, logout, isAuthenticated, user, token } = useAuthStore();

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        const response = await authService.login(data);
        setAuth(response.accessToken, response.user);
        toast.success('Login realizado com sucesso!');
        router.push('/');
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao fazer login. Tente novamente.');
        toast.error(message);
        throw error;
      }
    },
    [setAuth, router]
  );

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      await authService.register(data);
      toast.success('Conta criada! Verifique seu email para continuar.');
      return true;
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao criar conta. Tente novamente.');
      toast.error(message);
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async (data: VerifyEmailRequest) => {
    try {
      await authService.verifyEmail(data);
      toast.success('Email verificado com sucesso!');
      router.push('/login');
      return true;
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Código inválido. Tente novamente.');
      toast.error(message);
      throw error;
    }
  }, [router]);

  const resendVerificationCode = useCallback(
    async (data: ResendVerificationCodeRequest) => {
      try {
        await authService.resendVerificationCode(data);
        toast.success('Código reenviado! Verifique seu email.');
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao reenviar código. Tente novamente.');
        toast.error(message);
        throw error;
      }
    },
    []
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  }, [logout, router]);

  return {
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    logout: handleLogout,
    isAuthenticated,
    user,
    token,
  };
};
