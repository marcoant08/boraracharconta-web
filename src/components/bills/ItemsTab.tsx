'use client';

import { memo } from 'react';
import { useBill } from '@/hooks/useBill';
import { AddItemForm } from './AddItemForm';
import { formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';
import { BillItemDto } from '@/types/bill.types';

interface ItemCardProps {
  item: BillItemDto;
  onRemove: (itemId: string) => void;
}

const ItemCard = memo(({ item, onRemove }: ItemCardProps) => {
  return (
    <div className="bg-white rounded-full px-3 py-2 shadow-sm flex">
      <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
        <span className="text-xl mr-3 text-gray-900">x{item.quantity}</span>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg text-ellipsis font-semibold max-w-36 min-[400px]:max-w-44 md:max-w-80 text-gray-900">
            {item.name}
          </h1>
          <span className="text-sm text-gray-600">{formatCurrency(item.value)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="py-2 px-2 flex items-center justify-center w-10 cursor-pointer hover:opacity-70 transition-opacity"
        aria-label={`Remover ${item.name}`}
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
  );
});

ItemCard.displayName = 'ItemCard';

interface ItemsTabProps {
  onGoToConsumptions?: () => void;
}

export const ItemsTab = ({ onGoToConsumptions }: ItemsTabProps) => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, removeItem } = useBill(billId);

  if (!bill) return null;

  return (
    <>
      <AddItemForm />

      {bill.items.length === 0 ? (
        <h1 className="text-xl py-5 text-center text-gray-900">
          Adicione os itens
        </h1>
      ) : (
        <div className="py-5 text-center">
          <h1 className="text-xl text-gray-900">
            {bill.items.length.toString().padStart(2, '0')} item adicionado
            {bill.items.length > 1 && 's'}
          </h1>
          {bill.participants.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Quem consumiu — e quanto — fica em{' '}
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
          )}
        </div>
      )}

      {bill.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {bill.items
            .map((item) => (
              <ItemCard key={item.id} item={item} onRemove={removeItem} />
            ))
            .reverse()}
        </div>
      )}
    </>
  );
};
