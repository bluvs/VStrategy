import { create } from 'zustand';

interface MultiplayerState {
  isMultiplayer: boolean;
  roomId: string;
  ws: WebSocket | null;

  setIsMultiplayer: (status: boolean) => void;
  setRoomId: (id: string) => void;
  setWs: (ws: WebSocket | null) => void;
  broadcastData: (type: string, payload: any) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  isMultiplayer: false,
  roomId: '',
  ws: null,

  setIsMultiplayer: (status) => set({ isMultiplayer: status }),
  setRoomId: (id) => set({ roomId: id }),
  setWs: (ws) => set({ ws }),

  broadcastData: (_, payload) => {
    const { ws, isMultiplayer } = get();
    // Nawet jeśli type to 'sync' po staremu, zamieniamy to na 'update_state' lub zostawiamy jak jest
    // Backend jest przygotowany na 'sync' jako 'update_state'.
    if (isMultiplayer && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update_state', payload }));
    }
  }
}));
