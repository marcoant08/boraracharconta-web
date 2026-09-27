import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginRequest } from '@/types/auth.types';
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

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  }, [logout, router]);

  return {
    login,
    logout: handleLogout,
    isAuthenticated,
    user,
    token,
  };
};
