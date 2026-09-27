'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBill } from '@/hooks/useBill';
import { useBillStore } from '@/store/bill.store';
import { BillTabs } from '@/components/bills/BillTabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppFooter } from '@/components/ui/AppFooter';
import { formatCode } from '@/utils/format';
import toast from 'react-hot-toast';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { ServiceFeeToggle } from '@/components/bills/ServiceFeeToggle';

export default function BillPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.billId as string;
  const { bill, loading, error, updateServiceFee } = useBill(billId);
  const clearBill = useBillStore((state) => state.clearBill);

  useEffect(() => {
    return () => {
      clearBill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyInviteLink = () => {
    if (!bill) return;
    const url = `${window.location.origin}/bills/code/${bill.code}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  if (loading && !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-600">Carregando conta...</p>
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <>
            <p className="text-red-600 mb-4">{error || 'Conta não encontrada'}</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Voltar para Home
            </Button>
          </>
        </Card>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Aguardando dados da conta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40">
        <AppNavbar action="back" sticky={false} />
        <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bill.name}</h1>
              <p className="text-gray-600 mt-1">
                Código: <span className="font-mono font-semibold tracking-wide">{formatCode(bill.code)}</span>
              </p>
              <ServiceFeeToggle bill={bill} canConfigure onUpdate={updateServiceFee} />
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={copyInviteLink}>
                <CopyIcon />
              </Button>
            </div>
          </div>
          </div>
        </header>
      </div>

      <main className="flex-1 max-w-3xl mx-auto sm:px-6 lg:px-8 py-8 w-full">
        <BillTabs />
      </main>
      <AppFooter />
    </div>
  );
}
