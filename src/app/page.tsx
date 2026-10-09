'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { billService } from '@/services/bill.service';
import { BillSummaryDto } from '@/types/bill.types';
import { Button } from '@/components/ui/Button';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { AppFooter } from '@/components/ui/AppFooter';
import { LandingSplit } from '@/components/landing/LandingSplit';
import { PaperSlip } from '@/components/home/PaperSlip';
import desk from '@/components/home/HomeDesk.module.css';
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
      <div className={`${desk.desk} items-center justify-center`}>
        <p>Carregando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingSplit />;
  }

  return (
    <div className={desk.desk}>
      <AppNavbar action="logout" />

      <main className={desk.main}>
        <h1 className={desk.title}>Suas contas</h1>

        <div className={desk.stack}>
          <PaperSlip>
            <p className={desk.lead}>Escolha uma opção para começar</p>
            <div className={desk.actions}>
              <Link className={desk.create} href="/bills/new">
                <NotePencilIcon size={20} />
                Criar Nova Conta
              </Link>
              <Link className={desk.code} href="/bills/code">
                Ver por Código
              </Link>
            </div>
          </PaperSlip>

          <PaperSlip>
            <div className={desk.listHead}>
              <h2 className={desk.listTitle}>Minhas Contas</h2>
              <div className={desk.tools}>
                {!deleteMode && (
                  <button type="button" className={desk.iconBtn} onClick={loadBills} aria-label="Atualizar contas">
                    <SyncIcon />
                  </button>
                )}
                {!deleteMode && bills.length > 0 && (
                  <button type="button" className={desk.iconBtn} onClick={enterDeleteMode} aria-label="Excluir contas">
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className={desk.status}>
                <svg className={desk.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p>Carregando contas...</p>
              </div>
            ) : bills.length === 0 ? (
              <div className={desk.status}>
                <p>Você ainda não participa de nenhuma conta.</p>
                <p>Crie uma nova conta ou entre com um código para começar.</p>
              </div>
            ) : (
              <>
                <div className={desk.bills}>
                  {bills.map((bill) => {
                    const billItem = (
                      <>
                        <div className={desk.billMain}>
                          <h3 className={desk.billName}>{bill.name}</h3>
                          <p className={desk.meta}>
                            Código:{' '}
                            <span className={desk.codeValue}>{formatCode(bill.code)}</span>
                            <span className={`${desk.badge} ${bill.isPublic ? desk.public : desk.private}`}>
                              {bill.isPublic ? 'Pública' : 'Privada'}
                            </span>
                          </p>
                        </div>
                        {deleteMode ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(bill.id)}
                            onChange={() => toggleSelection(bill.id)}
                            className={desk.check}
                            aria-label={`Selecionar ${bill.name}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <svg className={desk.chevron} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </>
                    );

                    return deleteMode ? (
                      <div
                        key={bill.id}
                        onClick={() => toggleSelection(bill.id)}
                        className={`${desk.picker} ${selectedIds.includes(bill.id) ? desk.picked : ''}`}
                      >
                        {billItem}
                      </div>
                    ) : (
                      <Link key={bill.id} href={`/bills/${bill.id}`} className={desk.bill}>
                        {billItem}
                      </Link>
                    );
                  })}
                </div>

                {deleteMode && (
                  <div className={desk.confirm}>
                    <Button variant="secondary" className="flex-1" onClick={cancelDeleteMode} disabled={deleting}>
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
          </PaperSlip>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
