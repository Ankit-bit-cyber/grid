const { v4: uuidv4 } = require('uuid');
const { generateUsername } = require('./utils/usernames');
const { generateColor } = require('./utils/colors');

const GRID_SIZE = parseInt(process.env.GRID_SIZE || '50', 10);
const MAX_ACTIVITY_ITEMS = 30;
const LEADERBOARD_SIZE = 10;

// --- Grid state -------------------------------------------------------
// cellId format: "row-col" e.g. "10-15"
const grid = new Map();

function initGrid() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cellId = `${row}-${col}`;
      grid.set(cellId, {
        cellId,
        ownerId: null,
        ownerName: null,
        color: null,
        capturedAt: null,
      });
    }
  }
}
initGrid();

function getGridSnapshot() {
  // Only send claimed cells to keep payload small; client assumes
  // everything else is unclaimed.
  const claimed = [];
  for (const cell of grid.values()) {
    if (cell.ownerId) claimed.push(cell);
  }
  return claimed;
}

function isValidCellId(cellId) {
  if (typeof cellId !== 'string') return false;
  const match = /^(\d+)-(\d+)$/.exec(cellId);
  if (!match) return false;
  const row = parseInt(match[1], 10);
  const col = parseInt(match[2], 10);
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

// --- User state ---------------------------------------------------------
// userId -> { id, username, color, capturedBlocks, socketId, online, connectedAt }
const users = new Map();
// active socket ids, used for the online counter
const onlineSocketIds = new Set();

function createUser() {
  const id = uuidv4();
  const user = {
    id,
    username: generateUsername(),
    color: generateColor(),
    capturedBlocks: 0,
    socketId: null,
    online: false,
    connectedAt: Date.now(),
  };
  users.set(id, user);
  return user;
}

function getOrCreateUser(userId) {
  if (userId && users.has(userId)) {
    return users.get(userId);
  }
  return createUser();
}

function getOnlineUsersCount() {
  return onlineSocketIds.size;
}

// --- Activity feed -------------------------------------------------------
const activityFeed = [];

function pushActivity(type, message) {
  const entry = {
    id: uuidv4(),
    type,
    message,
    timestamp: Date.now(),
  };
  activityFeed.unshift(entry);
  if (activityFeed.length > MAX_ACTIVITY_ITEMS) {
    activityFeed.length = MAX_ACTIVITY_ITEMS;
  }
  return entry;
}

function getActivityFeed() {
  return activityFeed;
}

// --- Leaderboard -----------------------------------------------------
function getLeaderboard() {
  return [...users.values()]
    .filter((u) => u.capturedBlocks > 0)
    .sort((a, b) => b.capturedBlocks - a.capturedBlocks)
    .slice(0, LEADERBOARD_SIZE)
    .map((u) => ({
      id: u.id,
      username: u.username,
      color: u.color,
      blocks: u.capturedBlocks,
    }));
}

// --- Capture logic -----------------------------------------------------
// Node's event loop is single-threaded, so as long as this function makes
// no awaits between the read-check and the write, two simultaneous
// capture_cell events can never both succeed on the same cell. The first
// one processed always wins; the second is rejected below.
function captureCell(userId, cellId) {
  if (!isValidCellId(cellId)) {
    return { success: false, message: 'Invalid cell id' };
  }
  const user = users.get(userId);
  if (!user) {
    return { success: false, message: 'Unknown user' };
  }
  const cell = grid.get(cellId);
  if (!cell) {
    return { success: false, message: 'Cell does not exist' };
  }
  if (cell.ownerId) {
    return { success: false, message: 'Cell already captured' };
  }

  cell.ownerId = user.id;
  cell.ownerName = user.username;
  cell.color = user.color;
  cell.capturedAt = Date.now();

  user.capturedBlocks += 1;

  pushActivity('capture', `${user.username} captured cell ${cellId}`);

  return { success: true, cell, user };
}

function resetGrid() {
  initGrid();
  for (const user of users.values()) {
    user.capturedBlocks = 0;
  }
  activityFeed.length = 0;
  return pushActivity('system', 'Playground was reset');
}

module.exports = {
  GRID_SIZE,
  grid,
  users,
  onlineSocketIds,
  getGridSnapshot,
  isValidCellId,
  getOrCreateUser,
  createUser,
  getOnlineUsersCount,
  pushActivity,
  getActivityFeed,
  getLeaderboard,
  captureCell,
  resetGrid,
};
