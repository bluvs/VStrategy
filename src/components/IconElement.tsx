import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface IconElementProps {
  id: string;
  x: number;
  y: number;
  url: string;
  type: 'agent' | 'ability';
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  activeTool: string;
}

export default function IconElement({
  id, x, y, url, type, isSelected, onSelect, onChange, activeTool
}: IconElementProps) {
  const [image] = useImage(url);
  const size = type === 'agent' ? 40 : 30;

  return (
    <KonvaImage
      id={id}
      image={image}
      x={x}
      y={y}
      width={size}
      height={size}
      offsetX={size / 2}
      offsetY={size / 2}
      draggable={activeTool === 'select'}
      onClick={() => {
        if (activeTool === 'select') onSelect();
      }}
      onTap={() => {
        if (activeTool === 'select') onSelect();
      }}
      onMouseEnter={(e) => {
        // Pomocnicze dla Gumki - jeśli przeciągamy i wchodzimy na element
        if (activeTool === 'eraser' && e.evt.buttons === 1) {
          // Firefake mouse move
          e.target.getStage()?.fire('mousemove', { evt: e.evt, target: e.target });
        }
      }}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      stroke={isSelected ? '#ff4655' : 'transparent'}
      strokeWidth={isSelected ? 2 : 0}
      shadowColor={isSelected ? '#ff4655' : 'black'}
      shadowBlur={isSelected ? 10 : 5}
      shadowOpacity={0.5}
      cornerRadius={type === 'agent' ? 20 : 5}
    />
  );
}
