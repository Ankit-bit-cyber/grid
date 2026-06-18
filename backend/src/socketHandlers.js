const state = require('./state');

// Simple per-socket rate limit for capture attempts to deter click-spam abuse.
const CAPTURE_WINDOW_MS = 1000;
const CAPTURE_MAX_PER_WINDOW = 15;
const captureBuckets = new Map(); // socketId -> { count, windowStart }

function isRateLimited(socketId) {
  const now = Date.now();
  const bucket = captureBuckets.get(socketId);
  if (!bucket || now - bucket.windowStart > CAPTURE_WINDOW_MS) {
    captureBuckets.set(socketId, { count: 1, windowStart: now });
    return false;
  }
  bucket.count += 1;
  return bucket.count > CAPTURE_MAX_PER_WINDOW;
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const requestedUserId = socket.handshake.auth && socket.handshake.auth.userId;
    const user = state.getOrCreateUser(requestedUserId);

    user.socketId = socket.id;
    user.online = true;
    state.onlineSocketIds.add(socket.id);
    socket.data.userId = user.id;

    // Send the new/returning client everything it needs to render the app.
    socket.emit('init', {
      userId: user.id,
      username: user.username,
      color: user.color,
      capturedBlocks: user.capturedBlocks,
      grid: state.getGridSnapshot(),
      gridSize: state.GRID_SIZE,
      leaderboard: state.getLeaderboard(),
      activityFeed: state.getActivityFeed(),
      onlineUsers: state.getOnlineUsersCount(),
    });

    const joinedEntry = state.pushActivity('join', `${user.username} joined the game`);
    socket.broadcast.emit('user_joined', {
      onlineUsers: state.getOnlineUsersCount(),
      activity: joinedEntry,
    });

    socket.on('capture_cell', (payload) => {
      const cellId = payload && payload.cellId;

      if (isRateLimited(socket.id)) {
        socket.emit('capture_failed', { cellId, message: 'Slow down — too many requests' });
        return;
      }

      const result = state.captureCell(user.id, cellId);

      if (!result.success) {
        socket.emit('capture_failed', { cellId, message: result.message });
        return;
      }

      const { cell } = result;

      io.emit('cell_captured', {
        cellId: cell.cellId,
        ownerId: cell.ownerId,
        ownerName: cell.ownerName,
        color: cell.color,
      });

      io.emit('leaderboard_update', { leaderboard: state.getLeaderboard() });
      io.emit('activity_update', { activity: state.getActivityFeed()[0] });

      // Let the capturing player know their own running total.
      socket.emit('stats_update', { capturedBlocks: user.capturedBlocks });
    });

    socket.on('reset_grid', () => {
      state.resetGrid();

      io.emit('grid_reset', {
        grid: state.getGridSnapshot(),
        leaderboard: state.getLeaderboard(),
        activityFeed: state.getActivityFeed(),
      });

      // Update personal stats for all connected clients since capturedBlocks is now 0.
      for (const [sId, s] of io.sockets.sockets) {
        const uId = s.data.userId;
        const u = state.users.get(uId);
        if (u) {
          s.emit('stats_update', { capturedBlocks: u.capturedBlocks });
        }
      }
    });

    socket.on('disconnect', () => {
      state.onlineSocketIds.delete(socket.id);
      user.online = false;
      captureBuckets.delete(socket.id);

      const leftEntry = state.pushActivity('leave', `${user.username} left the game`);
      io.emit('user_left', {
        onlineUsers: state.getOnlineUsersCount(),
        activity: leftEntry,
      });
    });
  });
}

module.exports = { registerSocketHandlers };
