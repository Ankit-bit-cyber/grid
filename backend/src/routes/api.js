const express = require('express');
const state = require('../state');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', onlineUsers: state.getOnlineUsersCount() });
});

router.get('/grid', (req, res) => {
  res.json({
    gridSize: state.GRID_SIZE,
    cells: state.getGridSnapshot(),
  });
});

router.get('/leaderboard', (req, res) => {
  res.json(state.getLeaderboard());
});

router.get('/activity', (req, res) => {
  res.json(state.getActivityFeed());
});

module.exports = router;
