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
  const { bill, addConsumption, updateConsumption, removeConsumption } = useBill(billId);
  const [showOptions, setShowOptions] = useState(false);

  const getCurrentQuantity = (participantId: string): number => {
    if (!bill) return 0;
    const consumption = bill.consumptions.find(
      (c) => c.participantId === participantId && c.itemId === item.id
    );
    return consumption?.quantity || 0;
  };

  const handleIncrease = async (participantId: string) => {
    if (!bill) return;

    const currentQuantity = getCurrentQuantity(participantId);
    const newQuantity = currentQuantity + 1;

    try {
      if (currentQuantity === 0) {
        // Quando está em 0 e clica no +, vai direto para 2
        await addConsumption({ participantId, itemId: item.id, quantity: 2 });
      } else if (currentQuantity === 1) {
        // Quando está em 1 e clica no +, vai para 2
        await updateConsumption({ participantId, itemId: item.id, quantity: 2 });
      } else {
        // Atualizar consumo existente
        await updateConsumption({ participantId, itemId: item.id, quantity: newQuantity });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleCheckboxToggle = async (participantId: string, checked: boolean) => {
    if (!bill) return;

    try {
      if (checked) {
        // Marcar checkbox = adicionar consumo com quantidade 1
        await addConsumption({ participantId, itemId: item.id, quantity: 1 });
      } else {
        // Desmarcar checkbox = remover consumo
        await removeConsumption({ participantId, itemId: item.id });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDecrease = async (participantId: string) => {
    if (!bill) return;

    const currentQuantity = getCurrentQuantity(participantId);
    const newQuantity = currentQuantity - 1;

    try {
      if (newQuantity <= 0) {
        // Remover consumo se chegar a zero ou negativo
        await removeConsumption({ participantId, itemId: item.id });
      } else {
        // Atualizar consumo existente
        await updateConsumption({ participantId, itemId: item.id, quantity: newQuantity });
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
                    <div className="space-y-2">
                      {(() => {
                        // Verificar se algum participante tem quantidade >= 2 para determinar o modo global
                        const hasAnyQuantityAboveOne = participants.some(
                          (p) => getCurrentQuantity(p.userId) >= 2
                        );
                        const showCheckboxMode = !hasAnyQuantityAboveOne;

                        return participants.map((participant) => {
                          const quantity = getCurrentQuantity(participant.userId);

                          return (
                            <div
                              key={participant.userId}
                              className="flex items-center justify-between gap-2 hover:bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm text-gray-700 flex-1">{participant.name}</span>
                              <div className="flex items-center gap-2">
                                {showCheckboxMode ? (
                                  <>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={quantity === 1}
                                        onChange={(e) => handleCheckboxToggle(participant.userId, e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                      />
                                    </label>
                                    <button
                                      onClick={() => handleIncrease(participant.userId)}
                                      disabled={quantity >= item.quantity}
                                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                                      aria-label="Aumentar quantidade"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4v16m8-8H4"
                                        />
                                      </svg>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleDecrease(participant.userId)}
                                      disabled={quantity === 0}
                                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                                      aria-label="Diminuir quantidade"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 12H4"
                                        />
                                      </svg>
                                    </button>
                                    <span className="text-sm font-medium text-gray-900 min-w-[24px] text-center">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={() => handleIncrease(participant.userId)}
                                      disabled={quantity >= item.quantity}
                                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                                      aria-label="Aumentar quantidade"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4v16m8-8H4"
                                        />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
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
