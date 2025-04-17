/**
 * File transfer controller for sending files to target devices
 * @module controllers/sendFile
 */

import net from "net";
import { pipeline } from "stream/promises";
import { createReadStream } from "fs";
import { WebSocket } from "ws";

// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 5000;

/**
 * Handles file transfer to a target device over TCP with WebSocket notifications
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.ip - Target device IP address
 * @param {Object} req.file - Uploaded file object from multer middleware
 * @param {Object} req.app.locals.wss - WebSocket server instance
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with transfer status
 */
export async function sendFile(req, res) {
  const { ip } = req.params;
  const file = req.file;
  let socket;

  // Get current machine's network interfaces
  const os = await import("os");
  const interfaces = os.networkInterfaces();
  const localIPs = Object.values(interfaces)
    .flat()
    .filter((iface) => iface?.family === "IPv4")
    .map((iface) => iface?.address);

  /**
   * Broadcasts file transfer status to all connected WebSocket clients
   * @param {string} status - Transfer status ('completed' or 'failed')
   * @param {string|null} error - Error message if transfer failed
   */
  const notifyClients = (status, error = null) => {
    if (req.app.locals.wss) {
      req.app.locals.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "fileTransfer",
              status,
              fileName: file?.originalname || req.body.fileName || "unknown",
              targetIp: ip,
              error: error,
            })
          );
        }
      });
    }
  };

  // Validate file presence
  if (!file) {
    const error = "No file provided";
    notifyClients("failed", error);
    return res.status(400).json({ error });
  }

  try {
    socket = new net.Socket();

    // Set up connection promise with timeout and error handling
    const connectionPromise = new Promise((resolve, reject) => {
      socket.on("error", (error) => {
        let errorMessage = "Connection failed";
        const transferPort = process.env.TRANSFER_PORT || 3001;
        if (error.code === "ECONNREFUSED") {
          errorMessage = `Target device (${ip}) is not accepting connections on port ${transferPort}. Make sure the receiving service is running on the target device.`;
        } else if (error.code === "EHOSTUNREACH") {
          errorMessage = `Target device (${ip}) is unreachable. Check if the device is on the network.`;
        } else if (error.code === "ERR_STREAM_PREMATURE_CLOSE") {
          errorMessage = `Target device (${ip}) rejected the connection. Check if file receiving is enabled on the target device.`;
        }
        reject(new Error(errorMessage));
      });

      const transferPort = process.env.TRANSFER_PORT || 3001;
      socket.connect(transferPort, ip, () => {
        resolve();
      });

      setTimeout(() => {
        reject(
          new Error(
            `Connection to ${ip}:${transferPort} timed out. Check if the target device is available.`
          )
        );
      }, CONNECTION_TIMEOUT);
    });

    await connectionPromise;

    // Send file metadata before the actual file
    const fileMetadata = {
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      deviceName: os.hostname(),
    };

    socket.write(JSON.stringify(fileMetadata) + "\n");

    // Stream the file to the target device
    const fileStream = createReadStream(file.path);
    await pipeline(fileStream, socket);

    notifyClients("completed");

    return res.json({
      message: "File transfer completed successfully",
      timestamp: new Date().toISOString(),
      targetIp: ip,
      status: "completed",
    });
  } catch (error) {
    if (socket) {
      socket.destroy();
    }

    console.error("Transfer error:", error);
    notifyClients("failed", error.message);

    return res.status(503).json({
      error: "File transfer failed",
      details: error.message,
    });
  }
}
