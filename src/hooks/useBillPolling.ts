import { useEffect, useRef } from 'react';
import { billService } from '@/services/bill.service';
import { useBillStore } from '@/store/bill.store';

const DEFAULT_MS = 3500;
const MIN_MS = 2000;
const MAX_MS = 5000;

function pollIntervalMs(): number {
  const raw = process.env.NEXT_PUBLIC_BILL_POLL_INTERVAL_MS;
  if (!raw) return DEFAULT_MS;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return DEFAULT_MS;
  return Math.min(MAX_MS, Math.max(MIN_MS, n));
}

/**
 * Mantém a conta alinhada ao servidor com GET /bills/:billId enquanto o ecrã está visível.
 * Substitui a sincronização via WebSocket.
 */
export function useBillPolling(billId: string | undefined) {
  const setBill = useBillStore((state) => state.setBill);
  const billIdRef = useRef(billId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    billIdRef.current = billId;
  }, [billId]);

  useEffect(() => {
    if (!billId) return;

    const tick = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      const id = billIdRef.current;
      if (!id) return;
      try {
        const bill = await billService.getBill(id);
        if (billIdRef.current === id) {
          setBill(bill);
        }
      } catch {
        // Polling silencioso; erros de rede ou 401 são tratados pelo interceptor / próximo tick
      }
    };

    const ms = pollIntervalMs();
    intervalRef.current = setInterval(tick, ms);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [billId, setBill]);
}
