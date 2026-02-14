import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/store/bill.store';
import { billService } from '@/services/bill.service';
import toast from 'react-hot-toast';

export const useBill = (billId?: string) => {
  const router = useRouter();
  const currentBill = useBillStore((state) => state.currentBill);
  const loading = useBillStore((state) => state.loading);
  const error = useBillStore((state) => state.error);
  const setBill = useBillStore((state) => state.setBill);
  const setLoading = useBillStore((state) => state.setLoading);
  const setError = useBillStore((state) => state.setError);
  const billIdRef = useRef<string | undefined>(billId);
  const fetchingRef = useRef<string | null>(null);

  // Atualizar ref quando billId mudar
  useEffect(() => {
    billIdRef.current = billId;
  }, [billId]);

  // Buscar conta quando billId mudar
  useEffect(() => {
    if (!billId) return;
    
    // Evitar buscar o mesmo billId múltiplas vezes
    if (fetchingRef.current === billId) return;
    fetchingRef.current = billId;

    let cancelled = false;

    const fetchBill = async () => {
      try {
        setLoading(true);
        setError(null);
        const bill = await billService.getBill(billId);
        if (!cancelled && billIdRef.current === billId) {
          setBill(bill); // setBill já define loading: false
        }
      } catch (error: any) {
        if (!cancelled) {
          const message = error.response?.data?.message || 'Erro ao carregar conta.';
          setError(message);
          setLoading(false); // Garantir que loading seja false em caso de erro
          toast.error(message);
          if (error.response?.status === 404) {
            router.push('/');
          }
        }
      } finally {
        if (!cancelled) {
          // setBill já define loading: false, mas garantir se não foi chamado
          setLoading(false);
        }
        fetchingRef.current = null;
      }
    };

    fetchBill();

    return () => {
      cancelled = true;
      if (fetchingRef.current === billId) {
        fetchingRef.current = null;
      }
    };
  }, [billId, router, setBill, setLoading, setError]);


  // Funções de mutação
  const addItem = useCallback(
    async (data: { name: string; value: number; quantity: number; category: string }) => {
      if (!billId) return;
      try {
        await billService.addItem(billId, data);
        toast.success('Item adicionado com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao adicionar item.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!billId) return;
      try {
        await billService.deleteItem(billId, itemId);
        toast.success('Item removido com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao remover item.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const addConsumption = useCallback(
    async (data: { participantId: string; itemId: string; quantity?: number }) => {
      if (!billId) return;
      try {
        await billService.addConsumption(billId, data);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao adicionar consumo.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const updateConsumption = useCallback(
    async (data: { participantId: string; itemId: string; quantity: number }) => {
      if (!billId) return;
      try {
        await billService.updateConsumption(billId, data);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao atualizar consumo.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const removeConsumption = useCallback(
    async (data: { participantId: string; itemId: string }) => {
      if (!billId) return;
      try {
        await billService.removeConsumption(billId, data);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao remover consumo.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const addParticipant = useCallback(
    async (name: string) => {
      if (!billId) return;
      try {
        await billService.addParticipant(billId, { name });
        toast.success('Participante adicionado com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao adicionar participante.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const removeParticipant = useCallback(
    async (participantId: string) => {
      if (!billId) return;
      try {
        await billService.removeParticipant(billId, participantId);
        toast.success('Participante removido com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao remover participante.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const addDetail = useCallback(
    async (data: { itemId: string; userId: string; quantityConsumed: number; action: 'join' | 'left' }) => {
      if (!billId) return;
      try {
        await billService.addDetail(billId, data);
        toast.success('Evento adicionado com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao adicionar evento.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const updateDetail = useCallback(
    async (data: { itemId: string; userId: string; quantityConsumed: number; action: 'join' | 'left' }) => {
      if (!billId) return;
      try {
        await billService.updateDetail(billId, data);
        toast.success('Evento atualizado com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao atualizar evento.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const removeDetail = useCallback(
    async (data: { userId: string; itemId: string }) => {
      if (!billId) return;
      try {
        await billService.removeDetail(billId, data);
        toast.success('Detail removido com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao remover detail.';
        toast.error(message);
        throw error;
      }
    },
    [billId]
  );

  const fetchBill = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const bill = await billService.getBill(id);
        setBill(bill);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao carregar conta.';
        setError(message);
        toast.error(message);
        if (error.response?.status === 404) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    },
    [router, setBill, setLoading, setError]
  );

  return {
    bill: currentBill,
    loading,
    error,
    fetchBill,
    addItem,
    removeItem,
    addConsumption,
    updateConsumption,
    removeConsumption,
    addParticipant,
    removeParticipant,
    addDetail,
    updateDetail,
    removeDetail,
  };
};
