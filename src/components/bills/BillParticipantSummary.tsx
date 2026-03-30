import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals } from '@/utils/calculate';

interface Props {
  bill: BillResponseDto;
}

export const BillParticipantSummary = ({ bill }: Props) => {
  const { participantTotals, grandTotal } = calculateBillTotals(bill);

  return (
    <Card title="Resumo por Participante">
      <div className="space-y-3">
        {participantTotals.map(({ participant, total }) => (
          <div
            key={participantResolvedId(participant)}
            className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
          >
            <span className="font-semibold text-gray-900">{participant.name}</span>
            <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg mt-2">
          <span className="text-lg font-semibold text-gray-900">Total Geral</span>
          <span className="text-2xl font-bold text-primary-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </Card>
  );
};
