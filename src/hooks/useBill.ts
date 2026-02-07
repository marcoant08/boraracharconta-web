import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/store/bill.store';
import { billService } from '@/services/bill.service';
import { useWebSocket } from './useWebSocket';
import { BillResponseDto } from '@/types/bill.types';
import toast from 'react-hot-toast';

export const useBill = (billId?: string) => {
  const router = useRouter();
  const currentBill = useBillStore((state) => state.currentBill);
  const loading = useBillStore((state) => state.loading);
  const error = useBillStore((state) => state.error);
  const setBill = useBillStore((state) => state.setBill);
  const setLoading = useBillStore((state) => state.setLoading);
  const setError = useBillStore((state) => state.setError);
  const { socket, connected, joinBill, leaveBill } = useWebSocket();
  const hasJoinedRef = useRef(false);
  const billIdRef = useRef<string | undefined>(billId);
  const fetchingRef = useRef<string | null>(null);

  // Atualizar ref quando billId mudar
  useEffect(() => {
    billIdRef.current = billId;
    hasJoinedRef.current = false;
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

  // Conectar WebSocket quando billId estiver disponível
  useEffect(() => {
    if (!billId || !socket) return;

    const currentBillId = billId;

    // Aguardar conexão antes de entrar na room
    const handleConnect = () => {
      if (billIdRef.current === currentBillId && !hasJoinedRef.current && socket.connected) {
        hasJoinedRef.current = true;
        joinBill(currentBillId);
      }
    };

    // Escutar atualizações da conta
    const handleBillUpdate = (data: { billId: string; bill: BillResponseDto }) => {
      if (data.billId === billIdRef.current) {
        setBill(data.bill);
      }
    };

    if (connected && socket.connected) {
      if (!hasJoinedRef.current) {
        hasJoinedRef.current = true;
        joinBill(currentBillId);
      }
    } else {
      socket.once('connect', handleConnect);
    }

    socket.on('bill-updated', handleBillUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('bill-updated', handleBillUpdate);
      if (billIdRef.current === currentBillId && hasJoinedRef.current) {
        hasJoinedRef.current = false;
        leaveBill(currentBillId);
      }
    };
  }, [billId, connected, socket, joinBill, leaveBill, setBill]);

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
  };
};
