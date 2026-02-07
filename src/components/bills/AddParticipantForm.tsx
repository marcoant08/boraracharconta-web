'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBill } from '@/hooks/useBill';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const addParticipantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

type AddParticipantFormData = z.infer<typeof addParticipantSchema>;

interface AddParticipantFormProps {
  billId: string;
  onSuccess?: () => void;
}

export const AddParticipantForm = ({ billId, onSuccess }: AddParticipantFormProps) => {
  const { addParticipant } = useBill(billId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddParticipantFormData>({
    resolver: zodResolver(addParticipantSchema),
  });

  const onSubmit = async (data: AddParticipantFormData) => {
    try {
      await addParticipant(data.name);
      reset();
      onSuccess?.();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome do Participante"
        type="text"
        placeholder="Nome do visitante"
        {...register('name')}
        error={errors.name?.message}
      />
      <Button type="submit" variant="primary" loading={isSubmitting}>
        Adicionar Participante
      </Button>
    </form>
  );
};
