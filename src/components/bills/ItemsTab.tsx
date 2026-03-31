'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useBill } from '@/hooks/useBill';
import { AddItemForm } from './AddItemForm';
import { formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';
import { BillItemDto, ParticipantDto, participantResolvedId } from '@/types/bill.types';

interface ItemCardProps {
  item: BillItemDto;
  participants: ParticipantDto[];
  isVerifiedParticipant: boolean;
  onRemove: (itemId: string) => void;
}

const ItemCard = memo(({ item, participants, isVerifiedParticipant, onRemove }: ItemCardProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, removeConsumption } = useBill(billId);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [iconIndex, setIconIndex] = useState<number>(Math.floor(Math.random() * 4));
  const [loadingParticipantId, setLoadingParticipantId] = useState<string | null>(null);

  // Criar mapa de consumos para busca O(1) em vez de O(n) para cada participante
  const consumptionMap = useMemo(() => {
    if (!bill?.consumptions) return new Map<string, number>();
    const map = new Map<string, number>();
    bill.consumptions.forEach((c) => {
      if (c.itemId === item.id) {
        map.set(c.participantId, c.quantity ?? 0);
      }
    });
    return map;
  }, [bill?.consumptions, item.id]);

  const getCurrentQuantity = useCallback((participantId: string): number => {
    return consumptionMap.get(participantId) || 0;
  }, [consumptionMap]);

  const handleCheckboxToggle = useCallback(async (participantId: string, checked: boolean) => {
    if (!bill || loadingParticipantId) return;
    setLoadingParticipantId(participantId);
    try {
      if (checked) {
        await addConsumption({ participantId, itemId: item.id, quantity: 1 });
      } else {
        await removeConsumption({ participantId, itemId: item.id });
      }
    } catch {
      // Erro já tratado no hook
    } finally {
      setLoadingParticipantId(null);
    }
  }, [bill, loadingParticipantId, item.id, addConsumption, removeConsumption]);

  return (
    <div className="">
      <div className="bg-white rounded-full px-3 py-2 shadow-sm flex">
        <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
          <span className="text-xl mr-3 text-gray-900">x{item.quantity}</span>
          <div onClick={() => setShowDetails(!showDetails)} className="flex-1 min-w-0 cursor-pointer">
            <h1 className="truncate text-lg text-ellipsis font-semibold max-w-36 min-[400px]:max-w-44 md:max-w-80 text-gray-900">
              {item.name}
            </h1>
            <span className="text-sm text-gray-600">{formatCurrency(item.value)}</span>
          </div>
        </div>
        <button
          className="py-2 px-2 flex items-center justify-center w-10 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <svg
            className={`w-5 h-5 text-gray-800 transition-transform ${showDetails ? 'rotate-180' : ''}`}
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
        {isVerifiedParticipant && (
          <button
            onClick={() => onRemove(item.id)}
            className="py-2 px-2 flex items-center justify-center w-10 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <svg
              className="w-5 h-5 text-gray-700"
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

      {showDetails && (
        <div className="py-2 px-6 flex flex-col gap-1">
          {!participants.length ? (
            <h1 className="text-center text-gray-600">⚠️ Adicione pessoas</h1>
          ) : (
            <>
              <span className="text-sm text-gray-600">⬆️ Consumo:</span>
              {participants.map((participant) => {
                const pid = participantResolvedId(participant);
                const quantity = getCurrentQuantity(pid);
                const isSelected = quantity > 0;
                return (
                  <div
                    key={pid}
                    onClick={() => !loadingParticipantId && handleCheckboxToggle(pid, !isSelected)}
                    className={`flex gap-2 items-center ml-6 w-fit transition-opacity ${loadingParticipantId ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-70'}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {loadingParticipantId === pid ? (
                        <svg
                          className="animate-spin h-4 w-4 text-primary-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                        />
                      )}
                    </span>
                    <span className="text-sm text-gray-700">{participant.name}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
});

ItemCard.displayName = 'ItemCard';

export const ItemsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, removeItem } = useBill(billId);

  if (!bill) return null;

  return (
    <>
      <AddItemForm />

      {bill.items.length === 0 ? (
        <h1 className="text-xl py-5 text-center text-gray-900">
          🍕 Adicione os itens
        </h1>
      ) : (
        <h1 className="text-xl py-5 text-center text-gray-900">
          {bill.items.length.toString().padStart(2, '0')} item adicionado
          {bill.items.length > 1 && 's'}
        </h1>
      )}

      {bill.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {bill.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              participants={bill.participants}
              isVerifiedParticipant={true}
              onRemove={removeItem}
            />
          )).reverse()}
        </div>
      )}
    </>
  );
};
