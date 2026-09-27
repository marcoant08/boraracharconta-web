'use client';

import { ReactNode } from 'react';
import { useBill } from '@/hooks/useBill';
import { useParams } from 'next/navigation';
import { isConsumptionStepComplete } from '@/utils/calculate';
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
  ].filter((step): step is { label: string; onClick?: () => void } => step !== null);

  if (missingSteps.length > 0) {
    return (
      <h1 className="text-xl py-5 text-center text-gray-900 text-balance">
        É preciso preencher {joinSteps(missingSteps.map((step) => (
          <TabLink key={step.label} label={step.label} onClick={step.onClick} />
        )))}{' '}
        para ver as estatísticas.
      </h1>
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
