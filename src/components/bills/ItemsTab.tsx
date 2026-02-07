'use client';

import { useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddItemForm } from './AddItemForm';
import { formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';
import { BillItemDto, ParticipantDto } from '@/types/bill.types';

interface ItemCardProps {
  item: BillItemDto;
  participants: ParticipantDto[];
  isVerifiedParticipant: boolean;
  onRemove: (itemId: string) => void;
}

const ItemCard = ({ item, participants, isVerifiedParticipant, onRemove }: ItemCardProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, removeConsumption } = useBill(billId);
  const [showOptions, setShowOptions] = useState(false);

  const getConsumingParticipants = (): string[] => {
    if (!bill) return [];
    return bill.consumptions
      .filter((c) => c.itemId === item.id && (c.quantity || 0) > 0)
      .map((c) => c.participantId);
  };

  const consumingParticipants = getConsumingParticipants();

  const handleParticipantToggle = async (participantId: string, checked: boolean) => {
    if (!bill) return;

    try {
      if (checked) {
        // Adicionar consumo (quantidade padrão 1)
        await addConsumption({ participantId, itemId: item.id, quantity: 1 });
      } else {
        // Remover consumo
        await removeConsumption({ participantId, itemId: item.id });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 flex-1">{item.name}</h4>
        <div className="flex gap-2 relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 hover:bg-gray-100 rounded transition-colors relative z-10"
            aria-label="Mostrar opções"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${showOptions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showOptions && (
            <>
              {/* Overlay para fechar ao clicar fora */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowOptions(false)}
              />
              {/* Popup dropdown */}
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[200px] max-w-[300px]">
                <div className="p-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700">
                    Participantes que consumiram:
                  </label>
                </div>
                <div className="max-h-48 overflow-y-auto p-2">
                  {participants.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">Nenhum participante</p>
                  ) : (
                    <div className="space-y-1">
                      {participants.map((participant) => {
                        const isConsuming = consumingParticipants.includes(participant.userId);
                        return (
                          <label
                            key={participant.userId}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={isConsuming}
                              onChange={(e) => handleParticipantToggle(participant.userId, e.target.checked)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{participant.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {isVerifiedParticipant && (
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 hover:bg-red-100 rounded transition-colors text-red-600 hover:text-red-700"
              aria-label="Remover item"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
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
  );
};

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
              <ItemCard
                key={item.id}
                item={item}
                participants={bill.participants}
                isVerifiedParticipant={isVerifiedParticipant}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
