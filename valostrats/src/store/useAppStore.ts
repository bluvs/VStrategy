import { create } from 'zustand';
import type { MapData, AgentData } from '../api/valorantApi';

export type ToolType = 'select' | 'draw' | 'line' | 'arrow' | 'eraser';

interface AppState {
  maps: MapData[];
  agents: AgentData[];
  selectedMap: MapData | null;
  selectedAgent: AgentData | null;
  activeTool: ToolType;
  drawColor: string;
  setMaps: (maps: MapData[]) => void;
  setAgents: (agents: AgentData[]) => void;
  setSelectedMap: (map: MapData | null) => void;
  setSelectedAgent: (agent: AgentData | null) => void;
  setActiveTool: (tool: ToolType) => void;
  setDrawColor: (color: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  maps: [],
  agents: [],
  selectedMap: null,
  selectedAgent: null,
  activeTool: 'select',
  drawColor: '#ff4655', // domyślny czerwony z Valoranta

  setMaps: (maps) => set({ maps }),
  setAgents: (agents) => set({ agents }),
  setSelectedMap: (map) => set({ selectedMap: map }),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setDrawColor: (color) => set({ drawColor: color }),
}));
