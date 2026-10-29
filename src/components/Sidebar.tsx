import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchMaps, fetchAgents } from '../api/valorantApi';
import { Pencil, MousePointer2, Minus, ArrowUpRight, Eraser } from 'lucide-react';
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
    <div className="w-80 h-full bg-[#111111] border-r border-[#2e303a] flex flex-col shadow-[8px_0_32px_rgba(0,0,0,0.8)] z-10 relative overflow-hidden text-[#ece8e1]">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#ff4655]"></div>

      <div className="p-8 border-b border-[#2e303a] flex items-center justify-center gap-2 bg-gradient-to-b from-[#1a1c23] to-[#111111]">
        {/* Logo */}
        <img src="/logo.png" alt="VStrategy Logo" className="h-24 w-auto drop-shadow-[0_0_15px_rgba(255,70,85,0.2)]" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-10 custom-scrollbar relative">
        <MapSelector />

        {/* Tools */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-[#ff4655] rotate-45"></div>
            <h2 className="text-xs uppercase text-gray-400 font-bold tracking-[0.2em] flex items-center gap-2">
              Toolkit
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#2e303a] to-transparent"></div>
          </div>

          <div className="grid grid-cols-5 gap-2 relative">
            {/* Background decorative elements for grid */}
            <div className="absolute -inset-1 bg-[#1a1c23]/50 border border-[#2e303a]/50 rounded-sm pointer-events-none"></div>
            <ToolButton icon={<MousePointer2 size={20} />} tool="select" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<Pencil size={20} />} tool="draw" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<Minus size={20} />} tool="line" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<ArrowUpRight size={20} />} tool="arrow" current={activeTool} onClick={setActiveTool} />
            <ToolButton icon={<Eraser size={20} />} tool="eraser" current={activeTool} onClick={setActiveTool} />
          </div>

          {['draw', 'line', 'arrow'].includes(activeTool) && (
            <div className="flex gap-3 pt-4 px-1 justify-center animate-fade-in-down">
              {['#ff4655', '#32cd32', '#1e90ff', '#ffffff', '#ffd700'].map(color => (
                <button
                  key={color}
                  className={`w-7 h-7 transform transition-transform duration-200 ${
                    drawColor === color ? 'scale-125 ring-2 ring-offset-2 ring-offset-[#111111] ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
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
  const isActive = current === tool;

  return (
    <button
      onClick={() => onClick(tool)}
      className={`relative p-3 flex justify-center items-center transition-all duration-200 z-10 overflow-hidden group ${
        isActive
          ? 'text-white'
          : 'text-gray-500 hover:text-white'
      }`}
    >
      {/* Background layer */}
      <div className={`absolute inset-0 transition-colors duration-200 ${
        isActive ? 'bg-[#ff4655]/10' : 'bg-[#181a20] group-hover:bg-[#202229]'
      }`}></div>

      {/* Active state styling - border and glow */}
      {isActive && (
        <>
          <div className="absolute inset-0 border border-[#ff4655]/50 shadow-[inset_0_0_10px_rgba(255,70,85,0.2)]"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-[#ff4655] shadow-[0_0_8px_rgba(255,70,85,0.8)]"></div>
        </>
      )}

      {/* Hover state borders */}
      {!isActive && (
        <div className="absolute inset-0 border border-transparent group-hover:border-[#2e303a] transition-colors"></div>
      )}

      {/* Icon */}
      <div className={`relative z-10 transform transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
    </button>
  );
}
