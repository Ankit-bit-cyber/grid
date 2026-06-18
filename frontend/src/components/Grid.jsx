import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import useGameStore from '../store/useGameStore';

const CELL_SIZE = 15; // px, at zoom = 1
const UNCLAIMED_COLOR = '#242830';
const RULER_STEP = 5;

export default function Grid() {
  const gridSize = useGameStore((s) => s.gridSize);
  const cells = useGameStore((s) => s.cells);
  const rejectedCellId = useGameStore((s) => s.rejectedCellId);
  const captureCell = useGameStore((s) => s.captureCell);

  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState(null); // { cellId, x, y }
  const [stamps, setStamps] = useState([]); // { id, row, col, color }

  const scrollRef = useRef(null);
  const dragRef = useRef(null);
  const prevCellsRef = useRef({});

  const indices = useMemo(() => Array.from({ length: gridSize }, (_, i) => i), [gridSize]);
  const boardPx = gridSize * CELL_SIZE;

  useEffect(() => {
    const prev = prevCellsRef.current;
    const newlyCaptured = [];
    for (const cellId of Object.keys(cells)) {
      if (cells[cellId].ownerId && !prev[cellId]?.ownerId) {
        const [row, col] = cellId.split('-').map(Number);
        newlyCaptured.push({
          id: `${cellId}-${Date.now()}`,
          row,
          col,
          color: cells[cellId].color,
        });
      }
    }
    if (newlyCaptured.length) {
      setStamps((p) => [...p, ...newlyCaptured]);
      newlyCaptured.forEach((p) => {
        setTimeout(() => {
          setStamps((cur) => cur.filter((x) => x.id !== p.id));
        }, 520);
      });
    }
    prevCellsRef.current = cells;
  }, [cells]);

  const handleGridClick = useCallback(
    (e) => {
      const cellId = e.target?.dataset?.cellId;
      if (cellId) captureCell(cellId);
    },
    [captureCell]
  );

  const handleGridMove = useCallback((e) => {
    const cellId = e.target?.dataset?.cellId;
    if (!cellId) {
      setHovered(null);
      return;
    }
    setHovered({ cellId, x: e.clientX, y: e.clientY });
  }, []);

  const onPointerDown = (e) => {
    if (e.target.dataset?.cellId) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
    scrollRef.current.scrollTop = dragRef.current.scrollTop - dy;
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const hoveredCell = hovered ? cells[hovered.cellId] : null;
  const claimedCount = Object.keys(cells).length;
  const totalCount = gridSize * gridSize;

  return (
    <div className="relative flex h-full flex-col rounded-md border border-line bg-base-800 shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
            Claims board
          </span>
          <span className="font-mono text-[11px] text-ink-faint">
            {claimedCount.toLocaleString()} / {totalCount.toLocaleString()} staked
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
            className="h-6 w-6 rounded-sm border border-line text-ink-muted hover:border-brass/40 hover:text-ink"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-ink-faint">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            className="h-6 w-6 rounded-sm border border-line text-ink-muted hover:border-brass/40 hover:text-ink"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="panel-scroll relative flex-1 overflow-auto p-3 [touch-action:pan-x_pan-y]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          style={{
            width: boardPx + 28,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="flex">
            <div style={{ width: 28 }} />
            <div className="relative" style={{ width: boardPx, height: 14 }}>
              {indices
                .filter((i) => i % RULER_STEP === 0)
                .map((i) => (
                  <span
                    key={`c${i}`}
                    className="absolute font-mono text-[8px] text-ink-faint"
                    style={{ left: i * CELL_SIZE }}
                  >
                    {i}
                  </span>
                ))}
            </div>
          </div>

          <div className="flex">
            <div className="relative" style={{ width: 28, height: boardPx }}>
              {indices
                .filter((i) => i % RULER_STEP === 0)
                .map((i) => (
                  <span
                    key={`r${i}`}
                    className="absolute font-mono text-[8px] text-ink-faint"
                    style={{ top: i * CELL_SIZE }}
                  >
                    {i}
                  </span>
                ))}
            </div>

            <div
              className="relative select-none"
              style={{ width: boardPx, height: boardPx }}
              onClick={handleGridClick}
              onMouseMove={handleGridMove}
              onMouseLeave={() => setHovered(null)}
            >
              {indices.map((row) =>
                indices.map((col) => {
                  const cellId = `${row}-${col}`;
                  const cell = cells[cellId];
                  const isRejected = rejectedCellId === cellId;
                  return (
                    <div
                      key={cellId}
                      data-cell-id={cellId}
                      className={`absolute transition-[filter] duration-100 hover:brightness-125 ${
                        isRejected ? 'animate-deny' : ''
                      }`}
                      style={{
                        left: col * CELL_SIZE,
                        top: row * CELL_SIZE,
                        width: CELL_SIZE - 1,
                        height: CELL_SIZE - 1,
                        backgroundColor: isRejected
                          ? '#E2554A66'
                          : cell?.color || UNCLAIMED_COLOR,
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.035)',
                        cursor: cell?.ownerId ? 'default' : 'crosshair',
                      }}
                    />
                  );
                })
              )}

              {stamps.map((p) => (
                <div
                  key={p.id}
                  className="pointer-events-none absolute animate-stamp rounded-[2px]"
                  style={{
                    left: p.col * CELL_SIZE - 2,
                    top: p.row * CELL_SIZE - 2,
                    width: CELL_SIZE + 3,
                    height: CELL_SIZE + 3,
                    border: `1.5px solid ${p.color}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {hovered && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded-sm border border-line bg-base-900 px-2 py-1 font-mono text-[11px] text-ink-muted shadow-panel"
          style={{ left: hovered.x + 14, top: hovered.y + 14 }}
        >
          <span className="text-brass">+</span>
          {hovered.cellId}
          <span className="text-ink-faint">
            {hoveredCell?.ownerName ? `· ${hoveredCell.ownerName}` : '· open'}
          </span>
        </div>
      )}
    </div>
  );
}
