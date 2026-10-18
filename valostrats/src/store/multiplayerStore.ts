import { create } from 'zustand';

interface MultiplayerState {
  isMultiplayer: boolean;
  isHost: boolean;
  roomId: string;
  ws: WebSocket | null;

  setIsMultiplayer: (status: boolean) => void;
  setIsHost: (status: boolean) => void;
  setRoomId: (id: string) => void;
  setWs: (ws: WebSocket | null) => void;
  broadcastData: (type: string, payload: any) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  isMultiplayer: false,
  isHost: false,
  roomId: '',
  ws: null,

  setIsMultiplayer: (status) => set({ isMultiplayer: status }),
  setIsHost: (status) => set({ isHost: status }),
  setRoomId: (id) => set({ roomId: id }),
  setWs: (ws) => set({ ws }),

  broadcastData: (type, payload) => {
    const { ws, isMultiplayer } = get();
    if (isMultiplayer && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }
}));
