'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBill } from '@/hooks/useBill';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useParams } from 'next/navigation';

const addItemSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  value: z.number().min(0.01, 'Valor deve ser maior que zero'),
  quantity: z.number().int().min(1, 'Quantidade deve ser no mínimo 1'),
  category: z.string().min(1, 'Categoria é obrigatória'),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

export const AddItemForm = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { addItem } = useBill(billId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
  });

  const onSubmit = async (data: AddItemFormData) => {
    try {
      await addItem({
        name: data.name,
        value: data.value,
        quantity: data.quantity,
        category: data.category,
      });
      reset();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome do Item"
        type="text"
        placeholder="Ex: Pizza Margherita"
        {...register('name')}
        error={errors.name?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valor Unitário"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('value', { valueAsNumber: true })}
          error={errors.value?.message}
        />

        <Input
          label="Quantidade"
          type="number"
          placeholder="1"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />
      </div>

      <Input
        label="Categoria"
        type="text"
        placeholder="Ex: Bebida, Comida, etc."
        {...register('category')}
        error={errors.category?.message}
      />

      <Button type="submit" variant="primary" loading={isSubmitting}>
        Adicionar Item
      </Button>
    </form>
  );
};
