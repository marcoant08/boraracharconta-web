'use client';

import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddItemForm } from './AddItemForm';
import { formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';

export const ItemsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, removeItem } = useBill(billId);
  const user = useAuthStore((state) => state.user);

  if (!bill) return null;

  const isVerifiedParticipant = bill.participants.some(
    (p) => p.userId === user?.id && p.userId !== p.name
  );

  return (
    <div className="space-y-6">
      {isVerifiedParticipant && (
        <Card title="Adicionar Item">
          <AddItemForm />
        </Card>
      )}

      <Card title="Itens">
        {bill.items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum item adicionado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bill.items.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  {isVerifiedParticipant && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Valor unitário: {formatCurrency(item.value)}</p>
                  <p>Quantidade: {item.quantity}</p>
                  <p>Total: {formatCurrency(item.value * item.quantity)}</p>
                  <p>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {item.category}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
