'use client';

import { FormEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useBill } from '@/hooks/useBill';
import { useBillStore } from '@/store/bill.store';
import { BillItemDto, BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { getItemAssignment } from '@/utils/calculate';

interface PresenceAdjustmentsProps {
  billId: string;
  onGoToConsumptions?: () => void;
}

type PresenceKind = 'late' | 'left';

interface PresenceValue {
  arrivedAfter: number | null;
  leftAfter: number | null;
}

interface PresenceCard {
  key: string;
  userId: string;
  itemId: string;
  personName: string;
  itemName: string;
  kind: PresenceKind;
  absent: number;
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

const personConsumesItem = (bill: BillResponseDto, itemId: string, userId: string) =>
  getItemAssignment(bill, itemId)?.weights.some((weight) => weight.participantId === userId) ?? false;

const eligibleItems = (bill: BillResponseDto, userId: string) =>
  sharedEqualItems(bill).filter((item) => personConsumesItem(bill, item.id, userId));

const maxAbsent = (bill: BillResponseDto, item: BillItemDto, userId: string, kind: PresenceKind) => {
  const presence = readPresence(bill, item.id, userId, item.quantity);
  if (kind === 'late') {
    return presence.leftAfter != null ? presence.leftAfter - 1 : item.quantity - 1;
  }
  const earliestLeave = presence.arrivedAfter != null ? presence.arrivedAfter + 1 : 1;
  return item.quantity - earliestLeave;
};

const presenceCards = (bill: BillResponseDto): PresenceCard[] => {
  const cards: PresenceCard[] = [];

  for (const item of bill.items) {
    for (const participant of bill.participants) {
      const userId = participantResolvedId(participant);
      const presence = readPresence(bill, item.id, userId, item.quantity);
      if (presence.arrivedAfter != null) {
        cards.push({
          key: `${item.id}:${userId}:late`,
          userId,
          itemId: item.id,
          personName: participant.name,
          itemName: item.name,
          kind: 'late',
          absent: presence.arrivedAfter,
        });
      }
      if (presence.leftAfter != null) {
        cards.push({
          key: `${item.id}:${userId}:left`,
          userId,
          itemId: item.id,
          personName: participant.name,
          itemName: item.name,
          kind: 'left',
          absent: item.quantity - presence.leftAfter,
        });
      }
    }
  }

  return cards;
};

const selectClass =
  'mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500';

export const PresenceAdjustments = ({ billId, onGoToConsumptions }: PresenceAdjustmentsProps) => {
  const { bill, addDetail, removeDetail } = useBill(billId);
  const chains = useRef(new Map<string, Promise<void>>());
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [kind, setKind] = useState<PresenceKind | ''>('');
  const [userId, setUserId] = useState('');
  const [itemId, setItemId] = useState('');
  const [absentText, setAbsentText] = useState('1');

  if (!bill) return null;

  const resetForm = () => {
    setKind('');
    setUserId('');
    setItemId('');
    setAbsentText('1');
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    resetForm();
  };

  const savePresence = (targetUserId: string, targetItemId: string, next: PresenceValue) => {
    const key = `${targetItemId}:${targetUserId}`;
    const previous = chains.current.get(key) ?? Promise.resolve();
    const run = previous.catch(() => undefined).then(async () => {
      const current = useBillStore.getState().currentBill;
      const quantity = current?.items.find((item) => item.id === targetItemId)?.quantity ?? 0;
      const existing = (current?.details || []).some(
        (detail) => detail.itemId === targetItemId && detail.userId === targetUserId
      );

      if (existing) {
        await removeDetail({ userId: targetUserId, itemId: targetItemId }, { silent: true });
      }
      if (next.arrivedAfter != null && next.arrivedAfter > 0 && next.arrivedAfter < quantity) {
        await addDetail(
          {
            itemId: targetItemId,
            userId: targetUserId,
            quantityConsumed: next.arrivedAfter,
            action: 'join',
          },
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
          {
            itemId: targetItemId,
            userId: targetUserId,
            quantityConsumed: next.leftAfter,
            action: 'left',
          },
          { silent: true }
        );
      }
    });
    chains.current.set(key, run);
    return run;
  };

  const person = bill.participants.find((participant) => participantResolvedId(participant) === userId);
  const itemsForPerson = userId ? eligibleItems(bill, userId) : [];
  const item = itemsForPerson.find((candidate) => candidate.id === itemId);
  const absent = Number(absentText);
  const absentMax = item && kind ? maxAbsent(bill, item, userId, kind) : 0;
  const absentValid = Number.isInteger(absent) && absent >= 1 && absent <= absentMax;

  const conclude = async () => {
    if (!item || !kind || !person || !absentValid) return;
    const current = readPresence(bill, item.id, userId, item.quantity);
    const next: PresenceValue =
      kind === 'late'
        ? { arrivedAfter: absent, leftAfter: current.leftAfter }
        : { arrivedAfter: current.arrivedAfter, leftAfter: item.quantity - absent };

    setSaving(true);
    try {
      await savePresence(userId, item.id, next);
      setOpen(false);
      resetForm();
    } catch {
      // Erro já tratado no hook
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void conclude();
  };

  const removeCard = async (card: PresenceCard) => {
    const target = bill.items.find((entry) => entry.id === card.itemId);
    if (!target) return;
    const current = readPresence(bill, card.itemId, card.userId, target.quantity);
    const next: PresenceValue =
      card.kind === 'late'
        ? { arrivedAfter: null, leftAfter: current.leftAfter }
        : { arrivedAfter: current.arrivedAfter, leftAfter: null };

    setRemovingKey(card.key);
    try {
      await savePresence(card.userId, card.itemId, next);
    } catch {
      // Erro já tratado no hook
    } finally {
      setRemovingKey(null);
    }
  };

  const cards = presenceCards(bill);

  return (
    <section>
      <h2 className="text-xl pb-5 text-center text-gray-900 text-balance">
        Alguém chegou atrasado ou foi embora antes do fim?
      </h2>
      <div className="flex flex-col items-center gap-4">
        {cards.length > 0 && (
          <div className="flex w-full flex-col gap-3">
            {cards.map((card) => (
              <div key={card.key} className="bg-white rounded-full shadow-md px-4 flex items-center">
                <p className="flex-1 min-w-0 py-3 text-sm text-gray-700">
                  {card.kind === 'late' ? (
                    <>
                      Antes de <span className="font-semibold">{card.personName}</span> chegar, foram consumidos{' '}
                      <span className="font-semibold">{card.absent}</span> {card.itemName}
                    </>
                  ) : (
                    <>
                      Após <span className="font-semibold">{card.personName}</span> sair foram consumidas{' '}
                      <span className="font-semibold">{card.absent}</span> {card.itemName}
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => void removeCard(card)}
                  disabled={removingKey === card.key}
                  aria-label="Remover"
                  className="flex items-center justify-center w-10 h-10 shrink-0 cursor-pointer hover:opacity-70 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-primary-500 shadow-lg px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity text-white font-semibold w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar atraso/saída
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Fechar" onClick={close} />
          <form
            onSubmit={onSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="presence-title"
            className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-5"
          >
            <h2 id="presence-title" className="text-lg font-semibold text-gray-900">
              Adicionar presença
            </h2>

            <label className="block text-sm text-gray-700 mt-4">
              O que aconteceu?
              <select
                value={kind}
                onChange={(event) => {
                  setKind(event.target.value as PresenceKind | '');
                  setUserId('');
                  setItemId('');
                  setAbsentText('1');
                }}
                className={selectClass}
              >
                <option value="">Selecione</option>
                <option value="late">A pessoa atrasou</option>
                <option value="left">A pessoa foi embora antes do fim</option>
              </select>
            </label>

            {kind && (
              <label className="block text-sm text-gray-700 mt-4">
                Quem?
                <select
                  value={userId}
                  onChange={(event) => {
                    setUserId(event.target.value);
                    setItemId('');
                    setAbsentText('1');
                  }}
                  className={selectClass}
                >
                  <option value="">Selecione a pessoa</option>
                  {bill.participants.map((participant) => {
                    const id = participantResolvedId(participant);
                    return (
                      <option key={id} value={id}>
                        {participant.name}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}

            {kind && userId && (
              <label className="block text-sm text-gray-700 mt-4">
                Qual item foi consumido?
                <select
                  value={itemId}
                  onChange={(event) => {
                    setItemId(event.target.value);
                    setAbsentText('1');
                  }}
                  className={selectClass}
                >
                  <option value="">Selecione o item</option>
                  {itemsForPerson.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
                {itemsForPerson.length === 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Nenhum item compartilhado em partes iguais para essa pessoa. Marque os consumos em{' '}
                    {onGoToConsumptions ? (
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          onGoToConsumptions();
                        }}
                        className="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2"
                      >
                        Consumos
                      </button>
                    ) : (
                      'Consumos'
                    )}
                    .
                  </p>
                )}
              </label>
            )}

            {kind && person && item && (
              <label className="block text-sm text-gray-700 mt-4">
                Quantos {item.name} foram consumidos sem a presença de {person.name}?
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={Math.max(absentMax, 1)}
                  value={absentText}
                  onChange={(event) => setAbsentText(event.target.value.replace(/\D/g, ''))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {absentMax < 1 && (
                  <p className="mt-2 text-sm text-red-600">
                    Não há unidades sobrando para esse ajuste.
                  </p>
                )}
              </label>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={close} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={saving} disabled={!absentValid || saving}>
                Concluir
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
