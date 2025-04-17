import express from "express";
import fs from "fs";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import deviceRouter from "./routes/deviceRoutes.js";
import { startReceiver, stopReceiver } from "./services/receiverService.js";
import { findAvailablePort, exportPorts } from "./utils/portUtils.js";

// Create upload directory if it doesn't exist
// Use app data directory in production, tmp in development
const isElectron = process.versions && process.versions.electron;
const uploadDir = isElectron
  ? process.env.APPDATA
    ? `${process.env.APPDATA}/ip-dropper/uploads` // Windows
    : process.platform === "darwin"
    ? `${process.env.HOME}/Library/Application Support/ip-dropper/uploads` // macOS
    : `${process.env.HOME}/.config/ip-dropper/uploads` // Linux
  : "/tmp/ip-dropper-uploads";

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

// File receiver service will be initialized after port allocation

// Start server on specified port or next available port
const DEFAULT_API_PORT = process.env.PORT || 3000;
const DEFAULT_TRANSFER_PORT = 3001;

// Initialize the server with dynamic port allocation
async function startServer() {
  try {
    // Find available ports for API and file transfer
    const apiPort = await findAvailablePort(DEFAULT_API_PORT);
    if (apiPort === -1) {
      console.error("Could not find available API port. Exiting...");
      process.exit(1);
    }

    // Always start looking for transfer port at a different number than API port
    const transferStartPort =
      apiPort === DEFAULT_TRANSFER_PORT
        ? DEFAULT_TRANSFER_PORT + 1
        : DEFAULT_TRANSFER_PORT;

    const transferPort = await findAvailablePort(transferStartPort);
    if (transferPort === -1) {
      console.error("Could not find available transfer port. Exiting...");
      process.exit(1);
    }

    // Export ports for other processes to use
    exportPorts({ apiPort, transferPort });

    // Start the receiver service with the transfer port
    startReceiver(wss, app, transferPort);

    // Set up error handler before starting the server
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${apiPort} is already in use, trying next port...`);
        // Try the next port
        const nextPort = apiPort + 1;
        console.log(`Attempting to use port ${nextPort}`);

        // Update environment variables
        process.env.API_PORT = nextPort.toString();

        // Export the new ports
        exportPorts({
          apiPort: nextPort,
          transferPort: process.env.TRANSFER_PORT || transferPort,
        });

        // Try to listen on the new port
        server.listen(nextPort, () => {
          console.log(`Server running on port ${nextPort}`);
          console.log(
            `Note: Using alternative port ${nextPort} because default port ${apiPort} was in use`
          );
        });
      } else {
        console.error("Server error:", error);
        process.exit(1);
      }
    });

    // Start the server on the default port
    console.log(`Attempting to start server on port ${apiPort}...`);
    server.listen(apiPort, () => {
      console.log(`Server running on port ${apiPort}`);

      // Update environment variables
      process.env.API_PORT = apiPort.toString();

      // Export the ports
      exportPorts({
        apiPort,
        transferPort: process.env.TRANSFER_PORT || transferPort,
      });
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Global error handler
app.use((err, _req, res, _next) => {
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
