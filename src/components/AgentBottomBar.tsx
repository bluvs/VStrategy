import { useAppStore } from '../store/useAppStore';

export default function AgentBottomBar() {
  const { agents, selectedAgent, setSelectedAgent } = useAppStore();

  return (
    <div className="absolute bottom-0 left-80 right-0 h-24 bg-[#111111] border-t border-[#2e303a] flex items-end justify-center z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">

      {/* Menu Umiejętności wybranego agenta (wysuwane do góry) */}
      {selectedAgent && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#1f2326] border border-[#2e303a] border-b-0 p-3 rounded-t-lg flex gap-4 animate-fade-in-up">
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('type', 'agent');
              e.dataTransfer.setData('url', selectedAgent.displayIcon);
            }}
            className="flex items-center justify-center cursor-grab hover:bg-[#2e303a] p-2 rounded transition-colors"
            title={selectedAgent.displayName}
          >
            <img src={selectedAgent.displayIcon} alt={selectedAgent.displayName} className="w-12 h-12 object-contain" />
          </div>

          <div className="w-px bg-[#2e303a] mx-2"></div>

          {selectedAgent.abilities.filter(a => a.displayIcon).map((ability, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('type', 'ability');
                e.dataTransfer.setData('url', ability.displayIcon);
              }}
              className="flex items-center justify-center cursor-grab hover:bg-[#2e303a] p-2 rounded transition-colors border border-[#2e303a] bg-[#111111]"
              title={ability.displayName}
            >
              <img src={ability.displayIcon} alt={ability.displayName} className="w-10 h-10 object-contain filter invert opacity-80" />
            </div>
          ))}
        </div>
      )}

      {/* Główny pasek portretów */}
      <div
        className="flex gap-1 p-2 overflow-x-auto w-full justify-start items-end custom-horizontal-scrollbar scroll-smooth"
        onWheel={(e) => {
          // Zamiana przewijania pionowego (rolka) na poziome, jeśli używamy myszki
          const container = e.currentTarget;
          if (e.deltaY !== 0) {
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        {agents.map(agent => (
          <button
            key={agent.uuid}
            onClick={() => setSelectedAgent(selectedAgent?.uuid === agent.uuid ? null : agent)}
            className={`relative group flex-shrink-0 transition-all duration-200 ease-out ${
              selectedAgent?.uuid === agent.uuid
                ? 'w-16 h-20 -translate-y-2'
                : 'w-12 h-16 hover:h-20 hover:-translate-y-2 grayscale hover:grayscale-0'
            }`}
          >
            <div className={`absolute inset-0 border-2 ${
              selectedAgent?.uuid === agent.uuid ? 'border-[#ff4655] bg-[#ff4655]/10' : 'border-[#2e303a] bg-[#1f2326]'
            }`}>
               <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover" />
            </div>

            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
              {agent.displayName}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
