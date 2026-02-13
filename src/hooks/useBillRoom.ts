import { useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useBillStore } from '@/store/bill.store';
import { BillResponseDto, BillItemDto, ParticipantDto, ConsumptionDto, BillDetailDto } from '@/types/bill.types';

/**
 * Hook para gerenciar a conexão WebSocket da sala da conta.
 * Deve ser usado apenas uma vez na página principal da conta.
 */
export const useBillRoom = (billId?: string) => {
  const { socket, connected, joinBill, leaveBill } = useWebSocket();
  const setBill = useBillStore((state) => state.setBill);
  const addItem = useBillStore((state) => state.addItem);
  const removeItem = useBillStore((state) => state.removeItem);
  const addParticipant = useBillStore((state) => state.addParticipant);
  const removeParticipant = useBillStore((state) => state.removeParticipant);
  const addConsumption = useBillStore((state) => state.addConsumption);
  const updateConsumption = useBillStore((state) => state.updateConsumption);
  const removeConsumption = useBillStore((state) => state.removeConsumption);
  const addDetail = useBillStore((state) => state.addDetail);
  const updateDetail = useBillStore((state) => state.updateDetail);
  const removeDetail = useBillStore((state) => state.removeDetail);
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

    // Escutar evento de participante adicionado
    const handleParticipantAdded = (data: {
      billId: string;
      participant: {
        userId: string;
        name: string;
        isVisitor: boolean;
        joinedAt: string;
      };
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        // Converter formato do evento para formato do tipo
        const participant: ParticipantDto = {
          userId: data.participant.userId,
          name: data.participant.name,
          joinedAt: new Date(data.participant.joinedAt),
        };
        addParticipant(participant);
      }
    };

    // Escutar evento de participante removido
    const handleParticipantRemoved = (data: {
      billId: string;
      participantId: string;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        removeParticipant(data.participantId);
      }
    };

    // Escutar evento de consumo adicionado
    const handleConsumptionAdded = (data: {
      billId: string;
      consumption: ConsumptionDto;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        addConsumption(data.consumption);
      }
    };

    // Escutar evento de consumo atualizado
    const handleConsumptionUpdated = (data: {
      billId: string;
      consumption: ConsumptionDto;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        updateConsumption(data.consumption);
      }
    };

    // Escutar evento de consumo removido
    const handleConsumptionRemoved = (data: {
      billId: string;
      participantId: string;
      itemId: string;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        removeConsumption(data.participantId, data.itemId);
      }
    };

    // Escutar evento de detail adicionado
    const handleDetailAdded = (data: {
      billId: string;
      detail: BillDetailDto;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        addDetail(data.detail);
      }
    };

    // Escutar evento de detail atualizado
    const handleDetailUpdated = (data: {
      billId: string;
      detail: BillDetailDto;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        updateDetail(data.detail);
      }
    };

    // Escutar evento de detail removido
    const handleDetailRemoved = (data: {
      billId: string;
      userId: string;
      itemId: string;
      action: string;
      timestamp: string;
    }) => {
      if (data.billId === billIdRef.current) {
        removeDetail(data.userId, data.itemId);
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
    socket.on('participant-added', handleParticipantAdded);
    socket.on('participant-removed', handleParticipantRemoved);
    socket.on('consumption-added', handleConsumptionAdded);
    socket.on('consumption-updated', handleConsumptionUpdated);
    socket.on('consumption-removed', handleConsumptionRemoved);
    socket.on('bill-detail-added', handleDetailAdded);
    socket.on('bill-detail-updated', handleDetailUpdated);
    socket.on('bill-detail-removed', handleDetailRemoved);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('bill-updated', handleBillUpdate);
      socket.off('item-added', handleItemAdded);
      socket.off('item-removed', handleItemRemoved);
      socket.off('participant-added', handleParticipantAdded);
      socket.off('participant-removed', handleParticipantRemoved);
      socket.off('consumption-added', handleConsumptionAdded);
      socket.off('consumption-updated', handleConsumptionUpdated);
      socket.off('consumption-removed', handleConsumptionRemoved);
      socket.off('bill-detail-added', handleDetailAdded);
      socket.off('bill-detail-updated', handleDetailUpdated);
      socket.off('bill-detail-removed', handleDetailRemoved);
      // Só fazer leave se ainda estamos no mesmo billId (não mudou)
      if (billIdRef.current === currentBillId) {
        hasJoinedRef.current = false;
        leaveBill(currentBillId);
      }
    };
  }, [
    billId,
    connected,
    socket,
    joinBill,
    leaveBill,
    setBill,
    addItem,
    removeItem,
    addParticipant,
    removeParticipant,
    addConsumption,
    updateConsumption,
    removeConsumption,
    addDetail,
    updateDetail,
    removeDetail,
  ]);
};
