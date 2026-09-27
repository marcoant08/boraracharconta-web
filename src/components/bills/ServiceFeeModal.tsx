'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';
import {
  clampServiceFeePercent,
  SERVICE_FEE_DEFAULT,
  SERVICE_FEE_MAX,
  SERVICE_FEE_MIN,
} from '@/utils/calculate';
import { ServiceFeeType, UpdateServiceFeeRequest } from '@/types/bill.types';

interface Props {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (data: UpdateServiceFeeRequest) => Promise<void>;
}

const parseMoney = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};

export const ServiceFeeModal = ({ open, loading, onClose, onConfirm }: Props) => {
  const [type, setType] = useState<ServiceFeeType>('percent');
  const [percentDraft, setPercentDraft] = useState(String(SERVICE_FEE_DEFAULT));
  const [fixedValue, setFixedValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const commitPercent = () => {
    const next = clampServiceFeePercent(Number(percentDraft));
    setPercentDraft(String(next));
    return next;
  };

  const handleConfirm = async () => {
    setError(null);
    if (type === 'percent') {
      const percent = commitPercent();
      await onConfirm({ enabled: true, type: 'percent', percent });
      return;
    }
    if (fixedValue <= 0) {
      setError('Informe um valor fixo maior que zero.');
      return;
    }
    await onConfirm({ enabled: true, type: 'fixed', fixedValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-fee-title"
        className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-5"
      >
        <h2 id="service-fee-title" className="text-lg font-semibold text-gray-900">
          Configurar taxa de serviço
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Escolha um percentual sobre o consumo de cada pessoa ou um valor fixo dividido igualmente.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('percent')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              type === 'percent'
                ? 'border-transparent bg-primary-100 text-primary-800'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            Porcentagem
          </button>
          <button
            type="button"
            onClick={() => setType('fixed')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              type === 'fixed'
                ? 'border-transparent bg-primary-100 text-primary-800'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            Valor fixo
          </button>
        </div>

        <div className="mt-4">
          {type === 'percent' ? (
            <label className="block text-sm text-gray-700">
              Percentual ({SERVICE_FEE_MIN}% a {SERVICE_FEE_MAX}%)
              <span className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={SERVICE_FEE_MIN}
                  max={SERVICE_FEE_MAX}
                  step={1}
                  value={percentDraft}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '' || /^\d+$/.test(raw)) setPercentDraft(raw);
                  }}
                  onBlur={commitPercent}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span>%</span>
              </span>
            </label>
          ) : (
            <label className="block text-sm text-gray-700">
              Valor fixo (dividido igualmente)
              <input
                type="text"
                inputMode="numeric"
                value={formatCurrency(fixedValue)}
                onChange={(e) => setFixedValue(parseMoney(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} loading={loading}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};
