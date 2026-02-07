'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';

interface ConnectionIndicatorProps {
  billId: string;
}

export const ConnectionIndicator = ({ billId }: ConnectionIndicatorProps) => {
  const { socket, connected } = useWebSocket();
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    if (!socket || !billId) {
      setIsInRoom(false);
      return;
    }

    // Verificar se está conectado
    const checkConnection = () => {
      setIsInRoom(socket.connected && connected);
    };

    checkConnection();

    const handleConnect = () => {
      // Quando conectar, assumir que está na room (useBill gerencia o join)
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

  const isConnected = connected && socket?.connected && isInRoom;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 h-3.5">
      <div className={`h-full w-full relative ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}>
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        />
      </div>
    </div>
  );
};
