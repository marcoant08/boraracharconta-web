import { BillItemDto, BillResponseDto } from '@/types/bill.types';

const storageKey = (billId: string) => `finances.unequalSplit.${billId}`;

const loadUnequalSplitIds = (billId: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(billId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const saveUnequalSplitIds = (billId: string, itemIds: string[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(billId), JSON.stringify(itemIds));
};

export const persistEqualSplitOverrides = (billId: string, items: BillItemDto[]): void => {
  saveUnequalSplitIds(
    billId,
    items.filter((item) => item.quantity > 1 && !item.splitEqually).map((item) => item.id)
  );
};

export const withEqualSplitFlags = (bill: BillResponseDto): BillResponseDto => {
  const optedOut = new Set(loadUnequalSplitIds(bill.id));
  return {
    ...bill,
    items: bill.items.map((item) => ({
      ...item,
      splitEqually: item.quantity > 1 ? !optedOut.has(item.id) : true,
    })),
  };
};
