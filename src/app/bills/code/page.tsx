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
import Link from 'next/link';
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <AppLogo />
          <h1 className="text-2xl font-bold text-gray-900">Ver Conta</h1>
        </div>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Código da Conta"
              type="text"
              placeholder="ABC1234"
              maxLength={7}
              {...register('code', {
                onChange: (e) => {
                  setValue('code', e.target.value.toUpperCase());
                },
              })}
              error={errors.code?.message}
            />

            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Voltar
                </Button>
              </Link>
              <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>
                Ver Conta
              </Button>
            </div>
          </form>
        </Card>
      </div>
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
