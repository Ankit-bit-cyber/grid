# GridWars — Real-Time Shared Territory Capture

A live multiplayer web app where anyone who opens the page can click cells on a shared 50×50 grid to claim them. Every capture is broadcast instantly to every connected player via WebSockets — no refreshing, no accounts.

Built from the attached PRD as a runnable MVP:

- Anonymous users (random callsign + color, no signup)
- Real-time grid sync over Socket.IO
- Server-authoritative conflict resolution (first click wins, no duplicate ownership)
- Live leaderboard, online-player counter, and activity feed
- Responsive HUD-styled UI with zoom/pan on the grid

## One important implementation note

The PRD's recommended stack (PostgreSQL + Prisma + Redis) is built for horizontal scaling across multiple server instances. For an MVP you can run with one command, this build instead keeps all state **in memory on the Node server** — no database to install or configure. Everything in the PRD's functional spec works exactly as described; the difference is purely about persistence:

- State resets if you restart the backend process.
- It will only scale to one server instance (fine for well past the PRD's 100+ concurrent user target on a single process).

The "Scaling up" section at the bottom explains exactly what to swap in to match the PRD's full production architecture.

---

## Project structure

```
gridwars/
├── backend/                 Node.js + Express + Socket.IO server
│   ├── server.js             Entry point
│   └── src/
│       ├── state.js          Grid/user/leaderboard state + capture logic
│       ├── socketHandlers.js Real-time event wiring
│       ├── routes/api.js     REST endpoints (grid/leaderboard snapshots)
│       └── utils/            Username + color generators
│
└── frontend/                 React 18 + Vite + Tailwind + Zustand
    └── src/
        ├── App.jsx
        ├── socket.js          Socket.IO client
        ├── store/useGameStore.js   All real-time state
        └── components/        Header, Grid, Leaderboard, ActivityFeed, PlayerStats
```

---

## How to run it

You need **Node.js 18+** installed. Two terminal windows: one for the backend, one for the frontend.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

This starts the server at **http://localhost:5000**. You should see:
```
GridWars backend listening on http://localhost:5000
```

(`npm run dev` uses nodemon for auto-restart on changes. Use `npm start` for a plain run.)

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the app at **http://localhost:5173**. Open it in your browser — you'll be assigned a random callsign and color immediately.

### 3. Test the real-time part

Open `http://localhost:5173` in two (or more) browser tabs or windows side by side. Click a cell in one tab and watch it light up instantly in the other. Try clicking the same cell from two tabs at nearly the same moment — only one will win, and the other gets a quick red "denied" flash.

---

## Production build

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
npm run preview    # serve the production build locally to sanity-check it
```

Deploy `frontend/dist` to any static host (Vercel, Netlify, etc.) and run the backend wherever you like (Railway, Render, Fly.io, a VPS). Set `VITE_SERVER_URL` (frontend) and `CLIENT_ORIGIN` (backend) env vars to point at each other's real URLs in production.

---

## Environment variables

**backend/.env**
```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
GRID_SIZE=50
```

**frontend/.env**
```
VITE_SERVER_URL=http://localhost:5000
```

---

## Troubleshooting: "blocked by CORS policy" / 403 on `/socket.io/`

This happens when the browser's actual origin doesn't match what the backend allows — most often because you're on `http://127.0.0.1:5173` instead of `http://localhost:5173`, or Vite silently started on a different port (5174, 5175, ...) because 5173 was already taken. The server now accepts any `localhost`/`127.0.0.1` origin regardless of port automatically, so a fresh `npm install` of this version of the backend resolves it.

If you still see it:
1. Check the backend's terminal output on startup — it logs exactly which origins it's allowing.
2. Check Vite's terminal output for the actual port it's running on (`Local: http://localhost:XXXX/`) and make sure that's the URL you opened in the browser.
3. Make sure you ran `cp .env.example .env` in **both** `backend/` and `frontend/` before starting them.
4. If you're deploying to a real domain (not localhost), set `CLIENT_ORIGIN` in the backend to your exact frontend URL, including the protocol (`https://yourapp.vercel.app`).

---

## What's implemented vs. the PRD

| PRD section | Status |
|---|---|
| Anonymous user creation | ✅ random callsign + color on connect, persisted in `localStorage` so a refresh keeps your identity and block count |
| 50×50 grid, capture flow | ✅ |
| Real-time sync (Socket.IO) | ✅ |
| Conflict resolution | ✅ server-authoritative, single-threaded event loop guarantees no double-ownership |
| Online users counter | ✅ live count |
| Leaderboard (top 10) | ✅ updates on every capture |
| Activity feed | ✅ join/leave/capture events, last 30 kept |
| Rate limiting / abuse prevention | ✅ basic per-socket capture rate limit + REST rate limiting |
| Mobile responsive, zoom/pan | ✅ zoom buttons + drag-to-pan + native touch scroll |
| PostgreSQL / Prisma / Redis | ⏭️ not included — see "Scaling up" below |
| Cooldowns, territory stealing, chat, achievements | ⏭️ explicitly out of MVP scope per the PRD |

---

## Scaling up to the PRD's full architecture

If you outgrow a single in-memory server, here's the direct mapping from this codebase to the PRD's recommended stack:

1. **PostgreSQL + Prisma** — replace the `Map()`s in `backend/src/state.js` with Prisma models matching the PRD's `users` and `cells` tables. The function signatures (`getOrCreateUser`, `captureCell`, `getLeaderboard`, etc.) are already isolated in one file, so the rest of the app doesn't need to change.
2. **Redis Pub/Sub** — once you run more than one backend instance, swap Socket.IO's default in-memory adapter for `@socket.io/redis-adapter` so `io.emit(...)` broadcasts across all instances, and use Redis to share the rate-limit buckets.
3. **Persistence on restart** — with Postgres in place, `getGridSnapshot()` and `getLeaderboard()` just become DB queries instead of in-memory reads.

Everything else — the socket event contracts, the REST routes, and the entire frontend — stays the same.
