'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { billService } from '@/services/bill.service';
import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatCode } from '@/utils/format';
import { calculateBillTotals, calculateItemDivision } from '@/utils/calculate';
import Link from 'next/link';

const POLL_INTERVAL_MS = 10_000;

type PageError = 'private' | 'not_found' | null;

export default function BillCodePage() {
  const params = useParams();
  const code = params.code as string;

  const [bill, setBill] = useState<BillResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<PageError>(null);

  const billRef = useRef<BillResponseDto | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchBill = async (isInitial = false) => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible' && !isInitial) {
      return;
    }
    try {
      const data = await billService.getBillByCode(code);
      if (isMountedRef.current) {
        billRef.current = data;
        setBill(data);
        if (isInitial) setLoading(false);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setPageError('private');
        stopPolling();
      } else if (status === 404) {
        setPageError('not_found');
        stopPolling();
      }
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    fetchBill(true);

    intervalRef.current = setInterval(() => fetchBill(false), POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchBill(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando conta...</p>
        </div>
      </div>
    );
  }

  if (pageError === 'private') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <>
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🔒</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Esta conta é privada</h2>
              <p className="text-gray-600 mb-6">O administrador ainda não tornou esta conta pública.</p>
              <Link href="/">
                <Button variant="primary">Voltar para Home</Button>
              </Link>
            </div>
          </>
        </Card>
      </div>
    );
  }

  if (pageError === 'not_found' || !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <>
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🔍</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Conta não encontrada</h2>
              <p className="text-gray-600 mb-6">Verifique o código e tente novamente.</p>
              <Link href="/">
                <Button variant="primary">Voltar para Home</Button>
              </Link>
            </div>
          </>
        </Card>
      </div>
    );
  }

  const { participantTotals, grandTotal } = calculateBillTotals(bill);

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
            <Link href="/">
              <Button variant="secondary">Voltar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Participantes */}
        <Card title="Participantes">
          {bill.participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum participante ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {bill.participants.map((participant) => (
                <div
                  key={participantResolvedId(participant)}
                  className="bg-gray-50 rounded-full px-4 py-3 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{participant.name}</span>
                  {bill.adminId === participant.userId && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Itens */}
        <Card title="Itens">
          {bill.items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum item ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {bill.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="ml-2 text-sm text-gray-500">x{item.quantity}</span>
                    {item.category && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-primary-600">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Resumo financeiro */}
        {bill.participants.length > 0 && bill.items.length > 0 && (
          <>
            <Card title="Resumo por Participante">
              <div className="space-y-3">
                {participantTotals.map(({ participant, total }) => (
                  <div
                    key={participantResolvedId(participant)}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="font-semibold text-gray-900">{participant.name}</span>
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg mt-2">
                  <span className="text-lg font-semibold text-gray-900">Total Geral</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </Card>

            <Card title="Cálculo Detalhado por Item">
              <div className="space-y-6">
                {bill.items.map((item) => {
                  const division = calculateItemDivision(bill, item.id);
                  if (!division || division.totalConsumed === 0) return null;

                  return (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg">{item.name}</h4>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h5 className="font-semibold text-gray-900 mb-3">📊 Passo a passo do cálculo:</h5>
                        <div className="space-y-1 text-sm text-gray-700 font-mono">
                          {division.steps.map((step, index) => {
                            const isSectionHeader = step.description.startsWith('\n');
                            const cleanDescription = step.description.replace(/^\n+/, '');
                            return (
                              <div
                                key={index}
                                className={`whitespace-pre-line ${isSectionHeader ? 'mt-3 font-semibold text-gray-900' : ''}`}
                              >
                                {cleanDescription}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-900 mb-2">💰 Total por participante:</h5>
                        <div className="space-y-2">
                          {division.participantTotals.map((pt) => (
                            <div
                              key={pt.participantId}
                              className="flex justify-between items-start p-2 bg-gray-50 rounded"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{pt.participantName}</div>
                                {pt.breakdown.length > 0 && (
                                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                                    {pt.breakdown.map((b, idx) => (
                                      <div key={idx}>• {b.description}: {formatCurrency(b.value)}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-primary-600 ml-4">{formatCurrency(pt.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
