'use client';

import { useWebSocketStore } from '@/store/websocket.store';

export const ConnectionStatus = () => {
  const connected = useWebSocketStore((state) => state.connected);

  if (connected) return null;

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-sm font-medium text-center">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-4 h-4 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Desconectado - Reconectando...</span>
      </div>
    </div>
  );
};
