import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateBillTotals, isServiceFeeApplied } from '@/utils/calculate';

interface Props {
  bill: BillResponseDto;
}

export const ServiceFeeCard = ({ bill }: Props) => {
  if (!isServiceFeeApplied(bill)) return null;

  const { participantTotals, serviceFee, feeConfig, fixedShare } = calculateBillTotals(bill);
  const participantCount = bill.participants.length;

  return (
    <Card title="Taxa de serviço">
      <div className="space-y-3 text-sm text-gray-700">
        {feeConfig.enabled && feeConfig.type === 'percent' && (
          <p>
            Percentual de <span className="font-semibold">{feeConfig.percent}%</span> sobre o
            consumo de cada participante.
          </p>
        )}
        {feeConfig.enabled && feeConfig.type === 'fixed' && (
          <p>
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
          </p>
        )}

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
    </Card>
  );
};
