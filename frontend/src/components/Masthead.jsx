import React from 'react';
import useGameStore from '../store/useGameStore';

export default function Masthead({ onOpenDrawer }) {
  const onlineUsers = useGameStore((s) => s.onlineUsers);
  const connected = useGameStore((s) => s.connected);
  const self = useGameStore((s) => s.self);

  return (
    <header className="flex items-center justify-between border-b border-line bg-base-900 px-4 py-2.5 sm:px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-extrabold leading-none tracking-tight text-ink sm:text-3xl">
          GRIDWARS
        </h1>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-brass' : 'bg-ink-faint'}`}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
            {connected ? `${onlineUsers} live` : 'connecting'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: self.color }}
          />
          <span className="font-mono text-xs text-ink-muted">{self.username || '—'}</span>
        </div>
        <button
          onClick={onOpenDrawer}
          className="rounded-sm border border-line bg-base-800 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:border-brass/40 hover:text-ink lg:hidden"
        >
          Standings
        </button>
      </div>
    </header>
  );
}
