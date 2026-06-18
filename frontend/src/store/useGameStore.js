import { create } from 'zustand';
import { socket, storeUserId } from '../socket';

const useGameStore = create((set, get) => ({
  connected: false,
  connecting: true,
  gridSize: 50,
  cells: {}, // cellId -> { ownerId, ownerName, color }
  self: { id: null, username: '', color: '#888888', capturedBlocks: 0 },
  leaderboard: [],
  activityFeed: [],
  onlineUsers: 0,
  rejectedCellId: null, // briefly set so the Cell can play a "denied" shake

  connect: () => {
    if (socket.connected) return;

    socket.on('connect', () => set({ connected: true, connecting: false }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('init', (data) => {
      storeUserId(data.userId);
      socket.auth.userId = data.userId;

      const cells = {};
      data.grid.forEach((cell) => {
        cells[cell.cellId] = {
          ownerId: cell.ownerId,
          ownerName: cell.ownerName,
          color: cell.color,
        };
      });

      set({
        gridSize: data.gridSize,
        cells,
        self: {
          id: data.userId,
          username: data.username,
          color: data.color,
          capturedBlocks: data.capturedBlocks,
        },
        leaderboard: data.leaderboard,
        activityFeed: data.activityFeed,
        onlineUsers: data.onlineUsers,
        connecting: false,
        connected: true,
      });
    });

    socket.on('cell_captured', ({ cellId, ownerId, ownerName, color }) => {
      set((state) => ({
        cells: {
          ...state.cells,
          [cellId]: { ownerId, ownerName, color },
        },
      }));
    });

    socket.on('capture_failed', ({ cellId }) => {
      set({ rejectedCellId: cellId });
      setTimeout(() => {
        if (get().rejectedCellId === cellId) set({ rejectedCellId: null });
      }, 400);
    });

    socket.on('leaderboard_update', ({ leaderboard }) => set({ leaderboard }));

    socket.on('activity_update', ({ activity }) => {
      set((state) => ({
        activityFeed: [activity, ...state.activityFeed].slice(0, 30),
      }));
    });

    socket.on('stats_update', ({ capturedBlocks }) => {
      set((state) => ({ self: { ...state.self, capturedBlocks } }));
    });

    socket.on('user_joined', ({ onlineUsers, activity }) => {
      set((state) => ({
        onlineUsers,
        activityFeed: activity ? [activity, ...state.activityFeed].slice(0, 30) : state.activityFeed,
      }));
    });

    socket.on('user_left', ({ onlineUsers, activity }) => {
      set((state) => ({
        onlineUsers,
        activityFeed: activity ? [activity, ...state.activityFeed].slice(0, 30) : state.activityFeed,
      }));
    });

    socket.connect();
  },

  captureCell: (cellId) => {
    const cell = get().cells[cellId];
    if (cell && cell.ownerId) return; // already claimed, don't bother the server
    socket.emit('capture_cell', { cellId });
  },
}));

export default useGameStore;
