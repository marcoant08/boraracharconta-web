'use client';

import { ReactNode } from 'react';
import { useBill } from '@/hooks/useBill';
import { useParams } from 'next/navigation';
import { getConsumptionGaps, isConsumptionStepComplete } from '@/utils/calculate';
import { BillParticipantSummary } from './BillParticipantSummary';
import { BillItemDetailedCalc } from './BillItemDetailedCalc';
import { ServiceFeeCard } from './ServiceFeeCard';

interface StatisticsTabProps {
  onGoToParticipants?: () => void;
  onGoToItems?: () => void;
  onGoToConsumptions?: () => void;
}

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

const joinNames = (names: string[]): string => {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
};

const joinSteps = (steps: ReactNode[]) => {
  if (steps.length <= 1) return steps[0];
  if (steps.length === 2) {
    return (
      <>
        {steps[0]} e {steps[1]}
      </>
    );
  }

  return (
    <>
      {steps[0]}, {steps[1]} e {steps[2]}
    </>
  );
};

export const StatisticsTab = ({
  onGoToParticipants,
  onGoToItems,
  onGoToConsumptions,
}: StatisticsTabProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill } = useBill(billId);

  if (!bill) return null;

  const needsPeople = bill.participants.length === 0;
  const needsItems = bill.items.length === 0;
  const needsConsumptions = !needsPeople && !needsItems && !isConsumptionStepComplete(bill);

  const missingSteps = [
    needsPeople ? { label: 'Participantes', onClick: onGoToParticipants } : null,
    needsItems ? { label: 'Itens', onClick: onGoToItems } : null,
    needsConsumptions ? { label: 'Consumos', onClick: onGoToConsumptions } : null,
  ].filter((step): step is { label: string; onClick: (() => void) | undefined } => step !== null);

  if (missingSteps.length > 0) {
    const gaps = needsConsumptions ? getConsumptionGaps(bill) : { people: [], items: [] };

    return (
      <div className="py-5 text-center">
        <h1 className="text-xl text-gray-900 text-balance">
          É preciso preencher {joinSteps(missingSteps.map((step) => (
            <TabLink key={step.label} label={step.label} onClick={step.onClick} />
          )))}{' '}
          para ver os cálculos.
        </h1>
        {(gaps.people.length > 0 || gaps.items.length > 0) && (
          <div className="mt-2 text-sm leading-5 text-red-700/80 text-balance">
            {gaps.people.length > 0 && (
              <p>
                {joinNames(gaps.people)} ainda não {gaps.people.length === 1 ? 'consumiu' : 'consumiram'} nenhum item.
              </p>
            )}
            {gaps.items.length > 0 && <p>Ninguém consumiu {joinNames(gaps.items)}.</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BillParticipantSummary bill={bill} />
      <ServiceFeeCard bill={bill} />
      <BillItemDetailedCalc bill={bill} />
    </div>
  );
};
