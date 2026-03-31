'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { UserPlusIcon } from '@/components/icons/UserPlusIcon';
import Link from 'next/link';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().optional(),
});

const verifySchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type VerifyFormData = z.infer<typeof verifySchema>;

export const RegisterForm = () => {
  const { register: registerUser, verifyEmail, resendVerificationCode } = useAuth();
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors, isSubmitting: isVerifying },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      setRegisteredEmail(data.email);
      setShowVerification(true);
    } catch {
      // Erro já tratado no hook
    }
  };

  const onVerify = async (data: VerifyFormData) => {
    try {
      await verifyEmail({ email: registeredEmail, code: data.code });
    } catch {
      // Erro já tratado no hook
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode({ email: registeredEmail });
    } catch {
      // Erro já tratado no hook
    }
  };

  if (showVerification) {
    return (
      <Card title="Verificar Email">
        <p className="text-gray-600 mb-4">
          Enviamos um código de verificação para <strong>{registeredEmail}</strong>
        </p>
        <form onSubmit={handleSubmitVerify(onVerify)} className="space-y-4">
          <Input
            label="Código de Verificação"
            type="text"
            placeholder="000000"
            maxLength={6}
            {...registerVerify('code')}
            error={verifyErrors.code?.message}
          />

          <Button type="submit" variant="primary" className="w-full" loading={isVerifying}>
            Verificar
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleResendCode}
          >
            Reenviar Código
          </Button>
        </form>
      </Card>
    );
  }

  return (
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

      <Input
        label="Nome (opcional)"
        type="text"
        placeholder="Seu nome"
        {...register('name')}
        error={errors.name?.message}
      />

      <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
        <span className="flex items-center gap-2">
          <UserPlusIcon size={18} />
          Cadastrar
        </span>
      </Button>

      <p className="text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700">
          Faça login
        </Link>
      </p>
    </form>
  );
};
