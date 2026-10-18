const API_BASE = 'https://valorant-api.com/v1';

export interface MapData {
  uuid: string;
  displayName: string;
  displayIcon: string; // ikona mapy (canvas)
}

export interface AgentData {
  uuid: string;
  displayName: string;
  displayIcon: string;
  role: {
    displayName: string;
  } | null;
  abilities: {
    slot: string;
    displayName: string;
    displayIcon: string;
  }[];
}

export async function fetchMaps(): Promise<MapData[]> {
  try {
    const response = await fetch(`${API_BASE}/maps`);
    const data = await response.json();
    return data.data.filter((map: any) => map.displayIcon !== null);
  } catch (error) {
    console.error("Error fetching maps:", error);
    return [];
  }
}

export async function fetchAgents(): Promise<AgentData[]> {
  try {
    const response = await fetch(`${API_BASE}/agents?isPlayableCharacter=true`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}
