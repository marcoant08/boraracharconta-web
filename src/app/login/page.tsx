'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <figure className="hidden lg:block relative m-0 overflow-hidden bg-[#f7f3ed]">
        <img
          src="/friends.PNG"
          alt="Quatro amigos à mesa, cada um com o próprio valor no celular."
          className="absolute inset-0 h-full w-full object-contain p-10"
        />
      </figure>
      <section className="flex min-h-screen flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <p className="font-[family-name:var(--font-cantata)] text-2xl text-[#154524]">racha conta</p>
        <h1 className="mt-8 max-w-[12ch] font-[family-name:var(--font-cantata)] text-4xl leading-none text-[#0b2a19] sm:text-5xl">
          Entre na sua conta
        </h1>
        <p className="mt-4 max-w-md text-base text-[#0c2919]">
          Google ou GitHub. Depois você cria a conta e compartilha o código.
        </p>
        <div className="mt-8 max-w-sm">
          <LoginForm />
        </div>
        <Link
          href="/bills/code"
          className="mt-8 w-fit text-sm text-[#0c2919] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#297747]"
        >
          Ver por código
        </Link>
      </section>
    </main>
  );
}
