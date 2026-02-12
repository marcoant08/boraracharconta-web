import { create } from 'zustand';
import { BillResponseDto, BillItemDto } from '@/types/bill.types';

interface BillState {
  currentBill: BillResponseDto | null;
  loading: boolean;
  error: string | null;
  setBill: (bill: BillResponseDto) => void;
  updateBill: (updates: Partial<BillResponseDto>) => void;
  addItem: (item: BillItemDto) => void;
  removeItem: (itemId: string) => void;
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

  addItem: (item: BillItemDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      // Verificar se o item já existe para evitar duplicatas
      const itemExists = state.currentBill.items.some((i) => i.id === item.id);
      if (itemExists) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          items: [...state.currentBill.items, item],
        },
      };
    });
  },

  removeItem: (itemId: string) => {
    set((state) => {
      if (!state.currentBill) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          items: state.currentBill.items.filter((item) => item.id !== itemId),
        },
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
