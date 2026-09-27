'use client';

import { useBill } from '@/hooks/useBill';
import { useParams } from 'next/navigation';
import { BillParticipantSummary } from './BillParticipantSummary';
import { BillItemDetailedCalc } from './BillItemDetailedCalc';
import { ServiceFeeCard } from './ServiceFeeCard';

export const StatisticsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill } = useBill(billId);

  if (!bill) return null;

  return (
    <div className="space-y-6">
      <BillParticipantSummary bill={bill} />
      <ServiceFeeCard bill={bill} />
      <BillItemDetailedCalc bill={bill} />
    </div>
  );
};
