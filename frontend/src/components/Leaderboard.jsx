import React from 'react';
import useGameStore from '../store/useGameStore';

export default function Leaderboard() {
  const leaderboard = useGameStore((s) => s.leaderboard);
  const selfId = useGameStore((s) => s.self.id);

  return (
    <div className="flex h-full flex-col rounded-md border border-line bg-base-800 shadow-panel">
      <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
        Standings
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto p-1.5">
        {leaderboard.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-xs text-ink-faint">
            No claims staked yet.
            <br />
            Stand by.
          </p>
        ) : (
          <ol>
            {leaderboard.map((entry, i) => {
              const isLeader = i < 3;
              return (
                <li
                  key={entry.id}
                  className={`flex items-center gap-3 border-b border-line/60 px-2.5 py-2 last:border-b-0 ${
                    entry.id === selfId ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <span
                    className={`w-6 shrink-0 text-right font-display text-base leading-none ${
                      isLeader ? 'text-brass' : 'text-ink-faint'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink/90">
                    {entry.username}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-muted">
                    {entry.blocks}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
