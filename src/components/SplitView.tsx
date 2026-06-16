import { Fragment, useState, useRef, useEffect, ReactNode, PointerEvent as ReactPointerEvent } from 'react';

interface SplitViewProps {
  panes: ReactNode[];
}

export default function SplitView({ panes }: SplitViewProps) {
  const [widths, setWidths] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<number | null>(null);

  // Initialize widths equally when the number of panes changes
  useEffect(() => {
    setWidths(panes.map(() => 100 / panes.length));
  }, [panes.length]);

  const handlePointerDown = (e: ReactPointerEvent, index: number) => {
    isResizing.current = index;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startWidths = [...widths];

    const handlePointerMove = (ev: PointerEvent) => {
      if (isResizing.current === null || !containerRef.current) return;
      const idx = isResizing.current;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = ev.clientX - containerRect.left;
      
      let prevWidthsSum = 0;
      for (let i = 0; i < idx; i++) prevWidthsSum += startWidths[i];
      
      const availableWidth = startWidths[idx] + startWidths[idx + 1];
      const mousePercent = (mouseX / containerRect.width) * 100;
      
      let newWidthLeft = mousePercent - prevWidthsSum;
      let newWidthRight = availableWidth - newWidthLeft;
      
      const MIN_WIDTH = 10;
      if (newWidthLeft < MIN_WIDTH) {
        newWidthLeft = MIN_WIDTH;
        newWidthRight = availableWidth - MIN_WIDTH;
      }
      if (newWidthRight < MIN_WIDTH) {
        newWidthRight = MIN_WIDTH;
        newWidthLeft = availableWidth - MIN_WIDTH;
      }
      
      setWidths(prev => {
        const newWidths = [...prev];
        newWidths[idx] = newWidthLeft;
        newWidths[idx + 1] = newWidthRight;
        return newWidths;
      });
    };

    const handlePointerUp = () => {
      isResizing.current = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Prevent render before widths are initialized
  if (widths.length !== panes.length) return null;

  return (
    <div className="split-view-container" ref={containerRef}>
      {panes.map((pane, index) => (
        <Fragment key={index}>
          <div className="split-pane" style={{ width: `${widths[index]}%` }}>
            {pane}
          </div>
          {index < panes.length - 1 && (
            <div 
              className="resizer-bar" 
              onPointerDown={(e) => handlePointerDown(e, index)}
            ></div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
