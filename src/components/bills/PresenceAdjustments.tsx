'use client';

import { useRef, useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { useBillStore } from '@/store/bill.store';
import {
  BillItemDto,
  BillResponseDto,
  ParticipantDto,
  participantResolvedId,
} from '@/types/bill.types';
import { getItemAssignment } from '@/utils/calculate';

interface PresenceAdjustmentsProps {
  billId: string;
  onGoToConsumptions?: () => void;
}

interface PresenceValue {
  arrivedAfter: number | null;
  leftAfter: number | null;
}

const readPresence = (
  bill: BillResponseDto,
  itemId: string,
  userId: string,
  quantity: number
): PresenceValue => {
  const events = (bill.details || []).filter((detail) => detail.itemId === itemId && detail.userId === userId);
  const arrivedAfter =
    events.find(
      (detail) =>
        detail.action === 'join' && detail.quantityConsumed > 0 && detail.quantityConsumed < quantity
    )?.quantityConsumed ?? null;
  let leftAfter =
    events.find(
      (detail) =>
        detail.action === 'left' && detail.quantityConsumed > 0 && detail.quantityConsumed < quantity
    )?.quantityConsumed ?? null;

  if (arrivedAfter != null && leftAfter != null && arrivedAfter >= leftAfter) {
    leftAfter = null;
  }

  return { arrivedAfter, leftAfter };
};

const sharedEqualItems = (bill: BillResponseDto): BillItemDto[] =>
  bill.items.filter((item) => {
    if (item.quantity <= 1) return false;
    const assignment = getItemAssignment(bill, item.id);
    if (!assignment || assignment.weights.length < 2) return false;
    return !(assignment.quantitiesDiffer && !item.splitEqually);
  });

const Stepper = ({
  label,
  value,
  min,
  max,
  total,
  onStep,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  total: number;
  onStep: (delta: number) => void;
}) => (
  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
    <span className="min-w-0">{label}</span>
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onStep(-1)}
        disabled={value <= min}
        aria-label="Diminuir"
        className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        −
      </button>
      <span className="w-6 text-center font-semibold tabular-nums text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onStep(1)}
        disabled={value >= max}
        aria-label="Aumentar"
        className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
    <span className="shrink-0">de {total}</span>
  </div>
);

const PresencePerson = ({
  bill,
  item,
  participant,
  onSave,
}: {
  bill: BillResponseDto;
  item: BillItemDto;
  participant: ParticipantDto;
  onSave: (userId: string, itemId: string, next: PresenceValue) => Promise<void>;
}) => {
  const userId = participantResolvedId(participant);
  const server = readPresence(bill, item.id, userId, item.quantity);
  const [presence, setPresence] = useState(server);
  const presenceRef = useRef(server);

  const apply = (patch: (current: PresenceValue) => PresenceValue) => {
    const next = patch(presenceRef.current);
    presenceRef.current = next;
    setPresence(next);
    void onSave(userId, item.id, next).catch(() => {
      const current = useBillStore.getState().currentBill;
      if (!current) return;
      const reverted = readPresence(current, item.id, userId, item.quantity);
      presenceRef.current = reverted;
      setPresence(reverted);
    });
  };

  const arrivalMax = presence.leftAfter != null ? presence.leftAfter - 1 : item.quantity - 1;
  const leaveMin = presence.arrivedAfter != null ? presence.arrivedAfter + 1 : 1;
  const leaveMax = item.quantity - 1;
  const canArrive = leaveMax >= 1 && (presence.leftAfter == null || presence.leftAfter > 1);
  const canLeave = leaveMax >= leaveMin;

  return (
    <div className="px-4 py-3">
      <p className="font-medium text-gray-900">{participant.name}</p>
      {presence.arrivedAfter == null && presence.leftAfter == null && (
        <p className="mt-1 text-sm text-gray-500">Esteve do início ao fim</p>
      )}

      <label className={`mt-2 flex items-center gap-2 text-sm text-gray-800 ${canArrive || presence.arrivedAfter != null ? 'cursor-pointer' : 'opacity-40'}`}>
        <input
          type="checkbox"
          checked={presence.arrivedAfter != null}
          disabled={!canArrive && presence.arrivedAfter == null}
          onChange={(event) => {
            const checked = event.target.checked;
            apply((current) => ({
              ...current,
              arrivedAfter: checked ? 1 : null,
            }));
          }}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Chegou depois
      </label>
      {presence.arrivedAfter != null && (
        <Stepper
          label="já tinham sido consumidas"
          value={presence.arrivedAfter}
          min={1}
          max={Math.max(1, arrivalMax)}
          total={item.quantity}
          onStep={(delta) =>
            apply((current) => {
              const max = current.leftAfter != null ? current.leftAfter - 1 : item.quantity - 1;
              const value = current.arrivedAfter ?? 1;
              return { ...current, arrivedAfter: Math.min(max, Math.max(1, value + delta)) };
            })
          }
        />
      )}

      <label className={`mt-2 flex items-center gap-2 text-sm text-gray-800 ${canLeave || presence.leftAfter != null ? 'cursor-pointer' : 'opacity-40'}`}>
        <input
          type="checkbox"
          checked={presence.leftAfter != null}
          disabled={!canLeave && presence.leftAfter == null}
          onChange={(event) => {
            const checked = event.target.checked;
            apply((current) => ({
              ...current,
              leftAfter: checked
                ? Math.max(
                    current.arrivedAfter != null ? current.arrivedAfter + 1 : 1,
                    item.quantity - 1
                  )
                : null,
            }));
          }}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Saiu antes
      </label>
      {presence.leftAfter != null && (
        <Stepper
          label="quando saiu, já tinham sido consumidas"
          value={presence.leftAfter}
          min={leaveMin}
          max={leaveMax}
          total={item.quantity}
          onStep={(delta) =>
            apply((current) => {
              const min = current.arrivedAfter != null ? current.arrivedAfter + 1 : 1;
              const max = item.quantity - 1;
              const value = current.leftAfter ?? max;
              return { ...current, leftAfter: Math.min(max, Math.max(min, value + delta)) };
            })
          }
        />
      )}
    </div>
  );
};

