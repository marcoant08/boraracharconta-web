'use client';

import { useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { capitalize } from '@/utils/format';
import toast from 'react-hot-toast';

interface AddParticipantFormProps {
  billId: string;
  onSuccess?: () => void;
}

export const AddParticipantForm = ({ billId, onSuccess }: AddParticipantFormProps) => {
  const { bill, addParticipant } = useBill(billId);
  const [name, setName] = useState('');

  const onAddParticipant = async () => {
    if (name.trim().length === 0) {
      return toast.error('Adicione o nome da pessoa');
    }

    const participantExists = bill?.participants.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (participantExists) {
      return toast.error(`'${name}' já foi adicionado`);
    }

    try {
      await addParticipant(capitalize(name.trim()));
      setName('');
      toast.success('Pessoa adicionada');
      onSuccess?.();
    } catch {
      // Erro já tratado no hook
    }
  };

  return (
    <div className="flex gap-5 w-full justify-between pt-5">
      <input
        type="text"
        placeholder="Digite o nome da pessoa..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyUp={(e) => {
          if (['Enter', 'NumpadEnter'].includes(e.code)) onAddParticipant();
        }}
        className="bg-white w-full rounded-full shadow-md p-4 outline-none disabled:bg-gray-300 text-gray-900 placeholder-gray-500"
      />
      <button
        onClick={onAddParticipant}
        className="bg-primary-500 shadow-lg p-4 justify-center items-center rounded-full flex ml-auto hover:opacity-90 transition-opacity"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </button>
    </div>
  );
};
