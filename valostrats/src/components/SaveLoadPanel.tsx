import { Download, Upload, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// Custom event dla CanvasMap
export const SAVE_EVENT = 'save_strats';
export const LOAD_EVENT = 'load_strats';
export const CLEAR_EVENT = 'clear_strats';

export default function SaveLoadPanel() {
  const { setSelectedMap, maps } = useAppStore();

  const handleSave = () => {
    document.dispatchEvent(new CustomEvent(SAVE_EVENT));
  };

  const handleClear = () => {
    if (confirm("Czy na pewno chcesz wyczyścić całą mapę?")) {
      document.dispatchEvent(new CustomEvent(CLEAR_EVENT));
    }
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          // Formatowanie pliku: [mapUuid]\n[base64Data]
          const [mapId, base64Data] = content.split('\n');

          if (mapId && base64Data) {
             const decoded = atob(base64Data);
             const parsedData = JSON.parse(decoded);

             // Zmień mapę
             const mapToLoad = maps.find(m => m.uuid === mapId);
             if (mapToLoad) {
               setSelectedMap(mapToLoad);
             }

             // Wyślij event z danymi do CanvasMap
             setTimeout(() => {
               document.dispatchEvent(new CustomEvent(LOAD_EVENT, { detail: parsedData }));
             }, 500); // Małe opóźnienie na przeładowanie mapy
          }
        } catch (error) {
          console.error("Parse error:", error);
          alert('Błąd podczas ładowania pliku strategii!');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="absolute top-4 right-4 bg-[#111111] border border-[#2e303a] p-2 flex gap-2 rounded-lg shadow-xl z-20">
      <button
        onClick={handleSave}
        className="p-3 bg-[#1f2326] text-gray-400 hover:bg-[#ff4655] hover:text-white transition-colors rounded"
        title="Zapisz strategię"
      >
        <Download size={20} />
      </button>
      <button
        onClick={handleLoad}
        className="p-3 bg-[#1f2326] text-gray-400 hover:bg-[#ff4655] hover:text-white transition-colors rounded"
        title="Wczytaj strategię"
      >
        <Upload size={20} />
      </button>
      <button
        onClick={handleClear}
        className="p-3 bg-[#1f2326] text-gray-400 hover:bg-red-700 hover:text-white transition-colors rounded"
        title="Wyczyść mapę"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
