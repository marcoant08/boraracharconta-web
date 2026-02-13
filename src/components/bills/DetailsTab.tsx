'use client';

import { useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
import { useParams } from 'next/navigation';
import { BillDetailDto } from '@/types/bill.types';
import toast from 'react-hot-toast';

export const DetailsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addDetail, updateDetail, removeDetail } = useBill(billId);
  const user = useAuthStore((state) => state.user);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [consumedDuringAbsence, setConsumedDuringAbsence] = useState<number>(1);
  const [editingDetail, setEditingDetail] = useState<BillDetailDto | null>(null);

  if (!bill) return null;

  // Garantir que details sempre existe
  const details = bill.details || [];

  const isAdmin = bill.adminId === user?.id;
  const isVerifiedParticipant = bill.participants.some(
    (p) => p.userId === user?.id && p.userId !== p.name
  );
  const canManageDetails = isAdmin || isVerifiedParticipant;

  const handleAddDetail = async () => {
    if (!selectedUserId || !selectedItemId) {
      return toast.error('Selecione o participante e o item');
    }

    if (consumedDuringAbsence < 1) {
      return toast.error('A quantidade deve ser maior ou igual a 1');
    }

    try {
      if (editingDetail) {
        // Ao editar, usar os valores originais do detail sendo editado
        await updateDetail({
          userId: editingDetail.userId,
          itemId: editingDetail.itemId,
          consumedDuringAbsence,
        });
        setEditingDetail(null);
      } else {
        // Verificar se já existe um detail para este userId + itemId
        const detailExists = details.some(
          (d) => d.userId === selectedUserId && d.itemId === selectedItemId
        );

        if (detailExists) {
          return toast.error('Já existe um detail para este participante e item');
        }

        await addDetail({
          userId: selectedUserId,
          itemId: selectedItemId,
          consumedDuringAbsence,
        });
      }
      setSelectedUserId('');
      setSelectedItemId('');
      setConsumedDuringAbsence(1);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEditDetail = (detail: BillDetailDto) => {
    setEditingDetail(detail);
    setSelectedUserId(detail.userId);
    setSelectedItemId(detail.itemId);
    setConsumedDuringAbsence(detail.consumedDuringAbsence);
  };

  const handleCancelEdit = () => {
    setEditingDetail(null);
    setSelectedUserId('');
    setSelectedItemId('');
    setConsumedDuringAbsence(1);
  };

  const handleRemoveDetail = async (userId: string, itemId: string) => {
    try {
      await removeDetail({ userId, itemId });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const getParticipantName = (userId: string) => {
    const participant = bill.participants.find((p) => p.userId === userId);
    return participant?.name || userId;
  };

  const getItemName = (itemId: string) => {
    const item = bill.items.find((i) => i.id === itemId);
    return item?.name || itemId;
  };

  return (
    <>
      {canManageDetails && (
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
                <option key={participant.userId} value={participant.userId}>
                  {participant.name}
                </option>
              ))}
            </select>

            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
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

            <input
              type="number"
              min="1"
              value={consumedDuringAbsence}
              onChange={(e) => setConsumedDuringAbsence(Number(e.target.value))}
              onKeyUp={(e) => {
                if (['Enter', 'NumpadEnter'].includes(e.code)) handleAddDetail();
              }}
              placeholder="Quantidade"
              className="bg-white rounded-full shadow-md px-4 py-3 outline-none w-32 text-gray-900"
            />
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
      )}

      {details.length === 0 ? (
        <h1 className="text-xl py-5 text-center text-gray-900">
          📝 Adicione detalhes de consumo durante ausência
        </h1>
      ) : (
        <>
          <h1 className="text-xl py-5 text-center text-gray-900">
            {details.length.toString().padStart(2, '0')}{' '}
            {details.length > 1 ? 'detalhes adicionados' : 'detalhe adicionado'}
          </h1>

          <div className="flex flex-col gap-2">
            {details.map((detail) => (
              <div
                key={`${detail.userId}-${detail.itemId}`}
                className="bg-white rounded-full px-3 shadow-md flex items-center h-12"
              >
                <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="truncate text-ellipsis font-semibold text-gray-900">
                      {getParticipantName(detail.userId)}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="truncate text-ellipsis text-gray-900">
                      {getItemName(detail.itemId)}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-900 font-semibold">
                      {detail.consumedDuringAbsence} unidade{detail.consumedDuringAbsence > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {canManageDetails && (
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
                )}
              </div>
            )).reverse()}
          </div>
        </>
      )}
    </>
  );
};
