import express from 'express';
import fs from 'fs';
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from 'ws';
import deviceRouter from "./routes/deviceRoutes.js";
import { startReceiver, stopReceiver, setReceivingState } from './services/receiverService.js';

// Create upload directory if it doesn't exist
const uploadDir = '/tmp/ip-dropper-uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Make sure all middleware is set up before starting the receiver
app.use(express.json());
app.use(cors());

// Routes setup
app.use("/api/devices", deviceRouter);

// Start the receiver service with both WebSocket server and Express app
startReceiver(wss, app);

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
    stopReceiver();

    wss.close(() => {
      console.log('WebSocket server closed');
    });

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
