'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SignInIcon } from '@/components/icons/SignInIcon';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ssoButtonClassName =
  'flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

export const LoginForm = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // Erro já tratado no hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <a href={`${apiBaseUrl}/auth/google`} className={ssoButtonClassName}>
          <GoogleIcon size={18} />
          Entrar com Google
        </a>
        <a href={`${apiBaseUrl}/auth/github`} className={ssoButtonClassName}>
          <GitHubIcon size={18} />
          Entrar com GitHub
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
          <span className="flex items-center gap-2">
            <SignInIcon size={18} />
            Entrar
          </span>
        </Button>
      </form>
    </div>
  );
};
