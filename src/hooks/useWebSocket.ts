import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

// Singleton para manter uma única instância do socket
let socketInstance: Socket | null = null;
let connectionCount = 0;
let isConnecting = false;

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { token } = useAuthStore();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!token) {
      // Se não tem token, limpar socket se existir
      if (socketInstance) {
        connectionCount--;
        if (connectionCount === 0) {
          socketInstance.removeAllListeners();
          socketInstance.close();
          socketInstance = null;
          isConnecting = false;
          setSocket(null);
          setConnected(false);
        }
      }
      return () => {
        mountedRef.current = false;
      };
    }

    // Se já existe uma conexão ativa, reutilizar
    if (socketInstance && socketInstance.connected) {
      setSocket(socketInstance);
      setConnected(true);
      connectionCount++;
      return () => {
        connectionCount--;
        mountedRef.current = false;
        // Não fechar se ainda há outros componentes usando
        if (connectionCount === 0 && socketInstance) {
          socketInstance.removeAllListeners();
          socketInstance.close();
          socketInstance = null;
          isConnecting = false;
        }
      };
    }

    // Se já está conectando, aguardar sem criar interval
    if (isConnecting && socketInstance) {
      const handleConnect = () => {
        if (mountedRef.current) {
          setSocket(socketInstance);
          setConnected(true);
        }
      };

      socketInstance.once('connect', handleConnect);
      connectionCount++;

      return () => {
        socketInstance?.off('connect', handleConnect);
        connectionCount--;
        mountedRef.current = false;
      };
    }

    // Criar nova conexão apenas se não existe nenhuma
    if (!socketInstance && !isConnecting) {
      isConnecting = true;
      connectionCount++;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const socketUrl = `${apiUrl}/bills`;

      const newSocket = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 3,
        timeout: 20000,
        forceNew: false,
      });

      const handleConnect = () => {
        isConnecting = false;
        socketInstance = newSocket;
        if (mountedRef.current) {
          setSocket(newSocket);
          setConnected(true);
        }
      };

      const handleDisconnect = (reason: string) => {
        if (mountedRef.current) {
          setConnected(false);
        }
        // Se foi desconexão forçada, limpar instância
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          socketInstance = null;
          isConnecting = false;
        }
      };

      const handleConnectError = (error: Error) => {
        isConnecting = false;
        // Não mostrar toast para erros de conexão comuns
        if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
          toast.error('Erro de autenticação WebSocket');
          socketInstance = null;
          newSocket.close();
        }
      };

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('connect_error', handleConnectError);

      newSocket.on('error', (error: { message: string }) => {
        // Apenas mostrar erros críticos que não sejam de conexão
        if (error.message && !error.message.toLowerCase().includes('connection')) {
          toast.error(error.message);
        }
      });

      return () => {
        connectionCount--;
        mountedRef.current = false;
        // Só fechar se não há mais componentes usando
        if (connectionCount === 0) {
          newSocket.removeAllListeners();
          newSocket.close();
          socketInstance = null;
          isConnecting = false;
          setSocket(null);
          setConnected(false);
        }
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, [token]);

  const joinBill = useCallback(
    (billId: string) => {
      const currentSocket = socket || socketInstance;
      if (currentSocket && currentSocket.connected && billId) {
        try {
          currentSocket.emit('join-bill', { billId });
        } catch (error) {
          console.error('Erro ao entrar na conta:', error);
        }
      }
    },
    [socket]
  );

  const leaveBill = useCallback(
    (billId: string) => {
      const currentSocket = socket || socketInstance;
      if (currentSocket && currentSocket.connected && billId) {
        try {
          currentSocket.emit('leave-bill', { billId });
        } catch (error) {
          console.error('Erro ao sair da conta:', error);
        }
      }
    },
    [socket]
  );

  return {
    socket: socket || socketInstance,
    connected,
    joinBill,
    leaveBill,
  };
};
