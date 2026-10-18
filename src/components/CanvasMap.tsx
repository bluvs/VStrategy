import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Arrow } from 'react-konva';
import { useAppStore } from '../store/useAppStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import IconElement from './IconElement';

export interface DrawingElement {
  id: string;
  type: 'draw' | 'line' | 'arrow';
  points: number[];
  color: string;
}

export interface IconData {
  id: string;
  type: 'agent' | 'ability';
  url: string;
  x: number;
  y: number;
}

interface CanvasMapProps {
  width: number;
  height: number;
}

export default function CanvasMap({ width, height }: CanvasMapProps) {
  const { activeTool, drawColor } = useAppStore();
  const { ws, broadcastData } = useMultiplayerStore();

  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);

  // Ref dla flagi by zapobiec pętli nieskończonej WebSocketu
  const isRemoteUpdate = useRef(false);

  // Nasłuchiwanie WebSocketa
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Obsługa pełnej synchronizacji po dołączeniu do pokoju
        if (data.type === 'room_joined') {
           if (data.state) {
             isRemoteUpdate.current = true;
             if (data.state.elements) setElements(data.state.elements);
             if (data.state.icons) setIcons(data.state.icons);
           }
        }

        // Obsługa regularnych aktualizacji rysowania w trakcie gry
        if (data.type === 'sync_state') {
          isRemoteUpdate.current = true; // Zaznaczamy że to zdalny update
          if (data.payload.elements) setElements(data.payload.elements);
          if (data.payload.icons) setIcons(data.payload.icons);
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  // Synchronizacja przy zmianach (tylko naszych lokalnych)
  useEffect(() => {
    if (isRemoteUpdate.current) {
      // Był to update zdalny, zdejmujemy flage i NIE wysyłamy na zewnątrz
      isRemoteUpdate.current = false;
      return;
    }

    if (ws && !isDrawing) {
      // Wysyłamy aktualny stan na serwer by serwer go zapisał dla nowych i rozesłał jako 'sync_state'
      broadcastData('update_state', { elements, icons });
    }
  }, [elements, icons, isDrawing, ws, broadcastData]);


  const handleMouseDown = (e: any) => {
    // Odznaczanie elementów
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }

    if (activeTool === 'select') return;

    // Rozpoczęcie działania narzędzi (w tym gumki jako ciągłego aktywatora)
    setIsDrawing(true);

    if (activeTool === 'eraser') {
      const targetId = e.target.attrs?.id;
      if (targetId) {
         setIcons(prev => prev.filter(icon => icon.id !== targetId));
         setElements(prev => prev.filter(el => el.id !== targetId));
      }
      return;
    }

    const pos = e.target.getStage().getPointerPosition();

    setElements([...elements, {
      id: Date.now().toString(),
      type: activeTool as 'draw' | 'line' | 'arrow',
      points: [pos.x, pos.y],
      color: drawColor
    }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    // Obsługa ciągłego usuwania w trakcie przeciągania
    if (activeTool === 'eraser') {
      const targetId = e.target.attrs?.id;
      if (targetId) {
         setIcons(prev => prev.filter(icon => icon.id !== targetId));
         setElements(prev => prev.filter(el => el.id !== targetId));
      }
      return;
    }

    if (activeTool === 'select') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setElements(prevElements => {
      if (prevElements.length === 0) return prevElements;

      const lastElement = { ...prevElements[prevElements.length - 1] };

      if (lastElement.type === 'draw') {
        lastElement.points = [...lastElement.points, point.x, point.y];
      } else {
        // Zastępujemy drugi punkt dla linii/strzałki
        lastElement.points = [lastElement.points[0], lastElement.points[1], point.x, point.y];
      }

      const newElements = [...prevElements];
      newElements[newElements.length - 1] = lastElement;
      return newElements;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Obsługa drop event z drag & drop (z paska bocznego)
  useEffect(() => {
    const container = stageRef.current?.container();
    if (!container) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!stageRef.current) return;

      stageRef.current.setPointersPositions(e);
      const pos = stageRef.current.getPointerPosition();

      const type = e.dataTransfer?.getData('type') as 'agent' | 'ability';
      const url = e.dataTransfer?.getData('url');

      if (pos && type && url) {
        setIcons(prev => [...prev, {
          id: Date.now().toString(),
          type,
          url,
          x: pos.x,
          y: pos.y
        }]);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragover', handleDragOver);

    return () => {
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  // Obsługa eventów zapisu, odczytu i czyszczenia
  useEffect(() => {
    const handleSave = () => {
      const state = {
        elements,
        icons
      };

      const jsonStr = JSON.stringify(state);
      const base64Data = btoa(jsonStr);

      // Tworzenie pliku .txt
      const mapId = useAppStore.getState().selectedMap?.uuid;
      const fileContent = `${mapId}\n${base64Data}`;

      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `valostrats-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setElements(customEvent.detail.elements || []);
        setIcons(customEvent.detail.icons || []);
      }
    };

    const handleClear = () => {
      setElements([]);
      setIcons([]);
      setSelectedId(null);
    };

    document.addEventListener('save_strats', handleSave);
    document.addEventListener('load_strats', handleLoad);
    document.addEventListener('clear_strats', handleClear);

    return () => {
      document.removeEventListener('save_strats', handleSave);
      document.removeEventListener('load_strats', handleLoad);
      document.removeEventListener('clear_strats', handleClear);
    };
  }, [elements, icons]);

  // Usuwanie wybranych elementów klawiszem Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        setIcons(prev => prev.filter(icon => icon.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);


  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      ref={stageRef}
      className={`absolute inset-0 z-10 \${
        activeTool === 'eraser' ? 'cursor-not-allowed' : activeTool !== 'select' ? 'cursor-crosshair' : ''
      }`}
    >
      <Layer>
        {elements.map((el) => {
          if (el.type === 'draw' || el.type === 'line') {
            return (
              <Line
                key={el.id}
                id={el.id}
                points={el.points}
                stroke={el.color}
                strokeWidth={3}
                tension={el.type === 'draw' ? 0.5 : 0}
                lineCap="round"
                lineJoin="round"
              />
            );
          } else if (el.type === 'arrow') {
            return (
              <Arrow
                key={el.id}
                id={el.id}
                points={el.points}
                stroke={el.color}
                fill={el.color}
                strokeWidth={3}
                pointerLength={10}
                pointerWidth={10}
              />
            );
          }
          return null;
        })}
        {icons.map((icon) => (
          <IconElement
            key={icon.id}
            {...icon}
            id={icon.id}
            isSelected={icon.id === selectedId}
            onSelect={() => setSelectedId(icon.id)}
            activeTool={activeTool}
            onChange={(newAttrs) => {
              setIcons(prev => prev.map(i => i.id === icon.id ? { ...i, ...newAttrs } : i));
            }}
          />
        ))}
      </Layer>
    </Stage>
  );
}
