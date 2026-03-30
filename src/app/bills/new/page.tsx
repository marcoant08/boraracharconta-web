'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { billService } from '@/services/bill.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AppLogo } from '@/components/ui/AppLogo';
import Link from 'next/link';
import { getAxiosErrorMessage } from '@/utils/api-error';
import toast from 'react-hot-toast';

const createBillSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

type CreateBillFormData = z.infer<typeof createBillSchema>;

export default function NewBillPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBillFormData>({
    resolver: zodResolver(createBillSchema),
  });

  const onSubmit = async (data: CreateBillFormData) => {
    try {
      const bill = await billService.createBill({ name: data.name });
      toast.success('Conta criada com sucesso!');
      router.push(`/bills/${bill.id}`);
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao criar conta.');
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <AppLogo />
        </div>
        <Card title="Criar Nova Conta">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome da Conta"
              type="text"
              placeholder="Ex: Jantar no restaurante"
              {...register('name')}
              error={errors.name?.message}
            />

            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Voltar
                </Button>
              </Link>
              <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>
                Criar Conta
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
