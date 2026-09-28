'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useBill } from '@/hooks/useBill';
import { UpdateServiceFeeRequest } from '@/types/bill.types';
import { getAppliedServiceFee } from '@/utils/calculate';
import { formatCurrency } from '@/utils/format';
import { ServiceFeeModal } from './ServiceFeeModal';

export const DetailsTab = () => {
  const params = useParams();
  const billId = params.billId as string;
  const { bill, updateServiceFee } = useBill(billId);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!bill) return null;

  const fee = getAppliedServiceFee(bill);

  const handleConfirm = async (data: UpdateServiceFeeRequest) => {
    setLoading(true);
    try {
      await updateServiceFee(data);
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await updateServiceFee({ enabled: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-xl py-5 text-center text-gray-900">Taxa de serviço</h1>
      <div className="flex flex-col gap-4">
        {!fee.enabled && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="self-center bg-primary-500 shadow-lg px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity text-white font-semibold w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar taxa de serviço
          </button>
        )}

        {fee.enabled && (
          <div className="bg-white rounded-full shadow-md px-4 flex items-center">
            <p className="flex-1 min-w-0 py-3 text-sm text-gray-700">
              {fee.type === 'percent' ? (
                <>
                  Taxa de <span className="font-semibold">{fee.percent}%</span> sobre o consumo de cada pessoa.
                </>
              ) : (
                <>
                  Taxa fixa de <span className="font-semibold">{formatCurrency(fee.fixedValue)}</span> dividida
                  igualmente.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              aria-label="Remover taxa de serviço"
              className="flex items-center justify-center w-10 h-10 shrink-0 cursor-pointer hover:opacity-70 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <ServiceFeeModal
        open={modalOpen}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
