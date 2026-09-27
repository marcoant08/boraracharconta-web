'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AppLogo } from '@/components/ui/AppLogo';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { AppFooter } from '@/components/ui/AppFooter';
import { Suspense } from 'react';

const schema = z.object({
  code: z.string().length(7, 'Código deve ter exatamente 7 caracteres'),
});

type FormData = z.infer<typeof schema>;

function BillCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromQuery = searchParams.get('code');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (codeFromQuery) {
      setValue('code', codeFromQuery.toUpperCase());
    }
  }, [codeFromQuery, setValue]);

  const onSubmit = (data: FormData) => {
    router.push(`/bills/code/${data.code.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar action="back" />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <AppLogo />
            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
              Ver Conta
            </h1>
          </div>
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Código da Conta"
                type="text"
                placeholder="ABC1234"
                maxLength={7}
                className="font-mono tracking-[0.2em] uppercase text-center"
                {...register('code', {
                  onChange: (e) => {
                    setValue('code', e.target.value.toUpperCase());
                  },
                })}
                error={errors.code?.message}
              />

              <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                Ver Conta
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export default function BillCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Carregando…</p>
        </div>
      }
    >
      <BillCodeContent />
    </Suspense>
  );
}
