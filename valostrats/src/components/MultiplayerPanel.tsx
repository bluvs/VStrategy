import { Users, Wifi, LogOut } from 'lucide-react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useState, useEffect } from 'react';

// Dostęp do ipcRenderer z wyeksponowanego w preload contextBridge
const ipcRenderer = (window as any).electron ? (window as any).electron.ipcRenderer : null;

export default function MultiplayerPanel() {
  const { isMultiplayer, isHost, roomId, ws, setIsMultiplayer, setIsHost, setRoomId, setWs } = useMultiplayerStore();
  const [ipInput, setIpInput] = useState('');

  const connectToWs = (url: string) => {
    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        setWs(socket);
        setIsMultiplayer(true);
      };

      socket.onclose = () => {
        setWs(null);
        setIsMultiplayer(false);
        setIsHost(false);
        setRoomId('');
        // Aby zapobiec ostrzeżeniom eslint dot. zależności, wyślij komunikat bezpośrenio jeśli renderer istnieje
        if (ipcRenderer && isHost) {
           ipcRenderer.send('stop-server');
        }
      };

      socket.onerror = () => {
         alert('Błąd połączenia. Upewnij się, że host ma otwarty port.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!ipcRenderer) return;

    const handleServerStatus = (_event: any, arg: any) => {
      if (arg.status === 'started') {
        setIsHost(true);
        setIsMultiplayer(true);
        setRoomId(`127.0.0.1:${arg.port}`);

        // Host jako pierwszy klient też musi się połączyć do własnego serwera
        connectToWs(`ws://127.0.0.1:${arg.port}`);
      } else if (arg.status === 'error') {
        alert('Błąd podczas stawiania serwera: ' + arg.error);
      }
    };

    ipcRenderer.on('server-status', handleServerStatus);
    return () => {
      ipcRenderer.removeListener('server-status', handleServerStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsHost, setIsMultiplayer, setRoomId]);

  const handleHost = () => {
    if (ipcRenderer) {
      ipcRenderer.send('start-server', 8080);
    } else {
      alert("Hostowanie dostępne tylko w aplikacji Electron na PC.");
    }
  };

  const handleJoin = () => {
    if (!ipInput) return;
    const url = ipInput.includes('ws://') ? ipInput : `ws://${ipInput}`;
    setRoomId(ipInput);
    setIsHost(false);
    connectToWs(url);
  };

  const handleDisconnect = () => {
    if (ws) {
      ws.close();
    }
    if (ipcRenderer && isHost) {
      ipcRenderer.send('stop-server');
    }
    setWs(null);
    setIsMultiplayer(false);
    setIsHost(false);
    setRoomId('');
  };

  if (isMultiplayer) {
    return (
      <div className="absolute top-4 left-80 ml-4 bg-[#111111] border border-[#ff4655] p-3 rounded-lg shadow-xl z-20 flex items-center gap-4">
        <div className="flex items-center gap-2 text-green-500">
          <Wifi size={18} className="animate-pulse" />
          <span className="text-sm font-bold tracking-wider">{isHost ? 'HOSTOWANIE' : 'POŁĄCZONO'}</span>
        </div>
        <div className="px-3 py-1 bg-[#1f2326] rounded text-sm text-gray-300 font-mono">
          {roomId}
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
          title="Rozłącz"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-80 ml-4 bg-[#111111] border border-[#2e303a] p-3 rounded-lg shadow-xl z-20 flex items-center gap-3">
      <div className="text-gray-400 flex items-center gap-2 pr-3 border-r border-[#2e303a]">
        <Users size={18} />
        <span className="text-sm uppercase font-bold tracking-widest text-gray-500">Multiplayer</span>
      </div>

      <button
        onClick={handleHost}
        className="px-4 py-1.5 bg-[#2e303a] hover:bg-[#ff4655] text-white text-sm uppercase tracking-wider rounded transition-colors"
      >
        Hostuj (IP)
      </button>

      <div className="flex gap-1">
        <input
          type="text"
          placeholder="Adres IP..."
          value={ipInput}
          onChange={e => setIpInput(e.target.value)}
          className="bg-[#1f2326] border border-[#2e303a] text-white px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-[#ff4655]"
        />
        <button
          onClick={handleJoin}
          className="px-4 py-1.5 bg-[#1f2326] border border-[#2e303a] hover:border-[#ff4655] hover:text-[#ff4655] text-white text-sm uppercase tracking-wider transition-colors"
        >
          Dołącz
        </button>
      </div>
    </div>
  );
}
