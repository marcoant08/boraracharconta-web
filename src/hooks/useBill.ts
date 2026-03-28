import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/store/bill.store';
import { billService } from '@/services/bill.service';
import { getAxiosErrorMessage, getAxiosErrorStatus } from '@/utils/api-error';
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
      } catch (error: unknown) {
        if (!cancelled) {
          const message = getAxiosErrorMessage(error, 'Erro ao carregar conta.');
          setError(message);
          setLoading(false); // Garantir que loading seja false em caso de erro
          toast.error(message);
          if (getAxiosErrorStatus(error) === 404) {
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

  const refetchBillQuiet = useCallback(async () => {
    const id = billIdRef.current;
    if (!id) return;
    try {
      const bill = await billService.getBill(id);
      if (billIdRef.current === id) {
        setBill(bill);
      }
    } catch {
      // Refetch pós-mutação: não incomodar com toast; polling ou próxima ação atualiza
    }
  }, [setBill]);

  // Funções de mutação
  const addItem = useCallback(
    async (data: { name: string; value: number; quantity: number; category: string }) => {
      if (!billId) return;
      try {
        await billService.addItem(billId, data);
        toast.success('Item adicionado com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar item.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!billId) return;
      try {
        await billService.deleteItem(billId, itemId);
        toast.success('Item removido com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover item.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const addConsumption = useCallback(
    async (data: { participantId: string; itemId: string; quantity?: number }) => {
      if (!billId) return;
      try {
        await billService.addConsumption(billId, data);
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar consumo.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const updateConsumption = useCallback(
    async (data: { participantId: string; itemId: string; quantity: number }) => {
      if (!billId) return;
      try {
        await billService.updateConsumption(billId, data);
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao atualizar consumo.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const removeConsumption = useCallback(
    async (data: { participantId: string; itemId: string }) => {
      if (!billId) return;
      try {
        await billService.removeConsumption(billId, data);
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover consumo.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const addParticipant = useCallback(
    async (name: string) => {
      if (!billId) return;
      try {
        await billService.addParticipant(billId, { name });
        toast.success('Participante adicionado com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar participante.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const removeParticipant = useCallback(
    async (participantId: string) => {
      if (!billId) return;
      try {
        await billService.removeParticipant(billId, participantId);
        toast.success('Participante removido com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover participante.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const addDetail = useCallback(
    async (data: { itemId: string; userId: string; quantityConsumed: number; action: 'join' | 'left' }) => {
      if (!billId) return;
      try {
        await billService.addDetail(billId, data);
        toast.success('Evento adicionado com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar evento.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const updateDetail = useCallback(
    async (data: { itemId: string; userId: string; quantityConsumed: number; action: 'join' | 'left' }) => {
      if (!billId) return;
      try {
        await billService.updateDetail(billId, data);
        toast.success('Evento atualizado com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao atualizar evento.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const removeDetail = useCallback(
    async (data: { userId: string; itemId: string }) => {
      if (!billId) return;
      try {
        await billService.removeDetail(billId, data);
        toast.success('Detail removido com sucesso!');
        await refetchBillQuiet();
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover detail.');
        toast.error(message);
        throw error;
      }
    },
    [billId, refetchBillQuiet]
  );

  const fetchBill = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const bill = await billService.getBill(id);
        setBill(bill);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao carregar conta.');
        setError(message);
        toast.error(message);
        if (getAxiosErrorStatus(error) === 404) {
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
