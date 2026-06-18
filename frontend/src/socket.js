import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';
const STORAGE_KEY = 'gridwars_user_id';

function getStoredUserId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeUserId(userId) {
  try {
    localStorage.setItem(STORAGE_KEY, userId);
  } catch {
    // localStorage unavailable (private browsing, etc.) — game still works,
    // it just won't remember the player across a refresh.
  }
}

export const socket = io(SERVER_URL, {
  autoConnect: false,
  auth: { userId: getStoredUserId() },
});
