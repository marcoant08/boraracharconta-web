'use client';

import { useMemo, useCallback, memo, useState } from 'react';
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
  const [loading, setLoading] = useState(false);

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
    if (!bill || loading) return;
    setLoading(true);
    try {
      if (isSelected) {
        await removeConsumption({ participantId, itemId: item.id });
      } else {
        await addConsumption({ participantId, itemId: item.id, quantity: 1 });
      }
    } catch {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  }, [bill, loading, isSelected, participantId, item.id, removeConsumption, addConsumption]);

  return (
    <button
      className="flex w-full gap-2 items-center p-4 hover:bg-gray-50 disabled:opacity-60"
      onClick={handleSelect}
      disabled={loading}
    >
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {loading ? (
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
      <span className="text-gray-900">{item.name}</span>
    </button>
  );
});

ConsumptionItem.displayName = 'ConsumptionItem';
