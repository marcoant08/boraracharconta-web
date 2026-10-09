'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { billService } from '@/services/bill.service';
import { BillResponseDto, participantResolvedId } from '@/types/bill.types';
import { PaperSlip } from '@/components/home/PaperSlip';
import desk from '@/components/home/HomeDesk.module.css';
import codeStyles from './BillCode.module.css';
import { formatCurrency, formatCode } from '@/utils/format';
import { BillParticipantSummary } from '@/components/bills/BillParticipantSummary';
import { BillItemDetailedCalc } from '@/components/bills/BillItemDetailedCalc';
import { ServiceFeeCard } from '@/components/bills/ServiceFeeCard';
import { AppFooter } from '@/components/ui/AppFooter';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { withEqualSplitFlags } from '@/utils/equal-split';

type PageError = 'private' | 'not_found' | null;

export default function BillCodePage() {
  const params = useParams();
  const code = params.code as string;

  const [bill, setBill] = useState<BillResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<PageError>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBill = async () => {
      try {
        const data = withEqualSplitFlags(await billService.getBillByCode(code));
        if (!cancelled) {
          setBill(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          setPageError('private');
        } else if (status === 404) {
          setPageError('not_found');
        }
        setLoading(false);
      }
    };

    fetchBill();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (loading) {
    return (
      <div className={`${desk.desk} items-center justify-center`}>
        <div className="text-center">
          <svg
            className={`${desk.spinner} h-12 w-12`}
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
          <p className="mt-4">Carregando conta...</p>
        </div>
      </div>
    );
  }

  if (pageError === 'private') {
    return (
      <div className={desk.desk}>
        <AppNavbar action="public" />
        <main className={`${desk.main} flex flex-col justify-center`}>
          <PaperSlip title="Esta conta é privada">
            <div className={codeStyles.notice}>
              <p>O administrador ainda não tornou esta conta pública.</p>
              <Link className={desk.create} href="/">
                Voltar para Home
              </Link>
            </div>
          </PaperSlip>
        </main>
      </div>
    );
  }

  const copyInviteLink = () => {
    if (!bill) return;
    const url = `${window.location.origin}/bills/code/${bill.code}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  if (pageError === 'not_found' || !bill) {
    return (
      <div className={desk.desk}>
        <AppNavbar action="public" />
        <main className={`${desk.main} flex flex-col justify-center`}>
          <PaperSlip title="Conta não encontrada">
            <div className={codeStyles.notice}>
              <p>Verifique o código e tente novamente.</p>
              <Link className={desk.create} href="/">
                Voltar para Home
              </Link>
            </div>
          </PaperSlip>
        </main>
      </div>
    );
  }

  return (
    <div className={desk.desk}>
      <AppNavbar action="public" />

      <main className={desk.main}>
        <div className={codeStyles.head}>
          <div className="min-w-0">
            <h1 className={codeStyles.name}>{bill.name}</h1>
            <p className={codeStyles.codeLine}>
              Código: <span className={desk.codeValue}>{formatCode(bill.code)}</span>
            </p>
          </div>
          <button type="button" className={desk.iconBtn} onClick={copyInviteLink} aria-label="Copiar link da conta">
            <ShareIcon size={20} />
          </button>
        </div>

        <div className={desk.stack}>
          <PaperSlip title="Participantes">
            {bill.participants.length === 0 ? (
              <p className={codeStyles.empty}>Nenhum participante ainda.</p>
            ) : (
              <div className={codeStyles.rows}>
                {bill.participants.map((participant) => (
                  <div key={participantResolvedId(participant)} className={codeStyles.row}>
                    <span className={codeStyles.rowName}>{participant.name}</span>
                  </div>
                ))}
              </div>
            )}
          </PaperSlip>

          <PaperSlip title="Itens">
            {bill.items.length === 0 ? (
              <p className={codeStyles.empty}>Nenhum item ainda.</p>
            ) : (
              <div className={codeStyles.rows}>
                {bill.items.map((item) => (
                  <div key={item.id} className={codeStyles.row}>
                    <div className={codeStyles.rowMain}>
                      <span className={codeStyles.rowName}>{item.name}</span>
                      <span className={codeStyles.qty}>x{item.quantity}</span>
                    </div>
                    <div className={codeStyles.price}>
                      {formatCurrency(item.value)}
                      <p className={codeStyles.lineTotal}>total: {formatCurrency(item.value * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PaperSlip>

          {bill.participants.length > 0 && bill.items.length > 0 && (
            <>
              <BillParticipantSummary bill={bill} paper />
              <ServiceFeeCard bill={bill} paper />
              <BillItemDetailedCalc bill={bill} paper />
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
