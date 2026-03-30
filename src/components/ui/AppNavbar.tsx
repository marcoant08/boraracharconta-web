'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from './Button';

interface AppNavbarProps {
  action?: 'logout' | 'back' | 'public';
}

export const AppNavbar = ({ action = 'back' }: AppNavbarProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const renderAction = () => {
    if (action === 'logout') {
      return (
        <Button variant="secondary" size="sm" onClick={logout}>
          Sair
        </Button>
      );
    }
    if (action === 'public') {
      return isAuthenticated ? (
        <Button variant="secondary" size="sm" onClick={() => router.push('/')}>
          Voltar
        </Button>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => router.push('/login')}>
          Entrar
        </Button>
      );
    }
    return (
      <Button variant="secondary" size="sm" onClick={() => router.push('/')}>
        Voltar
      </Button>
    );
  };

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">bora rachar conta</h1>
        <div className="flex items-center gap-3">
          {user && <span className="text-gray-700 text-sm hidden sm:inline">Olá, {user.name}</span>}
          {renderAction()}
        </div>
      </div>
    </header>
  );
};
