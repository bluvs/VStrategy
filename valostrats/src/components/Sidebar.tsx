import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchMaps, fetchAgents } from '../api/valorantApi';
import { Pencil, MousePointer2, Minus, ArrowUpRight, Eraser, Wrench } from 'lucide-react';
import MapSelector from './MapSelector';

export default function Sidebar() {
  const {
    setMaps,
    setAgents,
    setSelectedMap,
    activeTool,
    setActiveTool,
    drawColor,
    setDrawColor
  } = useAppStore();

  useEffect(() => {
    async function loadData() {
      const [mapsData, agentsData] = await Promise.all([fetchMaps(), fetchAgents()]);
      setMaps(mapsData);
      setAgents(agentsData);
      if (mapsData.length > 0) setSelectedMap(mapsData[0]);
    }
    loadData();
  }, [setMaps, setAgents, setSelectedMap]);

  return (
    <div className="w-80 h-full bg-[#111111] border-r border-[#2e303a] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-10 relative overflow-hidden text-[#ece8e1]">
      <div className="p-6 border-b border-[#2e303a] flex items-center gap-2">
        {/* Simple Valorant-like 'V' icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10 fill-[#ff4655]">
          <path d="M 50 85 L 15 25 L 35 25 L 50 55 L 65 25 L 85 25 Z" />
          <path d="M 68 35 L 85 35 L 50 95 L 32 35 L 48 35 L 50 65 Z" fill="#ece8e1" />
        </svg>
        <h1 className="text-4xl font-bold uppercase tracking-wider flex items-center">
          <span className="text-[#ff4655]">VStra</span>
          <span className="text-[#ece8e1]">tegy</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar relative">
        <MapSelector />

        {/* Tools */}
        <div className="space-y-3">
          <h2 className="text-sm uppercase text-gray-500 font-bold tracking-widest flex items-center gap-2">
            <Wrench size={16} /> Narzędzia
          </h2>
          <div className="grid grid-cols-5 gap-2">
            <ToolButton icon={<MousePointer2 size={20} />} tool="select" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<Pencil size={20} />} tool="draw" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<Minus size={20} />} tool="line" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<ArrowUpRight size={20} />} tool="arrow" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<Eraser size={20} />} tool="eraser" current={activeTool} onClick={setActiveTool} />
          </div>

          {['draw', 'line', 'arrow'].includes(activeTool) && (
            <div className="flex gap-2 pt-2">
              {['#ff4655', '#32cd32', '#1e90ff', '#ffffff', '#ffd700'].map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${drawColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setDrawColor(color)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ToolButton({ icon, tool, current, onClick }: { icon: React.ReactNode, tool: any, current: any, onClick: any }) {
  return (
    <button
      onClick={() => onClick(tool)}
      className={`p-3 flex justify-center items-center transition-all ${
        current === tool
          ? 'bg-[#ff4655] text-white'
          : 'bg-[#1f2326] text-gray-400 hover:bg-[#2e303a] hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}
