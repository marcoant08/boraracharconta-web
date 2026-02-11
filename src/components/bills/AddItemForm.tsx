'use client';

import { useRef, useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { capitalize, formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface ItemFormState {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export const AddItemForm = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addItem } = useBill(billId);
  const [item, setItem] = useState<ItemFormState>({ name: '', price: 0, quantity: 0, category: 'Geral' });
  const [quantityFocused, setQuantityFocused] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const quantityRef = useRef<HTMLInputElement | null>(null);

  const formatMoney = (value: number): string => {
    return formatCurrency(value).replace('R$', '').trim();
  };

  const parseMoney = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    return Number(digits) / 100;
  };

  const onAddItem = async () => {
    const _name = capitalize(item.name.trim());
    if (_name.length === 0) {
      nameRef.current?.focus();
      return toast.error('Digite o nome do item');
    }

    if (item.price <= 0) {
      priceRef.current?.focus();
      return toast.error('Adicione o preço do item');
    }

    if (item.quantity < 1) {
      quantityRef.current?.focus();
      return toast.error('Adicione a quantidade de itens');
    }

    if (bill?.items.some((i) => i.name.toLowerCase() === _name.toLowerCase())) {
      return toast.error(`Item '${_name}' já adicionado`);
    }

    try {
      await addItem({
        name: _name,
        value: item.price,
        quantity: item.quantity,
        category: item.category || 'Geral',
      });
      setItem({ name: '', price: 0, quantity: 0, category: 'Geral' });
      toast.success('Item adicionado');
      nameRef.current?.focus();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <>
      <div className="flex justify-center items-end gap-3 pt-3">
        <input
          ref={priceRef}
          type="text"
          value={formatMoney(item.price)}
          onChange={(e) => {
            const price = parseMoney(e.target.value);
            setItem({ ...item, price });
          }}
          onKeyUp={(e) => {
            if (['Enter', 'NumpadEnter'].includes(e.code)) onAddItem();
          }}
          className="text-5xl text-center border-b-2 border-gray-400 bg-transparent outline-none py-2 max-w-80 text-gray-900"
          style={{ width: `${formatMoney(item.price).length * 16 + 90}px` }}
          placeholder="R$ 0,00"
          inputMode="decimal"
        />
        <div
          className={`flex text-2xl px-1 rounded-md ${
            quantityFocused && 'border-2 border-gray-400 animate-pulse'
          }`}
        >
          <label htmlFor="bill-quantity" className="text-gray-900">
            x{item.quantity}
          </label>
          <input
            id="bill-quantity"
            ref={quantityRef}
            value={item.quantity}
            inputMode="decimal"
            onFocus={() => {
              toast('Digite a quantidade', { icon: 'ℹ️' });
              setQuantityFocused(true);
            }}
            onKeyUp={(e) => {
              if (['Enter', 'NumpadEnter'].includes(e.code)) onAddItem();
            }}
            onBlur={() => setQuantityFocused(false)}
            maxLength={5}
            onChange={(e) => {
              const quantity = Number(e.target.value.replace(/\D/gi, '')) || 0;
              setItem({ ...item, quantity });
            }}
            className="w-0 outline-none bg-transparent text-gray-900"
          />
        </div>
      </div>

      <div className="flex gap-5 w-full justify-between pt-5">
        <input
          ref={nameRef}
          type="text"
          placeholder="Digite o nome..."
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          onKeyUp={(e) => {
            if (['Enter', 'NumpadEnter'].includes(e.code)) onAddItem();
          }}
          className="bg-white w-full rounded-full shadow-md p-4 outline-none disabled:bg-gray-300 text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={onAddItem}
          className="bg-primary-500 shadow-lg p-4 justify-center items-center rounded-full flex ml-auto hover:opacity-90 transition-opacity"
        >
          <svg
            className="w-5 h-5 text-white"
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
        </button>
      </div>
    </>
  );
};
