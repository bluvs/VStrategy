import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChevronDown } from 'lucide-react';

export default function MapSelector() {
  const { maps, selectedMap, setSelectedMap } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 bg-[#ff4655] rotate-45"></div>
        <h2 className="text-xs uppercase text-gray-400 font-bold tracking-[0.2em] flex items-center gap-2">
          Select Map
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#2e303a] to-transparent"></div>
      </div>

      {/* Custom Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#181a20] border \${isOpen ? 'border-[#ff4655]' : 'border-[#2e303a]'} hover:border-[#ff4655] text-white p-4 flex justify-between items-center transition-all duration-300 uppercase tracking-widest text-sm relative group overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff4655]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="truncate relative z-10 font-bold">{selectedMap ? selectedMap.displayName : 'Wybierz mapę'}</span>
        <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-[#2e303a] group-hover:bg-[#ff4655] transition-colors duration-300 rounded-sm">
          <ChevronDown size={16} className={`transition-transform duration-300 \${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#111111] rotate-45 translate-x-1.5 translate-y-1.5 border-l border-t border-[#2e303a] group-hover:border-[#ff4655] transition-colors"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#181a20]/95 backdrop-blur-sm border border-[#ff4655]/50 z-50 max-h-72 overflow-y-auto custom-scrollbar shadow-[0_10px_30px_rgba(0,0,0,0.8)] origin-top animate-fade-in-down rounded-sm before:absolute before:inset-0 before:pointer-events-none before:border before:border-[#ff4655]/20 before:m-1">
          {maps.map(map => (
            <button
              key={map.uuid}
              onClick={() => {
                setSelectedMap(map);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-4 p-3 hover:bg-[#ff4655]/10 transition-colors border-b border-[#2e303a]/50 last:border-b-0 text-left group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>

              <div className="w-14 h-10 bg-[#111111] overflow-hidden rounded-sm border border-[#2e303a] group-hover:border-[#ff4655]/50 transition-colors relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                <img
                  src={map.displayIcon}
                  alt={map.displayName}
                  className="w-full h-full object-cover scale-150 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <span className="uppercase tracking-[0.15em] text-sm text-gray-400 group-hover:text-white font-bold transition-colors duration-200">
                {map.displayName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
