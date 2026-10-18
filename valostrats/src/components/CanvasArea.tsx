import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import CanvasMap from './CanvasMap';
import SaveLoadPanel from './SaveLoadPanel';
import MultiplayerPanel from './MultiplayerPanel';

export default function CanvasArea() {
  const { selectedMap } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Obliczamy rozmiar, żeby zachować proporcje 1:1, max 90% rodzica
        const { clientWidth, clientHeight } = containerRef.current;
        const size = Math.min(clientWidth, clientHeight) * 0.9;
        setDimensions({ width: size, height: size });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 bg-[#0f1923] relative flex items-center justify-center overflow-hidden">
      {/* Tło przypominające siatkę z Valoranta */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <MultiplayerPanel />
      <SaveLoadPanel />

      {selectedMap ? (
        <div
          className="relative bg-[#111111] border border-[#2e303a] shadow-2xl"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {/* Mapa tła */}
          <img
            src={selectedMap.displayIcon}
            alt={selectedMap.displayName}
            className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none z-0"
          />

          <CanvasMap width={dimensions.width} height={dimensions.height} />
        </div>
      ) : (
        <div className="text-gray-500 uppercase tracking-widest animate-pulse">Ładowanie mapy...</div>
      )}
    </div>
  );
}