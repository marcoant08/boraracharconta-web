'use client';

import { useBill } from '@/hooks/useBill';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals, calculateItemDivision } from '@/utils/calculate';
import { useParams } from 'next/navigation';
import { participantResolvedId } from '@/types/bill.types';

export const StatisticsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill } = useBill(billId);

  if (!bill) return null;

  const { participantTotals, grandTotal } = calculateBillTotals(bill);

  return (
    <div className="space-y-6">
      <Card title="Resumo por Participante">
        <div className="space-y-4">
          {participantTotals.map(({ participant, total }) => (
            <div
              key={participantResolvedId(participant)}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">{participant.name}</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Cálculo Detalhado por Item">
        <div className="space-y-6">
          {bill.items.map((item) => {
            const division = calculateItemDivision(bill, item.id);
            if (!division || division.totalConsumed === 0) return null;

            return (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  {item.name}
                </h4>
                
                {/* Passo a passo do cálculo */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-gray-900 mb-3">📊 Passo a passo do cálculo:</h5>
                  <div className="space-y-1 text-sm text-gray-700 font-mono">
                    {division.steps.map((step, index) => {
                      // Se a linha começa com \n, criar uma quebra de linha visual
                      const isSectionHeader = step.description.startsWith('\n');
                      const cleanDescription = step.description.replace(/^\n+/, '');
                      
                      return (
                        <div
                          key={index}
                          className={`whitespace-pre-line ${
                            isSectionHeader ? 'mt-3 font-semibold text-gray-900' : ''
                          }`}
                        >
                          {cleanDescription}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumo por participante */}
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-900 mb-2">💰 Total por participante:</h5>
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
                        <span className="font-bold text-primary-600 ml-4">
                          {formatCurrency(pt.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
          <span className="text-lg font-semibold text-gray-900">Total Geral</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </Card>
    </div>
  );
};
