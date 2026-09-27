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
  const storeAddItem = useBillStore((state) => state.addItem);
  const storeRemoveItem = useBillStore((state) => state.removeItem);
  const storeRemoveParticipant = useBillStore((state) => state.removeParticipant);
  const storeAddConsumption = useBillStore((state) => state.addConsumption);
  const storeUpdateConsumption = useBillStore((state) => state.updateConsumption);
  const storeRemoveConsumption = useBillStore((state) => state.removeConsumption);
  const storeAddDetail = useBillStore((state) => state.addDetail);
  const storeUpdateDetail = useBillStore((state) => state.updateDetail);
  const storeRemoveDetail = useBillStore((state) => state.removeDetail);
  const billIdRef = useRef<string | undefined>(billId);
  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    billIdRef.current = billId;
  }, [billId]);

  useEffect(() => {
    if (!billId) return;

    if (fetchingRef.current === billId) return;
    fetchingRef.current = billId;

    let cancelled = false;

    const fetchBill = async () => {
      try {
        setLoading(true);
        setError(null);
        const bill = await billService.getBill(billId);
        if (!cancelled && billIdRef.current === billId) {
          setBill(bill);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          const status = getAxiosErrorStatus(error);
          const message = getAxiosErrorMessage(error, 'Erro ao carregar conta.');
          setError(message);
          setLoading(false);
          toast.error(message);
          if (status === 404 || status === 403) {
            router.push('/');
          }
        }
      } finally {
        if (!cancelled) {
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
      // Silencioso
    }
  }, [setBill]);

  const addItem = useCallback(
    async (data: { name: string; value: number; quantity: number; category: string }) => {
      if (!billId) return;
      try {
        const item = await billService.addItem(billId, data);
        toast.success('Item adicionado com sucesso!');
        storeAddItem(item);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar item.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeAddItem]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!billId) return;
      try {
        await billService.deleteItem(billId, itemId);
        toast.success('Item removido com sucesso!');
        storeRemoveItem(itemId);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover item.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeRemoveItem]
  );

  const addConsumption = useCallback(
    async (data: { participantId: string; itemId: string; quantity?: number }) => {
      if (!billId) return;
      try {
        await billService.addConsumption(billId, data);
        storeAddConsumption({ participantId: data.participantId, itemId: data.itemId, quantity: data.quantity });
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar consumo.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeAddConsumption]
  );

  const updateConsumption = useCallback(
    async (data: { participantId: string; itemId: string; quantity: number }) => {
      if (!billId) return;
      try {
        await billService.updateConsumption(billId, data);
        storeUpdateConsumption(data);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao atualizar consumo.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeUpdateConsumption]
  );

  const removeConsumption = useCallback(
    async (data: { participantId: string; itemId: string }) => {
      if (!billId) return;
      try {
        await billService.removeConsumption(billId, data);
        storeRemoveConsumption(data.participantId, data.itemId);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover consumo.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeRemoveConsumption]
  );

  const addParticipant = useCallback(
    async (name: string) => {
      if (!billId) return;
      try {
        await billService.addParticipant(billId, { name });
        toast.success('Participante adicionado com sucesso!');
        // Backend não retorna o participante criado; refetch silencioso para sincronizar
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
        storeRemoveParticipant(participantId);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover participante.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeRemoveParticipant]
  );

  const addDetail = useCallback(
    async (data: { itemId: string; userId: string; quantityConsumed: number; action: 'join' | 'left' }) => {
      if (!billId) return;
      try {
        await billService.addDetail(billId, data);
        toast.success('Evento adicionado com sucesso!');
        storeAddDetail(data);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao adicionar evento.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeAddDetail]
  );

  const updateDetail = useCallback(
    async (data: { itemId: string; userId: string; quantityConsumed: number; action: 'join' | 'left' }) => {
      if (!billId) return;
      try {
        await billService.updateDetail(billId, data);
        toast.success('Evento atualizado com sucesso!');
        storeUpdateDetail(data);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao atualizar evento.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeUpdateDetail]
  );

  const removeDetail = useCallback(
    async (data: { userId: string; itemId: string }) => {
      if (!billId) return;
      try {
        await billService.removeDetail(billId, data);
        toast.success('Detail removido com sucesso!');
        storeRemoveDetail(data.userId, data.itemId);
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao remover detail.');
        toast.error(message);
        throw error;
      }
    },
    [billId, storeRemoveDetail]
  );

  const updateServiceFee = useCallback(
    async (data: { enabled: boolean; type?: 'percent' | 'fixed'; percent?: number; fixedValue?: number }) => {
      if (!billId) return;
      try {
        const updated = await billService.updateServiceFee(billId, data);
        setBill(updated);
        toast.success(data.enabled ? 'Taxa de serviço aplicada!' : 'Taxa de serviço removida.');
      } catch (error: unknown) {
        const message = getAxiosErrorMessage(error, 'Erro ao atualizar taxa de serviço.');
        toast.error(message);
        throw error;
      }
    },
    [billId, setBill]
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
        const status = getAxiosErrorStatus(error);
        if (status === 404 || status === 403) {
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
    updateServiceFee,
  };
};
