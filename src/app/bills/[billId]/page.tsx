'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBill } from '@/hooks/useBill';
import { useBillStore } from '@/store/bill.store';
import { BillTabs } from '@/components/bills/BillTabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCode } from '@/utils/format';
import toast from 'react-hot-toast';

export default function BillPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.billId as string;
  const { bill, loading, error } = useBill(billId);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
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
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bill.name}</h1>
              <p className="text-gray-600 mt-1">
                Código: <span className="font-mono font-semibold">{formatCode(bill.code)}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={copyInviteLink}>
                Copiar Link de Convite
              </Button>
              <Button variant="secondary" onClick={() => router.push('/')}>
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <BillTabs />
      </main>
    </div>
  );
}
