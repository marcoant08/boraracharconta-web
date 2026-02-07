import { create } from 'zustand';

interface WebSocketState {
  connected: boolean;
  showDisconnectModal: boolean;
  setConnected: (connected: boolean) => void;
  setShowDisconnectModal: (show: boolean) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  showDisconnectModal: false,
  setConnected: (connected: boolean) => {
    set((state) => {
      // Se estava conectado e agora desconectou, mostrar modal
      if (state.connected && !connected) {
        return {
          connected: false,
          showDisconnectModal: true,
        };
      }
      // Se reconectou, fechar modal
      if (!state.connected && connected) {
        return {
          connected: true,
          showDisconnectModal: false,
        };
      }
      return { connected };
    });
  },
  setShowDisconnectModal: (show: boolean) => set({ showDisconnectModal: show }),
}));
