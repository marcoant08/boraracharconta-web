'use client';

import { useState } from 'react';
import { BillItemDto, BillResponseDto } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateItemDivision, getItemAssignment } from '@/utils/calculate';

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

const ItemDetailedCalc = ({ bill, item }: { bill: BillResponseDto; item: BillItemDto }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((current) => !current);
  const division = calculateItemDivision(bill, item.id);
  if (!division || division.totalConsumed === 0) return null;
  const assignment = getItemAssignment(bill, item.id);

  return (
    <div className="p-3 lg:p-4 border border-gray-200 rounded-lg">
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
        {assignment?.consequence && (
          <p className="text-sm text-gray-600 mt-1">{assignment.consequence}</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg mb-4">
        <h5 className="font-semibold text-gray-900">
          <button
            type="button"
            aria-expanded={open}
            onClick={toggle}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg p-3 text-left font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 lg:p-4"
          >
            <span className="min-w-0">Passo a passo do cálculo</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-normal text-gray-500">
              <Chevron up={open} />
              {open ? 'Esconder' : 'Mostrar'}
            </span>
          </button>
        </h5>

        <div
          className={`grid px-3 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:px-4 ${
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden" aria-hidden={!open}>
            <div
              className={`space-y-1 pb-3 text-sm text-gray-700 font-mono transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:pb-4 ${
                open ? 'translate-y-0' : '-translate-y-2'
              }`}
            >
            {division.steps.map((step, index) => {
              const isSectionHeader = step.description.startsWith('\n');
              const cleanDescription = step.description.replace(/^\n+/, '');
              const isPeriodStart = cleanDescription.trimStart().startsWith('• Período:');
              const isFirstPeriod =
                isPeriodStart &&
                !division.steps
                  .slice(0, index)
                  .some((s) => s.description.trimStart().startsWith('• Período:'));
              return (
                <div
                  key={index}
                  className={`whitespace-pre-line ${isSectionHeader ? 'mt-3 font-semibold text-gray-900' : ''} ${isPeriodStart && !isFirstPeriod ? 'mt-3' : ''}`}
                >
                  {cleanDescription}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h5 className="font-semibold text-gray-900 mb-2">Total por participante</h5>
        <div className="space-y-2">
          {division.participantTotals.map((pt) => (
            <div
              key={pt.participantId}
              className="flex justify-between items-start p-2 bg-gray-50 rounded"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{pt.participantName}</div>
                {pt.breakdown.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    {pt.breakdown.map((b, idx) => (
                      <div key={idx}>
                        • {b.description}: {formatCurrency(b.value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-bold text-primary-600 ml-4">{formatCurrency(pt.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BillItemDetailedCalc = ({ bill }: Props) => {
  return (
    <Card title="Cálculo Detalhado por Item">
      <div className="space-y-6">
        {bill.items.map((item) => (
          <ItemDetailedCalc key={item.id} bill={bill} item={item} />
        ))}
      </div>
    </Card>
  );
};
