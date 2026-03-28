'use client';

import { useMemo, useCallback, memo } from 'react';
import { useBill } from '@/hooks/useBill';
import { BillItemDto, ParticipantDto, participantResolvedId } from '@/types/bill.types';
import { useParams } from 'next/navigation';

interface ConsumptionItemProps {
  item: BillItemDto;
  participant: ParticipantDto;
}

export const ConsumptionItem = memo(({ item, participant }: ConsumptionItemProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, removeConsumption } = useBill(billId);
  const participantId = participantResolvedId(participant);

  // Criar mapa de consumos para busca O(1) em vez de O(n)
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

  const isSelected = useMemo(() => {
    return (consumptionMap.get(participantId) || 0) > 0;
  }, [consumptionMap, participantId]);

  const handleSelect = useCallback(async () => {
    if (!bill) return;
    try {
      if (isSelected) {
        await removeConsumption({ participantId: participantId, itemId: item.id });
      } else {
        await addConsumption({ participantId: participantId, itemId: item.id, quantity: 1 });
      }
    } catch {
      // Erro já tratado no hook
    }
  }, [bill, isSelected, participantId, item.id, removeConsumption, addConsumption]);

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

ConsumptionItem.displayName = 'ConsumptionItem';
