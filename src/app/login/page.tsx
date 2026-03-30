'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui/Card';
import { AppLogo } from '@/components/ui/AppLogo';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <AppLogo />
          <h1 className="text-3xl font-bold text-gray-900">bora rachar conta</h1>
          <p className="mt-2 text-gray-600">Entre na sua conta</p>
        </div>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
