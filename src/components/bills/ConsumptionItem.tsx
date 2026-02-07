'use client';

import { useBill } from '@/hooks/useBill';
import { BillItemDto, ParticipantDto } from '@/types/bill.types';
import { formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';

interface ConsumptionItemProps {
  item: BillItemDto;
  participants: ParticipantDto[];
}

export const ConsumptionItem = ({ item, participants }: ConsumptionItemProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, updateConsumption, removeConsumption } = useBill(billId);

  const getCurrentQuantity = (participantId: string): number => {
    const consumption = bill?.consumptions.find(
      (c) => c.participantId === participantId && c.itemId === item.id
    );
    return consumption?.quantity || 0;
  };

  const handleQuantityChange = async (participantId: string, newQuantity: number) => {
    if (!bill) return;

    const currentQuantity = getCurrentQuantity(participantId);
    const consumptionExists = currentQuantity > 0;

    try {
      if (newQuantity === 0 && consumptionExists) {
        await removeConsumption({ participantId, itemId: item.id });
      } else if (newQuantity > 0 && consumptionExists) {
        await updateConsumption({ participantId, itemId: item.id, quantity: newQuantity });
      } else if (newQuantity > 0 && !consumptionExists) {
        await addConsumption({ participantId, itemId: item.id, quantity: newQuantity });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const totalConsumed = participants.reduce(
    (sum, p) => sum + getCurrentQuantity(p.userId),
    0
  );
  const remaining = item.quantity - totalConsumed;

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-600">
          Valor unitário: {formatCurrency(item.value)} | Quantidade disponível: {item.quantity}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Total consumido: {totalConsumed} | Restante: {remaining}
        </p>
      </div>

      <div className="space-y-3">
        {participants.map((participant) => {
          const quantity = getCurrentQuantity(participant.userId);
          return (
            <div key={participant.userId} className="flex items-center gap-4">
              <label className="flex-1 text-sm font-medium text-gray-700">
                {participant.name}
              </label>
              <input
                type="number"
                min="0"
                max={item.quantity}
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 0;
                  handleQuantityChange(participant.userId, newQuantity);
                }}
                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {quantity > 0 && (
                <span className="text-sm text-gray-600 w-24">
                  {formatCurrency(quantity * item.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
