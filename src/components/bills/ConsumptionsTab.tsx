'use client';

import { useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { useParams } from 'next/navigation';
import { BillItemDto, participantResolvedId } from '@/types/bill.types';
import { formatCurrency } from '@/utils/format';
import { getConsumptionGaps, getConsumptionWeight, getItemAssignment, getItemConsumptions } from '@/utils/calculate';
import { ConsumptionAssignRow } from './ConsumptionAssignRow';

interface ConsumptionsTabProps {
  onGoToParticipants?: () => void;
  onGoToItems?: () => void;
  showGaps?: boolean;
}

const joinNames = (names: string[]): string => {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
};

const tabLinkClass =
  'font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2';

const TabLink = ({ label, onClick }: { label: string; onClick?: () => void }) => {
  if (!onClick) return <span className="font-medium text-primary-700">{label}</span>;

  return (
    <button type="button" onClick={onClick} className={tabLinkClass}>
      {label}
    </button>
  );
};

export const ConsumptionsTab = ({
  onGoToParticipants,
  onGoToItems,
  showGaps = false,
}: ConsumptionsTabProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, setItemSplitEqually, updateConsumption } = useBill(billId);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  if (!bill) return null;

  const needsPeople = bill.participants.length === 0;
  const needsItems = bill.items.length === 0;

  if (needsPeople || needsItems) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900 text-balance">
        É preciso adicionar{' '}
        {needsPeople && (
          <>
            pessoas em <TabLink label="Participantes" onClick={onGoToParticipants} />
          </>
        )}
        {needsPeople && needsItems && ' e '}
        {needsItems && (
          <>
            itens em <TabLink label="Itens" onClick={onGoToItems} />
          </>
        )}
        .
      </h1>
    );
  }

  const handleSplitEquallyChange = async (item: BillItemDto, checked: boolean) => {
    if (togglingItemId) return;
    setTogglingItemId(item.id);
    setItemSplitEqually(item.id, checked);
    try {
      if (checked) {
        const toNormalize = getItemConsumptions(bill, item.id).filter(
          (consumption) => getConsumptionWeight(consumption) !== 1
        );
        await Promise.all(
          toNormalize.map((consumption) =>
            updateConsumption({
              participantId: consumption.participantId,
              itemId: item.id,
              quantity: 1,
            })
          )
        );
      }
    } catch {
      setItemSplitEqually(item.id, !checked);
    } finally {
      setTogglingItemId(null);
    }
  };

  const gaps = showGaps ? getConsumptionGaps(bill) : { people: [], items: [] };

  const hasGaps = gaps.people.length > 0 || gaps.items.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <h1 className={`text-xl text-center text-gray-900 ${hasGaps ? 'pt-5 pb-2' : 'py-5'}`}>
        Marque o que cada um consumiu
      </h1>
      {hasGaps && (
        <div className="pb-3 text-center text-sm leading-5 text-red-700/80 text-balance">
          {gaps.people.length > 0 && (
            <p>
              {joinNames(gaps.people)} ainda não {gaps.people.length === 1 ? 'consumiu' : 'consumiram'} nenhum item.
            </p>
          )}
          {gaps.items.length > 0 && <p>Ninguém consumiu {joinNames(gaps.items)}.</p>}
        </div>
      )}
      {bill.items.map((item) => {
        const assignment = getItemAssignment(bill, item.id);
        const assigned = assignment?.assigned ?? 0;
        const splitEqually = Boolean(item.splitEqually);
        const showQuantityBar = item.quantity > 1 && !splitEqually;
        const isComplete = assignment?.matchesItemQuantity && assigned > 0;
        const isPartial = assigned > 0 && !assignment?.matchesItemQuantity;

        return (
          <section key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <header className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-semibold text-gray-900 truncate">{item.name}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-gray-500">
                    x{item.quantity} · {formatCurrency(item.value)}
                  </span>
                  {item.quantity > 1 && (
                    <label
                      className={`flex items-center gap-1.5 text-sm text-gray-600 ${
                        togglingItemId === item.id ? 'opacity-60' : 'cursor-pointer'
                      }`}
                      title="Dividir o valor igualmente entre quem marcar"
                    >
                      <input
                        type="checkbox"
                        checked={splitEqually}
                        disabled={togglingItemId === item.id}
                        onChange={(event) => handleSplitEquallyChange(item, event.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span>Dividir igual</span>
                    </label>
                  )}
                </div>
              </div>
              {showQuantityBar && (
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
