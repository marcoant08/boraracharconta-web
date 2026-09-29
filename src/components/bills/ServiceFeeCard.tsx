'use client';

import { useState } from 'react';
import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals, isServiceFeeApplied } from '@/utils/calculate';

interface Props {
  bill: BillResponseDto;
}

const Chevron = ({ up }: { up: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    className={`w-4 h-4 shrink-0 transition-transform ${up ? 'rotate-180' : ''}`}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
  </svg>
);

export const ServiceFeeCard = ({ bill }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  if (!isServiceFeeApplied(bill)) return null;

  const { participantTotals, serviceFee, feeConfig, fixedShare } = calculateBillTotals(bill);
  const participantCount = bill.participants.length;
  const toggle = () => setOpen(!open);

  return (
    <Card title="Taxa de serviço">
      <div className="text-sm text-gray-700">
        <button
          type="button"
          aria-expanded={open}
          onClick={toggle}
          className="flex w-full cursor-pointer items-start justify-between gap-3 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span>
            {feeConfig.enabled && feeConfig.type === 'percent' && (
              <>
                Percentual de <span className="font-semibold">{feeConfig.percent}%</span> sobre o
                consumo de cada participante.
              </>
            )}
            {feeConfig.enabled && feeConfig.type === 'fixed' && (
              <>
                Valor fixo de <span className="font-semibold">{formatCurrency(feeConfig.fixedValue)}</span>{' '}
                dividido igualmente entre {participantCount}{' '}
                {participantCount === 1 ? 'participante' : 'participantes'}
                {participantCount > 0 && (
                  <>
                    {' '}
                    ({formatCurrency(fixedShare)} cada)
                  </>
                )}
                .
              </>
            )}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-gray-500">
            <Chevron up={open} />
            {open ? 'Esconder' : 'Mostrar'}
          </span>
        </button>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden" aria-hidden={!open}>
            <div
              className={`space-y-3 pt-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                open ? 'translate-y-0' : '-translate-y-2'
              }`}
            >
              <div className="space-y-2">
                {participantTotals.map(({ participant, fee }) => (
                  <div
                    key={participantResolvedId(participant)}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{participant.name}</span>
                    <span className="font-semibold text-primary-600">{formatCurrency(fee)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                <span className="font-semibold text-gray-900">Total da taxa</span>
                <span className="text-xl font-bold text-primary-600">{formatCurrency(serviceFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
