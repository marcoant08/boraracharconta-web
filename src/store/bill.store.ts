import { create } from 'zustand';
import {
  BillResponseDto,
  BillItemDto,
  ParticipantDto,
  ConsumptionDto,
  BillDetailDto,
  participantResolvedId,
} from '@/types/bill.types';
import { persistEqualSplitOverrides, withEqualSplitFlags } from '@/utils/equal-split';

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
  addDetail: (detail: BillDetailDto) => void;
  updateDetail: (detail: BillDetailDto) => void;
  removeDetail: (userId: string, itemId: string) => void;
  clearBill: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setItemSplitEqually: (itemId: string, splitEqually: boolean) => void;
}

export const useBillStore = create<BillState>((set) => ({
  currentBill: null,
  loading: false,
  error: null,
  setBill: (bill: BillResponseDto) => {
    console.log('[bill]', bill);
    const withFlags = withEqualSplitFlags(bill);
    set((state) => ({
      ...state,
      currentBill: {
        ...withFlags,
        // Garantir que details sempre existe, mesmo se o backend não enviar
        details: withFlags.details || [],
      },
      error: null,
      loading: false, // Garantir que loading seja false quando bill é atualizada
    }));
  },

  updateBill: (updates: Partial<BillResponseDto>) => {
    set((state) => {
      if (!state.currentBill) return state;
      return {
        currentBill: {
          ...state.currentBill,
          ...updates,
          // Garantir que details sempre existe
          details: updates.details !== undefined ? updates.details : (state.currentBill.details || []),
        },
      };
    });
  },

  addItem: (item: BillItemDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      // Verificar se o item já existe para evitar duplicatas
      const itemExists = state.currentBill.items.some((i) => i.id === item.id);
      if (itemExists) return state;

      const nextItem = {
        ...item,
        splitEqually: item.splitEqually ?? item.quantity > 1,
      };
      
      return {
        currentBill: {
          ...state.currentBill,
          items: [...state.currentBill.items, nextItem],
        },
      };
    });
  },

  removeItem: (itemId: string) => {
    set((state) => {
      if (!state.currentBill) return state;
      const items = state.currentBill.items.filter((item) => item.id !== itemId);
      persistEqualSplitOverrides(state.currentBill.id, items);
      
      return {
        currentBill: {
          ...state.currentBill,
          items,
          // Também remover consumos relacionados a este item
          consumptions: state.currentBill.consumptions.filter(
            (c) => c.itemId !== itemId
          ),
          // Também remover details relacionados a este item
          details: (state.currentBill.details || []).filter(
            (d) => d.itemId !== itemId
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
        (p) => participantResolvedId(p) === participantResolvedId(participant)
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
            (p) => participantResolvedId(p) !== participantId
          ),
          // Também remover consumos relacionados a este participante
          consumptions: state.currentBill.consumptions.filter(
            (c) => c.participantId !== participantId
          ),
          // Também remover details relacionados a este participante
          details: (state.currentBill.details || []).filter(
            (d) => d.userId !== participantId
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

  addDetail: (detail: BillDetailDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      const currentDetails = state.currentBill.details || [];
      // Permitir múltiplos eventos para mesmo userId + itemId (linha do tempo)
      
      return {
        currentBill: {
          ...state.currentBill,
          details: [...currentDetails, detail],
        },
      };
    });
  },

  updateDetail: (detail: BillDetailDto) => {
    set((state) => {
      if (!state.currentBill) return state;
      const currentDetails = state.currentBill.details || [];
      
      // Atualizar TODOS os details que correspondem a userId + itemId (conforme documentação)
      const updatedDetails = currentDetails.map((d) =>
        d.userId === detail.userId && d.itemId === detail.itemId ? detail : d
      );
      
      // Se não havia nenhum detail para atualizar, adicionar novo
      const hadMatchingDetails = currentDetails.some(
        (d) => d.userId === detail.userId && d.itemId === detail.itemId
      );
      
      return {
        currentBill: {
          ...state.currentBill,
          details: hadMatchingDetails ? updatedDetails : [...currentDetails, detail],
        },
      };
    });
  },

  removeDetail: (userId: string, itemId: string) => {
    set((state) => {
      if (!state.currentBill) return state;
      
      return {
        currentBill: {
          ...state.currentBill,
          details: (state.currentBill.details || []).filter(
            (d) => !(d.userId === userId && d.itemId === itemId)
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

  setItemSplitEqually: (itemId: string, splitEqually: boolean) => {
    set((state) => {
      if (!state.currentBill) return state;
      const items = state.currentBill.items.map((item) =>
        item.id === itemId ? { ...item, splitEqually } : item
      );
      persistEqualSplitOverrides(state.currentBill.id, items);
      return {
        currentBill: {
          ...state.currentBill,
          items,
        },
      };
    });
  },
}));
