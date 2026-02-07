'use client';

import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { ConsumptionItem } from './ConsumptionItem';
import { useParams } from 'next/navigation';

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
      <Card>
        <p className="text-gray-500 text-center py-8">
          Apenas participantes verificados podem gerenciar consumos.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Consumos">
      {bill.items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Adicione itens primeiro para marcar consumos.
        </p>
      ) : (
        <div className="space-y-6">
          {bill.items.map((item) => (
            <ConsumptionItem key={item.id} item={item} participants={bill.participants} />
          ))}
        </div>
      )}
    </Card>
  );
};
