'use client';

import { useState, useMemo } from 'react';
import { useBill } from '@/hooks/useBill';
import { useParams } from 'next/navigation';
import { BillDetailDto, participantResolvedId } from '@/types/bill.types';
import toast from 'react-hot-toast';

export const DetailsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addDetail, updateDetail, removeDetail } = useBill(billId);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantityConsumed, setQuantityConsumed] = useState<number>(0);
  const [action, setAction] = useState<'join' | 'left'>('join');
  const [editingDetail, setEditingDetail] = useState<BillDetailDto | null>(null);

  const details = useMemo(() => bill?.details ?? [], [bill?.details]);

  const timelineByItem = useMemo(() => {
    const grouped = new Map<string, BillDetailDto[]>();

    details.forEach((detail) => {
      const itemDetails = grouped.get(detail.itemId) || [];
      itemDetails.push(detail);
      grouped.set(detail.itemId, itemDetails);
    });

    grouped.forEach((itemDetails) => {
      itemDetails.sort((a, b) => a.quantityConsumed - b.quantityConsumed);
    });

    return grouped;
  }, [details]);

  if (!bill) return null;

  // Função auxiliar para verificar se participante está na mesa em um determinado momento
  const isParticipantAtTable = (userId: string, itemId: string, atQuantity: number): boolean => {
    const participantEvents = details
      .filter((d) => d.userId === userId && d.itemId === itemId)
      .sort((a, b) => a.quantityConsumed - b.quantityConsumed);

    if (participantEvents.length === 0) {
      return atQuantity === 0;
    }

    let isAtTable = true;
    for (const event of participantEvents) {
      if (event.quantityConsumed > atQuantity) break;
      isAtTable = event.action === 'join';
    }

    return isAtTable;
  };

  const handleAddDetail = async () => {
    if (!selectedUserId || !selectedItemId) {
      return toast.error('Selecione o participante e o item');
    }

    const item = bill.items.find((i) => i.id === selectedItemId);
    if (!item) {
      return toast.error('Item não encontrado');
    }

    if (quantityConsumed < 0) {
      return toast.error('A quantidade deve ser maior ou igual a 0');
    }

    if (quantityConsumed > item.quantity) {
      return toast.error(`A quantidade não pode ser maior que ${item.quantity} (total consumido)`);
    }

    // Validações de estado
    if (action === 'join') {
      // Verificar se participante já está na mesa no momento quantityConsumed
      // Permitir se não há eventos e quantityConsumed > 0 (chegou atrasado)
      const participantEvents = details.filter(
        (d) => d.userId === selectedUserId && d.itemId === selectedItemId
      );
      
      // Se não há eventos e quantityConsumed > 0, permitir (chegou atrasado)
      if (participantEvents.length === 0 && quantityConsumed > 0) {
        // Permitir adicionar evento de join (chegou atrasado)
      } else if (isParticipantAtTable(selectedUserId, selectedItemId, quantityConsumed)) {
        return toast.error('Participante já está na mesa neste momento');
      }
    } else if (action === 'left') {
      // Verificar se participante não está na mesa no momento quantityConsumed
      if (!isParticipantAtTable(selectedUserId, selectedItemId, quantityConsumed)) {
        return toast.error('Participante não está na mesa neste momento');
      }
    }

    try {
      if (editingDetail) {
        // Ao editar, atualizar todos os details com mesmo userId + itemId
        await updateDetail({
          itemId: editingDetail.itemId,
          userId: editingDetail.userId,
          quantityConsumed,
          action,
        });
        setEditingDetail(null);
      } else {
        await addDetail({
          itemId: selectedItemId,
          userId: selectedUserId,
          quantityConsumed,
          action,
        });
      }
      setSelectedUserId('');
      setSelectedItemId('');
      setQuantityConsumed(0);
      setAction('join');
    } catch {
      // Erro já tratado no hook
    }
  };

  const handleEditDetail = (detail: BillDetailDto) => {
    setEditingDetail(detail);
    setSelectedUserId(detail.userId);
    setSelectedItemId(detail.itemId);
    setQuantityConsumed(detail.quantityConsumed);
    setAction(detail.action);
  };

  const handleCancelEdit = () => {
    setEditingDetail(null);
    setSelectedUserId('');
    setSelectedItemId('');
    setQuantityConsumed(0);
    setAction('join');
  };

  const handleRemoveDetail = async (userId: string, itemId: string) => {
    try {
      await removeDetail({ userId, itemId });
    } catch {
      // Erro já tratado no hook
    }
  };

  const getParticipantName = (userId: string) => {
    const participant = bill.participants.find(
      (p) => participantResolvedId(p) === userId || p.userId === userId
    );
    return participant?.name || userId;
  };

  const getItemName = (itemId: string) => {
    const item = bill.items.find((i) => i.id === itemId);
    return item?.name || itemId;
  };

  return (
    <>
      <div className="flex flex-col gap-3 pt-5">
        <div className="flex gap-3">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={!!editingDetail}
              className="bg-white rounded-full shadow-md px-4 py-3 outline-none flex-1 text-gray-900 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <option value="">Selecione o participante</option>
              {bill.participants.map((participant) => (
                <option key={participantResolvedId(participant)} value={participantResolvedId(participant)}>
                  {participant.name}
                </option>
              ))}
            </select>

            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setQuantityConsumed(0);
              }}
              disabled={!!editingDetail}
              className="bg-white rounded-full shadow-md px-4 py-3 outline-none flex-1 text-gray-900 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <option value="">Selecione o item</option>
              {bill.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              value={quantityConsumed}
              onChange={(e) => setQuantityConsumed(Number(e.target.value))}
              onKeyUp={(e) => {
                if (['Enter', 'NumpadEnter'].includes(e.code)) handleAddDetail();
              }}
              placeholder="Após quantas unidades"
              className="bg-white rounded-full shadow-md px-4 py-3 outline-none flex-1 text-gray-900"
            />

            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'join' | 'left')}
              className="bg-white rounded-full shadow-md px-4 py-3 outline-none w-40 text-gray-900"
            >
              <option value="join">Entrar</option>
              <option value="left">Sair</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddDetail}
              className="bg-primary-500 shadow-lg px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity text-white font-semibold"
            >
              {editingDetail ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Salvar
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Adicionar
                </>
              )}
            </button>

            {editingDetail && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 shadow-lg px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity text-gray-900 font-semibold"
              >
                Cancelar
              </button>
            )}
          </div>
      </div>

      {details.length === 0 ? (
        <h1 className="text-xl py-5 text-center text-gray-900">
          📝 Adicione eventos na linha do tempo
        </h1>
      ) : (
        <>
          <h1 className="text-xl py-5 text-center text-gray-900">
            Linha do Tempo de Eventos
          </h1>

          <div className="flex flex-col gap-4">
            {Array.from(timelineByItem.entries()).map(([itemId, itemDetails]) => (
              <div key={itemId} className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {getItemName(itemId)}
                </h2>
                <div className="flex flex-col gap-2">
                  {itemDetails.map((detail, index) => (
                    <div
                      key={`${detail.userId}-${detail.itemId}-${detail.quantityConsumed}-${index}`}
                      className="bg-gray-50 rounded-full px-3 shadow-sm flex items-center h-12"
                    >
                      <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
                        {detail.action === 'join' ? (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        )}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-gray-600 font-medium">
                            Após {detail.quantityConsumed} unidade{detail.quantityConsumed !== 1 ? 's' : ''}:
                          </span>
                          <span className="truncate text-ellipsis font-semibold text-gray-900">
                            {getParticipantName(detail.userId)}
                          </span>
                          <span className="text-gray-600">
                            {detail.action === 'join' ? 'entrou' : 'saiu'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditDetail(detail)}
                            className="flex items-center justify-center w-10 h-10 cursor-pointer hover:opacity-70 transition-opacity"
                          >
                            <svg
                              className="w-5 h-5 text-gray-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveDetail(detail.userId, detail.itemId)}
                            className="flex items-center justify-center w-10 h-10 cursor-pointer hover:opacity-70 transition-opacity"
                          >
                            <svg
                              className="w-5 h-5 text-gray-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
