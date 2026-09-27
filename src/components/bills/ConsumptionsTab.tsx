'use client';

import { useBill } from '@/hooks/useBill';
import { useParams } from 'next/navigation';
import { participantResolvedId } from '@/types/bill.types';
import { formatCurrency } from '@/utils/format';
import { getItemAssignment } from '@/utils/calculate';
import { ConsumptionAssignRow } from './ConsumptionAssignRow';

export const ConsumptionsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill } = useBill(billId);

  if (!bill) return null;

  if (!bill.participants.length) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900">
        Informe as pessoas participantes
      </h1>
    );
  }

  if (!bill.items.length) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900">
        Informe os itens consumidos
      </h1>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl py-5 text-center text-gray-900">
        Quanto cada um consumiu
      </h1>
      {bill.items.map((item) => {
        const assignment = getItemAssignment(bill, item.id);
        const assigned = assignment?.assigned ?? 0;
        const isComplete = assignment?.matchesItemQuantity && assigned > 0;
        const isPartial = assigned > 0 && !assignment?.matchesItemQuantity;

        return (
          <section key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <header className="px-4 pt-4 pb-2">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold text-gray-900 truncate">{item.name}</h2>
                <span className="text-sm text-gray-500 shrink-0">
                  x{item.quantity} · {formatCurrency(item.value)}
                </span>
              </div>
              {item.quantity > 1 && (
                <p
                  className={`mt-2 text-sm font-medium ${
                    isComplete
                      ? 'text-emerald-700'
                      : isPartial
                        ? 'text-amber-700'
                        : 'text-gray-500'
                  }`}
                >
                  {assigned} de {item.quantity} atribuídos
                </p>
              )}
              <p className="mt-1 text-sm text-gray-600">
                {assignment?.consequence}
              </p>
            </header>
            <div className="divide-y divide-gray-100">
              {bill.participants.map((participant) => (
                <ConsumptionAssignRow
                  key={participantResolvedId(participant)}
                  item={item}
                  participant={participant}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
