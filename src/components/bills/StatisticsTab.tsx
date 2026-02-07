'use client';

import { useBill } from '@/hooks/useBill';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals, calculateItemDivision } from '@/utils/calculate';
import { useParams } from 'next/navigation';

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
          {participantTotals.map(({ participant, total }) => {
            const isVisitor = participant.userId === participant.name;
            return (
              <div
                key={participant.userId}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-900">{participant.name}</span>
                    {isVisitor && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                        Visitante
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Divisão Detalhada por Item">
        <div className="space-y-6">
          {bill.items.map((item) => {
            const division = calculateItemDivision(bill, item.id);
            if (!division || division.totalConsumed === 0) return null;

            return (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Valor total: {formatCurrency(division.totalValue)} | Valor por unidade:{' '}
                  {formatCurrency(division.valuePerUnit)}
                </p>
                <div className="space-y-2">
                  {division.consumptions.map((c) => {
                    const participant = bill.participants.find((p) => p.userId === c.participantId);
                    if (!participant) return null;

                    return (
                      <div
                        key={c.participantId}
                        className="flex justify-between text-sm text-gray-700"
                      >
                        <span>
                          {participant.name} ({c.quantity} unidade{c.quantity > 1 ? 's' : ''})
                        </span>
                        <span className="font-medium">{formatCurrency(c.total)}</span>
                      </div>
                    );
                  })}
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
