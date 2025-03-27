import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from 'ws';
import deviceRouter from "./routes/deviceRoutes.js";
import { startReceiver, stopReceiver } from './services/receiverService.js';

// Create upload directory if it doesn't exist
const uploadDir = '/tmp/ip-dropper-uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send initial connection confirmation
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
});

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'receiver':
      handleReceiverControl(data.action);
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    default:
      console.log('Received message:', data);
  }
}

function handleReceiverControl(action) {
  switch (action) {
    case 'start':
      startReceiver(wss);
      break;
    case 'stop':
      stopReceiver();
      break;
    default:
      console.log('Unknown receiver action:', action);
  }
}

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Routes
app.use("/api/devices", deviceRouter);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Server shutting down...");

  try {
    // Stop the receiver
    stopReceiver();

    // Close all WebSocket connections
    wss.close(() => {
      console.log('WebSocket server closed');
    });

    // Wait for cleanup to complete
    console.log("Device cleanup completed");

    // Close server after cleanup
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Use once to prevent multiple shutdown attempts
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

export { app, server };
