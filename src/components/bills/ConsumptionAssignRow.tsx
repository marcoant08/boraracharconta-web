'use client';

import { memo, useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBill } from '@/hooks/useBill';
import { BillItemDto, ParticipantDto, participantResolvedId } from '@/types/bill.types';
import { getParticipantItemQuantity } from '@/utils/calculate';

interface ConsumptionAssignRowProps {
  item: BillItemDto;
  participant: ParticipantDto;
}

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-primary-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const ConsumptionAssignRow = memo(({ item, participant }: ConsumptionAssignRowProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, updateConsumption, removeConsumption } = useBill(billId);
  const participantId = participantResolvedId(participant);
  const [loading, setLoading] = useState(false);

  const quantity = bill ? getParticipantItemQuantity(bill, participantId, item.id) : 0;
  const isSharedItem = item.quantity === 1;

  const setQuantity = useCallback(
    async (next: number) => {
      if (!bill || loading) return;
      const clamped = Math.max(0, Math.min(item.quantity, next));
      if (clamped === quantity) return;

      setLoading(true);
      try {
        if (clamped <= 0) {
          if (quantity > 0) {
            await removeConsumption({ participantId, itemId: item.id });
          }
        } else if (quantity <= 0) {
          await addConsumption({ participantId, itemId: item.id, quantity: clamped });
        } else {
          await updateConsumption({ participantId, itemId: item.id, quantity: clamped });
        }
      } catch {
        // Erro já tratado no hook
      } finally {
        setLoading(false);
      }
    },
    [
      bill,
      loading,
      item.quantity,
      item.id,
      quantity,
      participantId,
      addConsumption,
      updateConsumption,
      removeConsumption,
    ]
  );

  if (isSharedItem) {
    return (
      <button
        type="button"
        className="flex w-full gap-3 items-center px-4 py-3 hover:bg-gray-50 disabled:opacity-60 text-left"
        onClick={() => setQuantity(quantity > 0 ? 0 : 1)}
        disabled={loading}
        aria-pressed={quantity > 0}
      >
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {loading ? (
            <Spinner />
          ) : (
            <input
              type="checkbox"
              checked={quantity > 0}
              onChange={() => {}}
              tabIndex={-1}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 pointer-events-none"
            />
          )}
        </span>
        <span className="text-gray-900">{participant.name}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-gray-900 min-w-0 truncate">{participant.name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setQuantity(quantity - 1)}
          disabled={loading || quantity <= 0}
          aria-label={`Diminuir quantidade de ${participant.name}`}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span
          className="w-6 text-center font-semibold text-gray-900 tabular-nums"
          aria-live="polite"
        >
          {loading ? <Spinner /> : quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          disabled={loading || quantity >= item.quantity}
          aria-label={`Aumentar quantidade de ${participant.name}`}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
});

ConsumptionAssignRow.displayName = 'ConsumptionAssignRow';
