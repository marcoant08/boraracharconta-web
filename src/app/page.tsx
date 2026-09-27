'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { billService } from '@/services/bill.service';
import { BillSummaryDto } from '@/types/bill.types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { AppFooter } from '@/components/ui/AppFooter';
import { NotePencilIcon } from '@/components/icons/NotePencilIcon';
import { formatCode } from '@/utils/format';
import Link from 'next/link';
import { getAxiosErrorMessage } from '@/utils/api-error';
import toast from 'react-hot-toast';
import { SyncIcon } from '@/components/icons/SyncIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authReady = useAuthStore((state) => state.authReady);
  const [bills, setBills] = useState<BillSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const userBills = await billService.getBills();
      setBills(userBills);
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao carregar contas.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const enterDeleteMode = () => {
    setSelectedIds([]);
    setDeleteMode(true);
  };

  const cancelDeleteMode = () => {
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const toggleSelection = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
  };

  const confirmDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => billService.deleteBill(id)));
      toast.success(
        selectedIds.length === 1 ? 'Conta excluída!' : `${selectedIds.length} contas excluídas!`
      );
      setDeleteMode(false);
      setSelectedIds([]);
      await loadBills();
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao excluir contas.');
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    loadBills();
  }, [authReady, isAuthenticated, loadBills]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppNavbar action="public" />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl text-gray-900 text-balance leading-tight">
              Crie uma conta e comece a dividir despesas com seus amigos
            </h1>
          </div>
          <Card className="text-center mb-8">
            <p className="text-gray-600 mb-6">
              Veja uma conta pública pelo código, sem precisar entrar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/bills/code">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Ver por Código
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Entrar
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar action="logout" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl text-gray-900 text-balance leading-tight">
            Crie uma conta e comece a dividir despesas com seus amigos
          </h1>
        </div>

        <Card className="text-center mb-8">
          <p className="text-gray-600 mb-6">
            Escolha uma opção para começar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bills/new">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <span className="flex items-center gap-2">
                  <NotePencilIcon size={20} />
                  Criar Nova Conta
                </span>
              </Button>
            </Link>
            <Link href="/bills/code">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Ver por Código
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Minhas Contas</h3>
            <div className="flex gap-2">
              {!deleteMode && (
                <Button variant="secondary" size="sm" onClick={loadBills}>
                  <SyncIcon />
                </Button>
              )}
              {!deleteMode && bills.length > 0 && (
                <Button variant="secondary" size="sm" onClick={enterDeleteMode}>
                  <TrashIcon />
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-primary-700 mx-auto"
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
              <p className="mt-2 text-gray-600">Carregando contas...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Você ainda não participa de nenhuma conta.</p>
              <p className="text-sm text-gray-600">
                Crie uma nova conta ou entre com um código para começar.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {bills.map((bill) => {
                  const billItem = (
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{bill.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          Código:{' '}
                          <span className="font-mono font-semibold tracking-wide">{formatCode(bill.code)}</span>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              bill.isPublic
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {bill.isPublic ? 'Pública' : 'Privada'}
                          </span>
                        </p>
                      </div>
                      {deleteMode ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(bill.id)}
                          onChange={() => toggleSelection(bill.id)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  );

                  return deleteMode ? (
                    <div
                      key={bill.id}
                      onClick={() => toggleSelection(bill.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedIds.includes(bill.id)
                          ? 'border-gray-200 bg-red-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {billItem}
                    </div>
                  ) : (
                    <Link
                      key={bill.id}
                      href={`/bills/${bill.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:shadow-card transition-all"
                    >
                      {billItem}
                    </Link>
                  );
                })}
              </div>

              {deleteMode && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={cancelDeleteMode}
                    disabled={deleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={confirmDelete}
                    disabled={selectedIds.length === 0 || deleting}
                    loading={deleting}
                  >
                    Confirmar{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h4 className="font-semibold text-gray-900 mb-2">Crie Contas</h4>
            <p className="text-gray-600 text-sm">
              Crie uma conta e compartilhe o código com seus amigos
            </p>
          </Card>
          <Card>
            <h4 className="font-semibold text-gray-900 mb-2">Adicione Itens</h4>
            <p className="text-gray-600 text-sm">
              Adicione itens e valores para dividir entre os participantes
            </p>
          </Card>
          <Card>
            <h4 className="font-semibold text-gray-900 mb-2">Veja Estatísticas</h4>
            <p className="text-gray-600 text-sm">
              Visualize quanto cada pessoa deve pagar automaticamente
            </p>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
