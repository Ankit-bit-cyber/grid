require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./src/routes/api');
const { registerSocketHandlers } = require('./src/socketHandlers');

const PORT = process.env.PORT || 5001;

// CLIENT_ORIGIN can be a single URL or a comma-separated list, e.g.
// "http://localhost:5173,http://192.168.1.20:5173"
const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// localhost and 127.0.0.1 are treated as different origins by browsers even
// though they point at the same machine, and Vite will silently move to the
// next free port (5174, 5175, ...) if 5173 is taken. Rather than make people
// debug a port/host mismatch, any localhost/127.0.0.1 origin is allowed in
// addition to whatever is explicitly configured.
const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isOriginAllowed(origin) {
  if (!origin) return true; // non-browser clients (curl, server-to-server, same-origin)
  if (configuredOrigins.includes(origin)) return true;
  if (LOCAL_DEV_ORIGIN.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

// Basic abuse prevention on the REST surface.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter, apiRoutes);

app.get('/', (req, res) => {
  res.send('GridWars backend is running. Connect via Socket.IO on this same port.');
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`GridWars backend listening on http://localhost:${PORT}`);
  console.log(`Allowing client origins: ${configuredOrigins.join(', ')} (+ any localhost/127.0.0.1 port)`);
});
