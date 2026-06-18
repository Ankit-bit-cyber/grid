import React from 'react';
import useGameStore from '../store/useGameStore';

const TYPE_DOT = {
  capture: 'bg-brass',
  join: 'bg-emerald-400/70',
  leave: 'bg-ink-faint',
};

export default function ClaimTicker() {
  const activityFeed = useGameStore((s) => s.activityFeed);

  if (activityFeed.length === 0) {
    return (
      <div className="border-b border-line bg-base-800 px-4 py-2">
        <span className="font-mono text-[11px] text-ink-faint">
          No claims staked yet — be the first.
        </span>
      </div>
    );
  }

  // Render the same sequence twice back to back so the CSS animation can
  // loop seamlessly (see .ticker-track in index.css).
  const items = activityFeed.slice(0, 16);
  const renderItems = (keyPrefix) =>
    items.map((item, i) => (
      <span
        key={`${keyPrefix}-${item.id}`}
        className="flex items-center gap-2 whitespace-nowrap px-4 font-mono text-[12px] text-ink-muted"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT[item.type] || 'bg-ink-faint'}`} />
        {item.message}
        {i < items.length - 1 && <span className="ml-4 text-line">/</span>}
      </span>
    ));

  // The marquee moves a percentage of its own (content-dependent) width per
  // loop, so a fixed duration would speed up as more claims arrive and the
  // list grows. Scaling duration with item count keeps the pace steady and
  // slow regardless of how busy the feed gets. Raise SECONDS_PER_ITEM for
  // an even slower crawl.
  const SECONDS_PER_ITEM = 6.5;
  const MIN_DURATION_SECONDS = 26;
  const duration = Math.max(items.length * SECONDS_PER_ITEM, MIN_DURATION_SECONDS);

  return (
    <div className="overflow-hidden border-b border-line bg-base-800 py-2">
      <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
        {renderItems('a')}
        {renderItems('b')}
      </div>
    </div>
  );
}