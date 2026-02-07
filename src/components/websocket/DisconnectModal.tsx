'use client';

import { useWebSocketStore } from '@/store/websocket.store';
import { Button } from '@/components/ui/Button';

export const DisconnectModal = () => {
  const showModal = useWebSocketStore((state) => state.showDisconnectModal);
  const setShowModal = useWebSocketStore((state) => state.setShowDisconnectModal);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Conexão Perdida
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          A conexão com o servidor foi perdida. As atualizações em tempo real podem não funcionar corretamente.
          Tentando reconectar automaticamente...
        </p>
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => setShowModal(false)}
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};
