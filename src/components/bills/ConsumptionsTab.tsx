'use client';

import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
import { ConsumptionItem } from './ConsumptionItem';
import { useParams } from 'next/navigation';
import { participantResolvedId } from '@/types/bill.types';

export const ConsumptionsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill } = useBill(billId);
  const user = useAuthStore((state) => state.user);

  if (!bill) return null;

  const isVerifiedParticipant = bill.participants.some(
    (p) => p.userId === user?.id && p.userId !== p.name
  );

  if (!isVerifiedParticipant) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900">
        Apenas participantes verificados podem gerenciar consumos.
      </h1>
    );
  }

  if (!bill.participants.length) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900">
        👤 Informe as pessoas participantes
      </h1>
    );
  }

  if (!bill.items.length) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900">
        🍕 Informe os itens consumidos
      </h1>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl py-5 text-center text-gray-900">
        Marque o consumo das pessoas ⬇️
      </h1>
      {bill.participants.map((participant) => (
        <div key={participantResolvedId(participant)}>
          <div className="flex gap-3 items-center mb-2">
            <span className="whitespace-nowrap font-semibold text-gray-900">
              {participant.name} 👤⬇️
            </span>
            <div className="h-0.5 w-full bg-gray-300" />
          </div>
          {bill.items.map((item) => (
            <ConsumptionItem
              key={item.id}
              item={item}
              participant={participant}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
