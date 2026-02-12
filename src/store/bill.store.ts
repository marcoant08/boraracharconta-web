import { create } from 'zustand';
import { BillResponseDto, BillItemDto, ParticipantDto, ConsumptionDto } from '@/types/bill.types';

interface BillState {
  currentBill: BillResponseDto | null;
  loading: boolean;
  error: string | null;
  setBill: (bill: BillResponseDto) => void;
  updateBill: (updates: Partial<BillResponseDto>) => void;
  addItem: (item: BillItemDto) => void;
  removeItem: (itemId: string) => void;
  addParticipant: (participant: ParticipantDto) => void;
  removeParticipant: (participantId: string) => void;
  addConsumption: (consumption: ConsumptionDto) => void;
  updateConsumption: (consumption: ConsumptionDto) => void;
  removeConsumption: (participantId: string, itemId: string) => void;
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
          // Também remover consumos relacionados a este item
          consumptions: state.currentBill.consumptions.filter(
            (c) => c.itemId !== itemId
          ),
        },
      };
    });
  },

  addParticipant: (participant: ParticipantDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      // Verificar se o participante já existe para evitar duplicatas
      const participantExists = state.currentBill.participants.some(
        (p) => p.userId === participant.userId
      );
      if (participantExists) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          participants: [...state.currentBill.participants, participant],
        },
      };
    });
  },

  removeParticipant: (participantId: string) => {
    set((state) => {
      if (!state.currentBill) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          participants: state.currentBill.participants.filter(
            (p) => p.userId !== participantId
          ),
          // Também remover consumos relacionados a este participante
          consumptions: state.currentBill.consumptions.filter(
            (c) => c.participantId !== participantId
          ),
        },
      };
    });
  },

  addConsumption: (consumption: ConsumptionDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      // Verificar se o consumo já existe
      const consumptionExists = state.currentBill.consumptions.some(
        (c) => c.participantId === consumption.participantId && c.itemId === consumption.itemId
      );
      if (consumptionExists) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          consumptions: [...state.currentBill.consumptions, consumption],
        },
      };
    });
  },

  updateConsumption: (consumption: ConsumptionDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      
      const existingIndex = state.currentBill.consumptions.findIndex(
        (c) => c.participantId === consumption.participantId && c.itemId === consumption.itemId
      );
      
      if (existingIndex >= 0) {
        // Atualizar consumo existente
        return {
          currentBill: {
            ...state.currentBill,
            consumptions: state.currentBill.consumptions.map((c, index) =>
              index === existingIndex ? consumption : c
            ),
          },
        };
      } else {
        // Adicionar novo consumo se não existir
        return {
          currentBill: {
            ...state.currentBill,
            consumptions: [...state.currentBill.consumptions, consumption],
          },
        };
      }
    });
  },

  removeConsumption: (participantId: string, itemId: string) => {
    set((state) => {
      if (!state.currentBill) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          consumptions: state.currentBill.consumptions.filter(
            (c) => !(c.participantId === participantId && c.itemId === itemId)
          ),
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
