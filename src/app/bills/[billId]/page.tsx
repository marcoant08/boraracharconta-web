'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBill } from '@/hooks/useBill';
import { useBillRoom } from '@/hooks/useBillRoom';
import { useBillStore } from '@/store/bill.store';
import { useWebSocket } from '@/hooks/useWebSocket';
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
  // Gerenciar conexão WebSocket da sala apenas uma vez na página principal
  useBillRoom(billId);
  const clearBill = useBillStore((state) => state.clearBill);
  const { socket, connected, reconnect } = useWebSocket();
  const [isInRoom, setIsInRoom] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Limpar store ao sair da página (apenas na desmontagem)
  useEffect(() => {
    return () => {
      // Limpar apenas quando realmente sair da página
      clearBill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escutar eventos de conexão do socket diretamente
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false);
      return;
    }

    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    // Verificar estado inicial
    setSocketConnected(socket.connected);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Verificar status de conexão
  useEffect(() => {
    if (!socket || !billId) {
      setIsInRoom(false);
      return;
    }

    const checkConnection = () => {
      setIsInRoom(socket.connected && connected);
    };

    checkConnection();

    const handleConnect = () => {
      setIsInRoom(true);
    };

    const handleDisconnect = () => {
      setIsInRoom(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, connected, billId]);

  const isWebSocketConnected = socketConnected;

  const copyInviteLink = () => {
    if (!bill) return;
    const url = `${window.location.origin}/bills/join?code=${bill.code}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleReconnect = () => {
    reconnect();
    toast.success('Tentando reconectar...');
  };

  // Mostrar loader apenas se estiver carregando E não tiver bill ainda
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

  // Se não tem bill ainda, mostrar mensagem simples
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
              {!isWebSocketConnected && (
                <Button variant="primary" onClick={handleReconnect}>
                  Reconectar
                </Button>
              )}
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
