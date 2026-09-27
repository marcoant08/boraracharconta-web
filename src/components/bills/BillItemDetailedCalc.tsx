import { BillResponseDto } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import { calculateItemDivision, getItemAssignment } from '@/utils/calculate';

interface Props {
  bill: BillResponseDto;
}

export const BillItemDetailedCalc = ({ bill }: Props) => {
  return (
    <Card title="Cálculo Detalhado por Item">
      <div className="space-y-6">
        {bill.items.map((item) => {
          const division = calculateItemDivision(bill, item.id);
          if (!division || division.totalConsumed === 0) return null;
          const assignment = getItemAssignment(bill, item.id);

          return (
            <div key={item.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                {assignment?.consequence && (
                  <p className="text-sm text-gray-600 mt-1">{assignment.consequence}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 lg:p-4 mb-4">
                <h5 className="font-semibold text-gray-900 mb-3">Passo a passo do cálculo</h5>
                <div className="space-y-1 text-sm text-gray-700 font-mono">
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
        })}
      </div>
    </Card>
  );
};