export const PresenceAdjustments = ({ billId, onGoToConsumptions }: PresenceAdjustmentsProps) => {
  const { bill, addDetail, removeDetail } = useBill(billId);
  const chains = useRef(new Map<string, Promise<void>>());

  if (!bill) return null;

  const items = sharedEqualItems(bill);

  const save = (userId: string, itemId: string, next: PresenceValue) => {
    const key = `${itemId}:${userId}`;
    const previous = chains.current.get(key) ?? Promise.resolve();
    const run = previous.catch(() => undefined).then(async () => {
      const current = useBillStore.getState().currentBill;
      const quantity = current?.items.find((item) => item.id === itemId)?.quantity ?? 0;
      const existing = (current?.details || []).some(
        (detail) => detail.itemId === itemId && detail.userId === userId
      );

      if (existing) {
        await removeDetail({ userId, itemId }, { silent: true });
      }
      if (next.arrivedAfter != null && next.arrivedAfter > 0 && next.arrivedAfter < quantity) {
        await addDetail(
          { itemId, userId, quantityConsumed: next.arrivedAfter, action: 'join' },
          { silent: true }
        );
      }
      if (
        next.leftAfter != null &&
        next.leftAfter > 0 &&
        next.leftAfter < quantity &&
        (next.arrivedAfter == null || next.leftAfter > next.arrivedAfter)
      ) {
        await addDetail(
          { itemId, userId, quantityConsumed: next.leftAfter, action: 'left' },
          { silent: true }
        );
      }
    });
    chains.current.set(key, run);
    return run;
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl pb-5 text-center text-gray-900 text-balance">
        Alguém chegou atrasado ou foi embora antes do fim?
      </h2>
      {items.length === 0 ? (
        <p className="text-center text-gray-900 text-balance">
          Itens compartilhados em partes iguais aparecem aqui. Marque os consumos em{' '}
          {onGoToConsumptions ? (
            <button
              type="button"
              onClick={onGoToConsumptions}
              className="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Consumos
            </button>
          ) : (
            'Consumos'
          )}
          .
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {items.map((item) => {
            const assignment = getItemAssignment(bill, item.id);
            const consumers = assignment?.weights ?? [];
            return (
              <section key={item.id} className="shadow-md rounded-3xl overflow-hidden">
                <header className="bg-primary-100 px-5 py-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-700">x{item.quantity}</p>
                </header>
                <div className="bg-white divide-y divide-gray-100">
                  {consumers.map((weight) => {
                    const participant = bill.participants.find(
                      (person) => participantResolvedId(person) === weight.participantId
                    );
                    if (!participant) return null;
                    return (
                      <PresencePerson
                        key={weight.participantId}
                        bill={bill}
                        item={item}
                        participant={participant}
                        onSave={save}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};
