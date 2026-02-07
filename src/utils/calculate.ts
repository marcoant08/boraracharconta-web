import { BillResponseDto, ConsumptionDto } from '@/types/bill.types';

export const getParticipantConsumptions = (
  bill: BillResponseDto,
  participantId: string
): ConsumptionDto[] => {
  return bill.consumptions.filter((c) => c.participantId === participantId);
};

export const getItemConsumptions = (
  bill: BillResponseDto,
  itemId: string
): ConsumptionDto[] => {
  return bill.consumptions.filter((c) => c.itemId === itemId);
};

export const calculateItemDivision = (bill: BillResponseDto, itemId: string) => {
  const item = bill.items.find((i) => i.id === itemId);
  if (!item) return null;

  const itemConsumptions = getItemConsumptions(bill, itemId);
  const totalQuantityConsumed = itemConsumptions.reduce(
    (sum, c) => sum + (c.quantity || 1),
    0
  );

  if (totalQuantityConsumed === 0) {
    return {
      item,
      totalValue: item.value * item.quantity,
      totalConsumed: 0,
      valuePerUnit: 0,
      consumptions: [],
    };
  }

  const totalValue = item.value * item.quantity;
  const valuePerUnit = totalValue / totalQuantityConsumed;

  const consumptions = itemConsumptions.map((c) => ({
    participantId: c.participantId,
    quantity: c.quantity || 1,
    total: (c.quantity || 1) * valuePerUnit,
  }));

  return {
    item,
    totalValue,
    totalConsumed: totalQuantityConsumed,
    valuePerUnit,
    consumptions,
  };
};

export const calculateParticipantTotal = (
  bill: BillResponseDto,
  participantId: string
): number => {
  const participantConsumptions = getParticipantConsumptions(bill, participantId);
  let total = 0;

  for (const consumption of participantConsumptions) {
    const itemDivision = calculateItemDivision(bill, consumption.itemId);
    if (itemDivision && itemDivision.valuePerUnit > 0) {
      total += (consumption.quantity || 1) * itemDivision.valuePerUnit;
    }
  }

  return total;
};

export const calculateBillTotals = (bill: BillResponseDto) => {
  const participantTotals = bill.participants.map((p) => ({
    participant: p,
    total: calculateParticipantTotal(bill, p.userId),
  }));

  const grandTotal = participantTotals.reduce((sum, pt) => sum + pt.total, 0);

  return {
    participantTotals,
    grandTotal,
  };
};
