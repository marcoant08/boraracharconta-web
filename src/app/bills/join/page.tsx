'use client';

import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { billService } from '@/services/bill.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { getAxiosErrorMessage } from '@/utils/api-error';
import toast from 'react-hot-toast';

const joinBillSchema = z.object({
  code: z.string().length(7, 'Código deve ter exatamente 7 caracteres'),
});

type JoinBillFormData = z.infer<typeof joinBillSchema>;

function JoinBillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromQuery = searchParams.get('code');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JoinBillFormData>({
    resolver: zodResolver(joinBillSchema),
  });

  useEffect(() => {
    if (codeFromQuery) {
      setValue('code', codeFromQuery.toUpperCase());
    }
  }, [codeFromQuery, setValue]);

  const onSubmit = async (data: JoinBillFormData) => {
    try {
      const response = await billService.joinBill({ code: data.code.toUpperCase() });
      toast.success('Entrou na conta com sucesso!');
      router.push(`/bills/${response.billId}`);
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao entrar na conta.');
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card title="Entrar na Conta">
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
                Entrar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function JoinBillPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Carregando…</p>
        </div>
      }
    >
      <JoinBillContent />
    </Suspense>
  );
}
