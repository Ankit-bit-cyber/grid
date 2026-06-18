import React, { useEffect, useState } from 'react';
import useGameStore from './store/useGameStore';
import Masthead from './components/Masthead';
import ClaimTicker from './components/ClaimTicker';
import Grid from './components/Grid';
import Leaderboard from './components/Leaderboard';
import ActivityFeed from './components/ActivityFeed';
import PlayerStats from './components/PlayerStats';

export default function App() {
  const connect = useGameStore((s) => s.connect);
  const connecting = useGameStore((s) => s.connecting);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="flex h-screen flex-col font-body">
      <Masthead onOpenDrawer={() => setDrawerOpen(true)} />
      <ClaimTicker />

      <main className="grid flex-1 gap-3 overflow-hidden p-3 sm:p-4 lg:grid-cols-[1fr_300px]">
        <div className="min-h-0">
          <Grid />
        </div>

        <div className="hidden min-h-0 flex-col gap-3 lg:flex">
          <PlayerStats />
          <div className="min-h-0 flex-1">
            <Leaderboard />
          </div>
          <div className="min-h-0 flex-1">
            <ActivityFeed />
          </div>
        </div>
      </main>

      {/* Mobile / tablet drawer: keeps the grid as the full-screen hero
          below lg, and tucks standings + stats + log behind one button. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex h-full w-[88%] max-w-sm flex-col gap-3 overflow-y-auto border-l border-line bg-base-900 p-3">
            <button
              onClick={() => setDrawerOpen(false)}
              className="self-end rounded-sm border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:text-ink"
            >
              Close
            </button>
            <PlayerStats />
            <div className="min-h-[260px]">
              <Leaderboard />
            </div>
            <div className="min-h-[260px]">
              <ActivityFeed />
            </div>
          </div>
        </div>
      )}

      {connecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/85">
          <div className="font-mono text-sm tracking-widest text-ink-muted">
            ESTABLISHING UPLINK…
          </div>
        </div>
      )}
    </div>
  );
}
