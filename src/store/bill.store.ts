import { create } from 'zustand';
import { BillResponseDto } from '@/types/bill.types';

interface BillState {
  currentBill: BillResponseDto | null;
  loading: boolean;
  error: string | null;
  setBill: (bill: BillResponseDto) => void;
  updateBill: (updates: Partial<BillResponseDto>) => void;
  clearBill: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBillStore = create<BillState>((set) => ({
  currentBill: null,
  loading: false,
  error: null,

  setBill: (bill: BillResponseDto) => {
    console.log('[bill]', bill);
    set((state) => ({
      ...state,
      currentBill: bill,
      error: null,
      loading: false, // Garantir que loading seja false quando bill é atualizada
    }));
  },

  updateBill: (updates: Partial<BillResponseDto>) => {
    set((state) => {
      if (!state.currentBill) return state;
      return {
        currentBill: { ...state.currentBill, ...updates },
      };
    });
  },

  clearBill: () => {
    set({ currentBill: null, error: null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
