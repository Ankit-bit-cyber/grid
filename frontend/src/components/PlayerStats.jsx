import React from 'react';
import useGameStore from '../store/useGameStore';

export default function PlayerStats() {
  const self = useGameStore((s) => s.self);

  return (
    <div className="rounded-md border border-line bg-base-800 p-4 shadow-panel">
      <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
        Your claim
      </div>
      <div className="flex items-center gap-3">
        <span
          className="h-10 w-10 shrink-0 rounded-sm"
          style={{ backgroundColor: self.color, boxShadow: `0 0 16px -3px ${self.color}` }}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-bold leading-tight text-ink">
            {self.username || '—'}
          </div>
          <div className="font-mono text-xs text-ink-muted">
            {self.capturedBlocks} block{self.capturedBlocks === 1 ? '' : 's'} held
          </div>
        </div>
        <div className="shrink-0 font-display text-3xl font-extrabold leading-none text-ink/90">
          {self.capturedBlocks}
        </div>
      </div>
    </div>
  );
}
