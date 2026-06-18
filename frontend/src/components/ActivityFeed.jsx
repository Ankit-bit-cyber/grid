import React from 'react';
import useGameStore from '../store/useGameStore';

function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return 'now';
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h`;
}

const TYPE_DOT = {
  capture: 'bg-brass',
  join: 'bg-emerald-400/70',
  leave: 'bg-ink-faint',
  system: 'bg-brick',
};

export default function ActivityFeed() {
  const activityFeed = useGameStore((s) => s.activityFeed);

  return (
    <div className="flex h-full flex-col rounded-md border border-line bg-base-800 shadow-panel">
      <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
        Dispatch log
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto p-1.5">
        {activityFeed.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-xs text-ink-faint">
            Channel quiet. Waiting for action.
          </p>
        ) : (
          <ul>
            {activityFeed.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 border-b border-line/40 px-2 py-1.5 last:border-b-0"
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    TYPE_DOT[item.type] || 'bg-ink-faint'
                  }`}
                />
                <span className="min-w-0 flex-1 font-mono text-[12px] leading-snug text-ink-muted">
                  {item.message}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                  {timeAgo(item.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
