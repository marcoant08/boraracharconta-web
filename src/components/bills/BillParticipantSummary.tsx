import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals, getConsumptionWeight, getParticipantConsumptions } from '@/utils/calculate';

interface Props {
  bill: BillResponseDto;
}

export const BillParticipantSummary = ({ bill }: Props) => {
  const { participantTotals, subtotal, serviceFee, grandTotal, feeConfig } = calculateBillTotals(bill);
  const feeApplied = feeConfig.enabled;

  const getConsumedItems = (participantId: string) => {
    const consumptions = getParticipantConsumptions(bill, participantId);
    return consumptions.flatMap((consumption) => {
      const item = bill.items.find((i) => i.id === consumption.itemId);
      if (!item) return [];
      return [{ item, quantity: getConsumptionWeight(consumption) }];
    });
  };

  const feeLabel =
    feeConfig.enabled && feeConfig.type === 'percent'
      ? `inclui taxa ${feeConfig.percent}%`
      : feeConfig.enabled
        ? 'inclui taxa'
        : null;

  return (
    <Card title="Resumo por Participante">
      <div className="space-y-3">
        {participantTotals.map(({ participant, total }) => {
          const participantId = participantResolvedId(participant);
          const consumedItems = getConsumedItems(participantId);

          return (
            <div
              key={participantId}
              className="flex justify-between items-start p-3 border border-gray-200 rounded-lg gap-3"
            >
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-gray-900">{participant.name}</span>
                {consumedItems.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {consumedItems.map(({ item, quantity }) => (
                      <span
                        key={item.id}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {item.quantity > 1 || quantity > 1
                          ? `${item.name} ×${quantity}`
                          : item.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
                {feeLabel && <p className="text-xs text-gray-500">{feeLabel}</p>}
              </div>
            </div>
          );
        })}
        {feeApplied && (
          <div className="space-y-1 px-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Taxa de serviço
                {feeConfig.enabled && feeConfig.type === 'percent'
                  ? ` (${feeConfig.percent}%)`
                  : feeConfig.enabled && feeConfig.type === 'fixed'
                    ? ' (valor fixo)'
                    : ''}
              </span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg mt-2">
          <span className="text-lg font-semibold text-gray-900">Total Geral</span>
          <span className="text-2xl font-bold text-primary-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </Card>
  );
};
