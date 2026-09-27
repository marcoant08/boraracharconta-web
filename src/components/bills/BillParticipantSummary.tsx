import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals, getParticipantConsumptions } from '@/utils/calculate';

interface Props {
  bill: BillResponseDto;
}

export const BillParticipantSummary = ({ bill }: Props) => {
  const { participantTotals, grandTotal } = calculateBillTotals(bill);

  const getConsumedItems = (participantId: string) => {
    const consumedItemIds = new Set(
      getParticipantConsumptions(bill, participantId).map((c) => c.itemId)
    );
    return bill.items.filter((item) => consumedItemIds.has(item.id));
  };

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
                    <span className="text-xs text-gray-500 shrink-0">itens consumidos:</span>
                    {consumedItems.map((item) => (
                      <span
                        key={item.id}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-lg font-bold text-primary-600 shrink-0">{formatCurrency(total)}</span>
            </div>
          );
        })}
        <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg mt-2">
          <span className="text-lg font-semibold text-gray-900">Total Geral</span>
          <span className="text-2xl font-bold text-primary-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </Card>
  );
};
