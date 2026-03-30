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
import { AppNavbar } from '@/components/ui/AppNavbar';
import { AppFooter } from '@/components/ui/AppFooter';
import { getAxiosErrorMessage } from '@/utils/api-error';
import toast from 'react-hot-toast';

const createBillSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  isPublic: z.boolean(),
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
    defaultValues: { isPublic: true },
  });

  const onSubmit = async (data: CreateBillFormData) => {
    try {
      const bill = await billService.createBill({ name: data.name, isPublic: data.isPublic });
      toast.success('Conta criada com sucesso!');
      router.push(`/bills/${bill.id}`);
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao criar conta.');
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar action="back" />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <AppLogo />
            <h1 className="text-2xl font-bold text-gray-900">Criar Nova Conta</h1>
          </div>
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome da Conta"
                type="text"
                placeholder="Ex: Jantar no restaurante"
                {...register('name')}
                error={errors.name?.message}
              />

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  {...register('isPublic')}
                />
                <span className="text-sm text-gray-700">Conta pública (visível por código)</span>
              </label>

              <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                Criar Conta
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
