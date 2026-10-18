import { Users, Wifi, LogOut, Plus, LogIn, X } from 'lucide-react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useState, useRef } from 'react';

export default function MultiplayerPanel() {
  const { isMultiplayer, roomId, ws, setIsMultiplayer, setRoomId, setWs } = useMultiplayerStore();
  const [joinMode, setJoinMode] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  // Trzymamy bazowy adres serwera w refie
  const baseUrl = useRef(() => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${protocol}//${host}`;
    }
    return '';
  });

  const connectAndSend = (payload: any) => {
    try {
      const socket = new WebSocket(baseUrl.current());
      // Zapisujemy WS do store od razu, by inne komponenty zdążyły podpiąć swoje nasłuchiwacze na zdarzenie message
      setWs(socket);

      socket.onopen = () => {
        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'room_created' || data.type === 'room_joined') {
             setIsMultiplayer(true);
             setRoomId(data.roomId);
             setJoinMode(false);
          } else if (data.type === 'error') {
             alert(data.message);
             socket.close();
          }
        } catch (e) {}
      };

      socket.onclose = () => {
        if (useMultiplayerStore.getState().ws === socket) {
           setWs(null);
           setIsMultiplayer(false);
           setRoomId('');
        }
      };

      socket.onerror = () => {
         alert('Error connecting to multiplayer server.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = () => {
    connectAndSend({ type: 'create_room' });
  };

  const handleJoinSubmit = () => {
    if (!roomCodeInput || roomCodeInput.length < 5) {
      alert("Please enter a valid 5-character room code.");
      return;
    }
    connectAndSend({ type: 'join_room', roomId: roomCodeInput });
  };

  const handleDisconnect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'leave_room' }));
      ws.close();
    }
    setWs(null);
    setIsMultiplayer(false);
    setRoomId('');
  };

  if (isMultiplayer) {
    return (
      <div className="absolute top-4 left-80 ml-4 bg-[#181a20] border border-[#ff4655] p-3 rounded-sm shadow-[0_4px_24px_rgba(255,70,85,0.2)] z-20 flex items-center gap-4 animate-fade-in-down overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[#ff4655]"></div>

        <div className="flex items-center gap-2 text-[#ff4655] px-2">
          <Wifi size={18} className="animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Live</span>
        </div>

        <div className="h-6 w-px bg-[#2e303a]"></div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-gray-500 tracking-widest uppercase">Room</span>
          <span className="px-3 py-1 bg-[#111111] border border-[#2e303a] rounded-sm text-sm text-white font-mono font-bold tracking-wider shadow-inner">
            {roomId}
          </span>
        </div>

        <button
          onClick={handleDisconnect}
          className="ml-2 p-2 bg-[#111111] hover:bg-[#ff4655] border border-[#2e303a] hover:border-[#ff4655] text-gray-400 hover:text-white rounded-sm transition-all duration-300 group"
          title="Disconnect"
        >
          <LogOut size={16} className="transform group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-80 ml-4 bg-[#181a20] border border-[#2e303a] p-3 rounded-sm shadow-xl z-20 flex items-center gap-3 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#2e303a] via-[#ff4655]/50 to-[#2e303a]"></div>

      {!joinMode ? (
        <>
          <div className="text-gray-400 flex items-center gap-2 pr-4 border-r border-[#2e303a]">
            <Users size={16} className="text-[#ff4655]" />
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-gray-300">Rooms</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateRoom}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#ff4655] hover:bg-[#ff5866] text-white text-xs uppercase tracking-[0.1em] font-bold transition-colors rounded-sm shadow-[0_0_10px_rgba(255,70,85,0.3)]"
            >
              <Plus size={14} /> Create Room
            </button>
            <button
              onClick={() => setJoinMode(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#111111] border border-[#2e303a] hover:border-gray-400 text-gray-300 hover:text-white text-xs uppercase tracking-[0.1em] font-bold transition-all rounded-sm"
            >
              <LogIn size={14} /> Join Room
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-2 items-center animate-fade-in">
          <input
            type="text"
            placeholder="ENTER 5-CHAR CODE"
            value={roomCodeInput}
            onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
            maxLength={5}
            className="bg-[#111111] border border-[#ff4655] text-white px-3 py-1.5 text-xs w-40 focus:outline-none uppercase font-mono tracking-widest text-center shadow-[inset_0_0_10px_rgba(255,70,85,0.1)] rounded-sm"
          />
          <button
            onClick={handleJoinSubmit}
            className="px-4 py-1.5 bg-[#ff4655] text-white text-xs uppercase tracking-[0.1em] font-bold hover:bg-[#ff5866] transition-colors rounded-sm"
          >
            Join
          </button>
          <button
            onClick={() => setJoinMode(false)}
            className="p-1.5 text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
