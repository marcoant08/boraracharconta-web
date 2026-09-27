'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { User } from '@/types/auth.types';

const errorMessages: Record<string, string> = {
  oauth_denied: 'Login cancelado.',
  invalid_state: 'Não foi possível validar o login. Tente novamente.',
  email_required: 'O provedor não retornou um email verificado.',
  email_unverified: 'Este email ainda não foi verificado.',
  oauth_failed: 'Não foi possível entrar. Tente novamente.',
  oauth_not_configured: 'Login social ainda não está configurado.',
};

const handledCallbacks = new Set<string>();

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string'
  );
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const routerRef = useRef(router);
  const setAuthRef = useRef(setAuth);
  routerRef.current = router;
  setAuthRef.current = setAuth;

  useEffect(() => {
    const key = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (handledCallbacks.has(key)) {
      return;
    }

    handledCallbacks.add(key);

    const error = new URLSearchParams(window.location.search).get('error');
    if (error) {
      toast.error(errorMessages[error] || 'Não foi possível entrar. Tente novamente.');
      routerRef.current.replace('/login');
    } else {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hash.get('accessToken');
      const userRaw = hash.get('user');

      if (!accessToken || !userRaw) {
        toast.error('Não foi possível concluir o login.');
        routerRef.current.replace('/login');
      } else {
        try {
          const parsed: unknown = JSON.parse(userRaw);
          if (!isUser(parsed)) {
            throw new Error('invalid user');
          }

          setAuthRef.current(accessToken, parsed);
          toast.success('Login realizado com sucesso!');
          routerRef.current.replace('/');
        } catch {
          toast.error('Não foi possível concluir o login.');
          routerRef.current.replace('/login');
        }
      }
    }

    return () => {
      queueMicrotask(() => {
        handledCallbacks.delete(key);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Entrando...</p>
    </div>
  );
}
