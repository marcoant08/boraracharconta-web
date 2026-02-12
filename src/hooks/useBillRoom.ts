import { useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useBillStore } from '@/store/bill.store';
import { BillResponseDto, BillItemDto } from '@/types/bill.types';

/**
 * Hook para gerenciar a conexão WebSocket da sala da conta.
 * Deve ser usado apenas uma vez na página principal da conta.
 */
export const useBillRoom = (billId?: string) => {
  const { socket, connected, joinBill, leaveBill } = useWebSocket();
  const setBill = useBillStore((state) => state.setBill);
  const addItem = useBillStore((state) => state.addItem);
  const removeItem = useBillStore((state) => state.removeItem);
  const hasJoinedRef = useRef(false);
  const billIdRef = useRef<string | undefined>(billId);

  // Atualizar ref quando billId mudar
  useEffect(() => {
    const previousBillId = billIdRef.current;
    billIdRef.current = billId;
    // Só resetar hasJoinedRef se o billId realmente mudou
    if (previousBillId !== billId) {
      hasJoinedRef.current = false;
    }
  }, [billId]);

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

    // Escutar evento de item adicionado
    const handleItemAdded = (data: {
      billId: string;
      item: BillItemDto;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        addItem(data.item);
      }
    };

    // Escutar evento de item removido
    const handleItemRemoved = (data: {
      billId: string;
      itemId: string;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        removeItem(data.itemId);
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
    socket.on('item-added', handleItemAdded);
    socket.on('item-removed', handleItemRemoved);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('bill-updated', handleBillUpdate);
      socket.off('item-added', handleItemAdded);
      socket.off('item-removed', handleItemRemoved);
      // Só fazer leave se ainda estamos no mesmo billId (não mudou)
      if (billIdRef.current === currentBillId) {
        hasJoinedRef.current = false;
        leaveBill(currentBillId);
      }
    };
  }, [billId, connected, socket, joinBill, leaveBill, setBill, addItem, removeItem]);
};
