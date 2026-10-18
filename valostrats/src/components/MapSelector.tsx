import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChevronDown, Map as MapIcon } from 'lucide-react';

export default function MapSelector() {
  const { maps, selectedMap, setSelectedMap } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3 relative">
      <h2 className="text-sm uppercase text-gray-500 font-bold tracking-widest flex items-center gap-2">
        <MapIcon size={16} /> Mapa
      </h2>

      {/* Custom Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1f2326] border border-[#2e303a] hover:border-[#ff4655] text-white p-3 flex justify-between items-center transition-colors uppercase tracking-wider text-sm relative group"
      >
        <span className="truncate">{selectedMap ? selectedMap.displayName : 'Wybierz mapę'}</span>
        <ChevronDown size={18} className={`transition-transform duration-300 \${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f2326] border border-[#2e303a] z-50 max-h-64 overflow-y-auto custom-scrollbar shadow-2xl origin-top animate-fade-in-down rounded-b-md">
          {maps.map(map => (
            <button
              key={map.uuid}
              onClick={() => {
                setSelectedMap(map);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-[#ff4655] transition-colors border-b border-[#2e303a] last:border-b-0 text-left group"
            >
              {/* Tutaj API nie podaje zawsze dobrej ikonki malej dla map,
                  ale użyjemy displayIcon (albo listViewIcon jeśli jest, tu zakladamy displayIcon z API) */}
              <div className="w-12 h-12 bg-[#111111] overflow-hidden rounded border border-transparent group-hover:border-white transition-colors relative">
                <img
                  src={map.displayIcon}
                  alt={map.displayName}
                  className="w-full h-full object-cover scale-150"
                />
              </div>
              <span className="uppercase tracking-widest text-sm text-gray-300 group-hover:text-white font-bold">
                {map.displayName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
