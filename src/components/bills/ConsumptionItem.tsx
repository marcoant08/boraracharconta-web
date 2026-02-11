'use client';

import { useMemo, useCallback, memo } from 'react';
import { useBill } from '@/hooks/useBill';
import { BillItemDto, ParticipantDto } from '@/types/bill.types';
import { useParams } from 'next/navigation';

interface ConsumptionItemProps {
  item: BillItemDto;
  participant: ParticipantDto;
}

export const ConsumptionItem = memo(({ item, participant }: ConsumptionItemProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, removeConsumption } = useBill(billId);

  // Criar mapa de consumos para busca O(1) em vez de O(n)
  const consumptionMap = useMemo(() => {
    if (!bill?.consumptions) return new Map<string, number>();
    const map = new Map<string, number>();
    bill.consumptions.forEach((c) => {
      if (c.itemId === item.id) {
        map.set(c.participantId, c.quantity);
      }
    });
    return map;
  }, [bill?.consumptions, item.id]);

  const isSelected = useMemo(() => {
    return (consumptionMap.get(participant.userId) || 0) > 0;
  }, [consumptionMap, participant.userId]);

  const handleSelect = useCallback(async () => {
    if (!bill) return;
    try {
      if (isSelected) {
        await removeConsumption({ participantId: participant.userId, itemId: item.id });
      } else {
        await addConsumption({ participantId: participant.userId, itemId: item.id, quantity: 1 });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  }, [bill, isSelected, participant.userId, item.id, removeConsumption, addConsumption]);

  return (
    <button
      className="flex w-full gap-2 items-center bg-white shadow-md rounded-lg my-2 p-4 hover:shadow-lg transition-shadow"
      onClick={handleSelect}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {}}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
      />
      <span className="text-gray-900">{item.name}</span>
    </button>
  );
});
