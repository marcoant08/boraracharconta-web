'use client';

import { useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { participantResolvedId } from '@/types/bill.types';
import { AddParticipantForm } from './AddParticipantForm';
import { useParams } from 'next/navigation';
import { UserIcon } from '../icons/UserIcon';

export const ParticipantsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, removeParticipant } = useBill(billId);
  const [loadingParticipantId, setLoadingParticipantId] = useState<string | null>(null);

  const handleRemove = async (participantId: string) => {
    if (loadingParticipantId) return;
    setLoadingParticipantId(participantId);
    try {
      await removeParticipant(participantId);
    } catch {
      // Erro já tratado no hook
    } finally {
      setLoadingParticipantId(null);
    }
  };

  if (!bill) return null;

  return (
    <>
      <AddParticipantForm billId={billId} />

      {bill.participants.length === 0 ? (
        <h1 className="text-xl py-5 text-center text-gray-900">
          Adicione as pessoas
        </h1>
      ) : (
        <h1 className="text-xl py-5 text-center text-gray-900">
          {bill.participants.length.toString().padStart(2, '0')}{' '}
          {bill.participants.length > 1 ? 'pessoas adicionadas' : 'pessoa adicionada'}
        </h1>
      )}

      {bill.participants.length > 0 && (
        <div className="flex flex-col gap-2">
          {bill.participants
            .map((participant) => (
              <div
                key={participantResolvedId(participant)}
                className="bg-white rounded-full px-3 shadow-md flex items-center h-12"
              >
                <div className="flex items-center gap-3 px-3 flex-1">
                  <UserIcon />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h1 className="truncate text-ellipsis font-semibold text-gray-900 max-w-64">
                      {participant.name}
                    </h1>
                    {bill.adminId === participant.userId && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-800 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                {bill.adminId !== participant.userId && (
                  <button
                    onClick={() => handleRemove(participantResolvedId(participant))}
                    disabled={!!loadingParticipantId}
                    className="flex items-center justify-center ml-auto w-10 h-10 cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingParticipantId === participantResolvedId(participant) ? (
                      <svg
                        className="animate-spin h-5 w-5 text-primary-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                )}
              </div>
            ))
            .reverse()}
        </div>
      )}
    </>
  );
};
