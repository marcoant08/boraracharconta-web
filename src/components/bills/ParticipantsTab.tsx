'use client';

import { useBill } from '@/hooks/useBill';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddParticipantForm } from './AddParticipantForm';
import { formatDate } from '@/utils/format';
import { useParams } from 'next/navigation';

export const ParticipantsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, removeParticipant } = useBill(billId);
  const user = useAuthStore((state) => state.user);

  if (!bill) return null;

  const isAdmin = bill.adminId === user?.id;
  const isVerifiedParticipant = bill.participants.some(
    (p) => p.userId === user?.id && p.userId !== p.name
  );
  const canManageParticipants = isAdmin || isVerifiedParticipant;

  const isVisitor = (participant: typeof bill.participants[0]) => {
    return participant.userId === participant.name;
  };

  const canRemoveParticipant = (participant: typeof bill.participants[0]) => {
    // Admin: pode remover a todos, menos si mesmo
    if (isAdmin) {
      return participant.userId !== user?.id;
    }
    // Usuário comum: pode remover apenas visitantes
    if (isVerifiedParticipant && isVisitor(participant)) {
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {canManageParticipants && (
        <Card title="Adicionar Participante Visitante">
          <AddParticipantForm billId={billId} />
        </Card>
      )}

      <Card title="Participantes">
        <div className="space-y-4">
          {bill.participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{participant.name}</span>
                  {bill.adminId === participant.userId && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                      Admin
                    </span>
                  )}
                  {!isVisitor(participant) && bill.adminId !== participant.userId && (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                      Autenticado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Entrou em {formatDate(participant.joinedAt)}
                </p>
              </div>
              {canRemoveParticipant(participant) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeParticipant(participant.userId)}
                >
                  Remover
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
