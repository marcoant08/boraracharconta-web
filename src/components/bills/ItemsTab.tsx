'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
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

const ItemCard = memo(({ item, participants, isVerifiedParticipant, onRemove }: ItemCardProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, removeConsumption } = useBill(billId);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [iconIndex, setIconIndex] = useState<number>(Math.floor(Math.random() * 4));

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
  }, [bill, item.id, addConsumption, removeConsumption]);

  const changeIcon = useCallback(() => {
    setIconIndex(iconIndex >= 3 ? 0 : iconIndex + 1);
  }, [iconIndex]);

  const icons = useMemo(() => [
    <svg key="beer" className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 6h-2V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 4h8v2H8V4zm12 14H4V8h16v10z"/>
    </svg>,
    <svg key="pizza" className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>,
    <svg key="orange" className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6" fill="white" opacity="0.3"/>
    </svg>,
    <svg key="cheers" className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 2c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1zm2.08 4c.48-.6 1.18-1 2-1s1.52.4 2 1l1.7 2.26L12.25 8l1.45 1.92L14.33 8H19c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h2.08zM7 10v8h10v-8H7z"/>
    </svg>,
  ], []);

  return (
    <div className="">
      <div className="bg-white rounded-full px-3 py-2 shadow-sm flex">
        <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
          <div onClick={changeIcon} className="cursor-pointer">{icons[iconIndex] || icons[0]}</div>
          <span className="text-xl text-gray-900">x{item.quantity}</span>
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
                const quantity = getCurrentQuantity(participant.userId);
                const isSelected = quantity > 0;
                return (
                  <div
                    key={participant.userId}
                    onClick={() => handleCheckboxToggle(participant.userId, !isSelected)}
                    className="flex gap-2 items-center ml-6 w-fit cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
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
    <>
      {isVerifiedParticipant && <AddItemForm />}

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
              isVerifiedParticipant={isVerifiedParticipant}
              onRemove={removeItem}
            />
          )).reverse()}
        </div>
      )}
    </>
  );
};
