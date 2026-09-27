'use client';

import { FormEvent, useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { capitalize } from '@/utils/format';
import toast from 'react-hot-toast';

interface AddParticipantFormProps {
  billId: string;
  onSuccess?: () => void;
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
  </svg>
);

export const AddParticipantForm = ({ billId, onSuccess }: AddParticipantFormProps) => {
  const { bill, addParticipant } = useBill(billId);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = name.trim().length > 0;

  const onAddParticipant = async () => {
    if (!canSubmit) {
      toast.error('Adicione o nome da pessoa');
      return;
    }

    const participantExists = bill?.participants.some(
      (participant) => participant.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (participantExists) {
      toast.error(`'${name}' já foi adicionado`);
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      await addParticipant(capitalize(name.trim()));
      setName('');
      toast.success('Pessoa adicionada');
      onSuccess?.();
    } catch {
      // Erro já tratado no hook
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void onAddParticipant();
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3 pt-5">
      <input
        type="text"
        name="participant-name"
        placeholder="Digite o nome da pessoa..."
        value={name}
        aria-label="Nome da pessoa"
        autoComplete="off"
        onChange={(event) => setName(event.target.value)}
        className="bg-white w-full h-14 min-w-0 flex-1 rounded-full shadow-md px-5 outline-none text-gray-900 placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
      />
      <button
        type="submit"
        disabled={submitting}
        aria-disabled={!canSubmit || submitting}
        aria-label="Adicionar pessoa"
        className={`shrink-0 h-14 w-14 justify-center items-center rounded-full flex bg-primary-500 text-white shadow-lg transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 disabled:cursor-not-allowed disabled:opacity-40 ${
          canSubmit ? 'hover:opacity-90' : 'opacity-40'
        }`}
      >
        <CheckIcon />
      </button>
    </form>
  );
};
