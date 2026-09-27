'use client';

import { useState } from 'react';
import { BillResponseDto, UpdateServiceFeeRequest } from '@/types/bill.types';
import { isServiceFeeApplied } from '@/utils/calculate';
import { ServiceFeeModal } from './ServiceFeeModal';

interface Props {
  bill: BillResponseDto;
  canConfigure?: boolean;
  onUpdate: (data: UpdateServiceFeeRequest) => Promise<void>;
}

export const ServiceFeeToggle = ({ bill, canConfigure = false, onUpdate }: Props) => {
  const applied = isServiceFeeApplied(bill);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!canConfigure && !applied) return null;

  const handleToggle = async () => {
    if (!canConfigure) return;
    if (applied) {
      setLoading(true);
      try {
        await onUpdate({ enabled: false });
      } finally {
        setLoading(false);
      }
      return;
    }
    setModalOpen(true);
  };

  const handleConfirm = async (data: UpdateServiceFeeRequest) => {
    setLoading(true);
    try {
      await onUpdate(data);
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {canConfigure ? (
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 select-none cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={applied}
            disabled={loading}
            onChange={handleToggle}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <span>{applied ? 'Taxa de serviço aplicada' : 'Taxa de serviço'}</span>
        </label>
      ) : (
        <p className="mt-2 text-sm font-medium text-primary-700">Taxa de serviço aplicada</p>
      )}

      <ServiceFeeModal
        open={modalOpen}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
