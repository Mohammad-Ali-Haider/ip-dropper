import express from "express";
import fs from "fs";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import deviceRouter from "./routes/deviceRoutes.js";
import {
  startReceiver,
  stopReceiver,
  setReceivingState,
} from "./services/receiverService.js";

// Create upload directory if it doesn't exist
const uploadDir = "/tmp/ip-dropper-uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize Express app and create HTTP server
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Configure middleware
app.use(express.json());
app.use(cors());

// Mount device-related routes under /api/devices
app.use("/api/devices", deviceRouter);

// Initialize file receiver service
startReceiver(wss, app);

// Start server on specified port or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

/**
 * Handles graceful shutdown of the server
 * - Stops the receiver service
 * - Closes WebSocket connections
 * - Shuts down HTTP server
 */
const shutdown = async () => {
  console.log("Server shutting down...");

  try {
    stopReceiver();

    wss.close(() => {
      console.log("WebSocket server closed");
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

// Register shutdown handlers for system signals
process.once("SIGINT", shutdown); // Ctrl+C
process.once("SIGTERM", shutdown); // Kill command

export { app, server };
