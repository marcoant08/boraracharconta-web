'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useBill } from '@/hooks/useBill';
import { capitalize, formatCurrency } from '@/utils/format';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowIcon } from '@/components/icons/ArrowIcon';

type Step = 'name' | 'price' | 'quantity';

const parseMoney = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};

const parseQuantity = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits);
};

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
  </svg>
);

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,1,1,0-16H216A8,8,0,0,1,224,128Z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
  </svg>
);

const roundButtonClass =
  'shrink-0 h-14 w-14 justify-center items-center rounded-full flex transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 disabled:cursor-not-allowed disabled:opacity-40';

export const AddItemForm = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, addItem } = useBill(billId);
  const [step, setStep] = useState<Step>('name');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [quantityText, setQuantityText] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const quantityRef = useRef<HTMLInputElement | null>(null);
  const skipInitialFocus = useRef(true);

  const quantity = parseQuantity(quantityText);

  useEffect(() => {
    if (skipInitialFocus.current) {
      skipInitialFocus.current = false;
      return;
    }
    const field = step === 'name' ? nameRef : step === 'price' ? priceRef : quantityRef;
    field.current?.focus();
  }, [step]);

  const goTo = (next: Step, nextDirection: 'forward' | 'back') => {
    setDirection(nextDirection);
    setStep(next);
  };

  const advanceFromName = () => {
    const trimmed = capitalize(name.trim());
    if (trimmed.length === 0) {
      nameRef.current?.focus();
      toast.error('Digite o nome do item');
      return;
    }

    if (bill?.items.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      nameRef.current?.focus();
      toast.error(`Item '${trimmed}' já adicionado`);
      return;
    }

    goTo('price', 'forward');
  };

  const advanceFromPrice = () => {
    if (price <= 0) {
      priceRef.current?.focus();
      toast.error('O valor precisa ser maior que zero');
      return;
    }

    goTo('quantity', 'forward');
  };

  const submitItem = async () => {
    const trimmed = capitalize(name.trim());
    if (quantity < 1) {
      quantityRef.current?.focus();
      toast.error('A quantidade precisa ser pelo menos 1');
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      await addItem({
        name: trimmed,
        value: price,
        quantity,
        category: 'Geral',
      });
      setName('');
      setPrice(0);
      setQuantityText('1');
      goTo('name', 'forward');
      toast.success('Item adicionado');
    } catch {
      // Erro já tratado no hook
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (step === 'name') advanceFromName();
    else if (step === 'price') advanceFromPrice();
    else void submitItem();
  };

  const onBack = () => {
    if (submitting) return;
    if (step === 'price') goTo('name', 'back');
    else if (step === 'quantity') goTo('price', 'back');
  };

  const changeQuantity = (next: number) => {
    setQuantityText(String(Math.min(99999, Math.max(1, next))));
  };

  const canAdvance =
    (step === 'name' && name.trim().length > 0) ||
    (step === 'price' && price > 0) ||
    (step === 'quantity' && quantity >= 1);

  const stepLabel =
    step === 'name' ? 'Nome do item' : step === 'price' ? 'Valor do item' : 'Quantidade do item';

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3 pt-5">
      <p className="sr-only" aria-live="polite">
        {stepLabel}
      </p>

      {step !== 'name' && (
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          aria-label="Voltar"
          className={`${roundButtonClass} bg-white text-gray-900 shadow-md hover:bg-gray-100`}
        >
          <ArrowIcon direction="left" size={20} />
        </button>
      )}

      <div
        key={step}
        className={`min-w-0 flex-1 ${direction === 'forward' ? 'add-item-forward' : 'add-item-back'}`}
      >
        {step === 'name' && (
          <input
            ref={nameRef}
            type="text"
            name="item-name"
            placeholder="Digite o nome do item..."
            value={name}
            aria-label="Nome do item"
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            className="bg-white w-full h-14 rounded-full shadow-md px-5 outline-none text-gray-900 placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
          />
        )}

        {step === 'price' && (
          <input
            ref={priceRef}
            type="text"
            name="item-price"
            inputMode="decimal"
            placeholder="R$ 0,00"
            aria-label="Valor do item"
            autoComplete="off"
            value={price === 0 ? '' : formatCurrency(price)}
            onChange={(event) => setPrice(parseMoney(event.target.value))}
            onFocus={(event) => {
              const field = event.target;
              requestAnimationFrame(() => {
                field.setSelectionRange(field.value.length, field.value.length);
              });
            }}
            className="bg-white w-full h-14 rounded-full shadow-md px-5 outline-none text-lg font-medium tabular-nums text-gray-900 placeholder:text-gray-600 placeholder:font-normal focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
          />
        )}

        {step === 'quantity' && (
          <div className="flex items-center bg-white w-full rounded-full shadow-md h-14 px-1.5 focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-50">
            <button
              type="button"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={submitting || quantity <= 1}
              aria-label="Diminuir quantidade"
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <MinusIcon />
            </button>
            <input
              id="bill-quantity"
              ref={quantityRef}
              type="text"
              name="item-quantity"
              inputMode="numeric"
              aria-label="Quantidade"
              autoComplete="off"
              value={quantityText}
              maxLength={5}
              onChange={(event) => setQuantityText(event.target.value.replace(/\D/g, '').slice(0, 5))}
              onBlur={() => {
                if (parseQuantity(quantityText) < 1) setQuantityText('1');
              }}
              className="min-w-0 flex-1 bg-transparent text-center text-lg font-semibold tabular-nums text-gray-900 outline-none"
            />
            <button
              type="button"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={submitting || quantity >= 99999}
              aria-label="Aumentar quantidade"
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <PlusIcon />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-disabled={!canAdvance || submitting}
        aria-label={step === 'quantity' ? 'Adicionar item' : 'Avançar'}
        className={`${roundButtonClass} bg-primary-500 text-white shadow-lg ${
          canAdvance ? 'hover:opacity-90' : 'opacity-40'
        }`}
      >
        {step === 'quantity' ? <CheckIcon /> : <ArrowIcon direction="right" size={20} />}
      </button>
    </form>
  );
};
