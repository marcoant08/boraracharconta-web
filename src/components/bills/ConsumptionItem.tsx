'use client';

import { useBill } from '@/hooks/useBill';
import { BillItemDto, ParticipantDto } from '@/types/bill.types';
import { formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';

interface ConsumptionItemProps {
  item: BillItemDto;
  participant: ParticipantDto;
  participants: ParticipantDto[];
}

export const ConsumptionItem = ({ item, participant, participants }: ConsumptionItemProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addConsumption, removeConsumption } = useBill(billId);

  const getCurrentQuantity = (participantId: string): number => {
    const consumption = bill?.consumptions.find(
      (c) => c.participantId === participantId && c.itemId === item.id
    );
    return consumption?.quantity || 0;
  };

  const isSelected = getCurrentQuantity(participant.userId) > 0;
  const actorsPerItem = participants.filter((p) => getCurrentQuantity(p.userId) > 0);

  const handleSelect = async () => {
    if (!bill) return;
    try {
      if (isSelected) {
        await removeConsumption({ participantId: participant.userId, itemId: item.id });
      } else {
        await addConsumption({ participantId: participant.userId, itemId: item.id, quantity: 1 });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <button
      className="flex w-full gap-2 items-center bg-white shadow-md rounded-lg my-2 p-4 hover:shadow-lg transition-shadow"
      onClick={handleSelect}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {}}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
      />
      <span className="text-gray-900">{item.name}</span>
    </button>
  );
};
